const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
console.log('Creating Prisma client for invoices...');
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
console.log('Prisma client created for invoices');

// Generate next invoice number
router.get('/generate-number/:organizationId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.params;

    // Fetch organization settings
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Get the last invoice for this organization
    const lastInvoice = await prisma.invoice.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });

    // Extract prefix and starting number from organization settings
    const prefix = organization.invoicePrefix || 'INV-';
    const startNumber = organization.invoiceStartNumber || 1;

    // Calculate next number
    let nextNumber = startNumber;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }

    const nextInvoiceNumber = `${prefix}${String(nextNumber).padStart(5, '0')}`;

    res.json({ invoiceNumber: nextInvoiceNumber, nextNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate invoice number' });
  }
});

// Get all invoices for organization
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('GET /invoices called');
    const { organizationId, status } = req.query;
    console.log('Query params:', { organizationId, status });

    const where = { organizationId };
    if (status) where.status = status;

    console.log('Fetching invoices with where:', where);
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        items: true,
        eInvoice: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('Found invoices:', invoices.length);
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices', details: error.message });
  }
});

// Create invoice
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('Invoice creation request received:', req.body);
    const { organizationId, customerId, invoiceNumber, invoiceDate, items } = req.body;

    // Validation
    if (!organizationId || !customerId || !invoiceNumber || !invoiceDate || !items || items.length === 0) {
      console.error('Validation failed:', { organizationId, customerId, invoiceNumber, invoiceDate, items });
      return res.status(400).json({ error: 'Missing required fields: organizationId, customerId, invoiceNumber, invoiceDate, items' });
    }

    // Get customer to determine invoice type
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      console.error('Customer not found:', customerId);
      return res.status(404).json({ error: 'Customer not found' });
    }

    console.log('Customer found:', customer.id, customer.type);

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    // Calculate totals and add amount to each item
    const itemsWithAmount = items.map(item => {
      const itemAmount = item.quantity * item.rate;
      const itemTax = itemAmount * (item.gstRate / 100);
      subtotal += itemAmount;
      taxAmount += itemTax;

      // Only include fields that exist in InvoiceItem model
      return {
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        gstRate: item.gstRate,
        amount: itemAmount,
        // Optional fields
        ...(item.productId && { productId: item.productId })
      };
    });

    const totalAmount = subtotal + taxAmount;

    console.log('Creating invoice with totals:', { subtotal, taxAmount, totalAmount });
    console.log('Items with amounts:', itemsWithAmount);

    const invoice = await prisma.invoice.create({
      data: {
        organizationId,
        customerId,
        userId: req.user.id,
        invoiceNumber,
        invoiceDate: new Date(invoiceDate),
        invoiceType: customer.type,
        subtotal,
        taxAmount,
        totalAmount,
        items: {
          create: itemsWithAmount
        }
      },
      include: {
        customer: true,
        items: true
      }
    });

    console.log('Invoice created successfully:', invoice.id);
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Invoice creation error:', error);
    console.error('Error stack:', error.stack);

    // Provide more specific error messages
    let errorMessage = 'Failed to create invoice';
    if (error.message.includes('Unique constraint failed')) {
      errorMessage = 'Invoice number already exists for this organization';
    } else if (error.message.includes('Foreign key constraint failed')) {
      errorMessage = 'Invalid customer or organization ID';
    } else if (error.message.includes('required')) {
      errorMessage = 'Missing required fields: ' + error.message;
    }

    res.status(500).json({
      error: errorMessage,
      details: error.message,
      code: error.code
    });
  }
});

// Get invoice details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: true,
        eInvoice: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Update invoice
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { invoiceDate, status, items } = req.body;

    // Build update data - only include fields that should be updated
    const updateData = {};

    if (status) {
      updateData.status = status;
    }

    if (invoiceDate) {
      // Convert date string to ISO-8601 DateTime
      updateData.invoiceDate = new Date(invoiceDate);
    }

    // Update invoice
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        customer: true,
        items: true
      }
    });

    // If items are provided, update them
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.id) {
          // Update existing item - only update editable fields
          await prisma.invoiceItem.update({
            where: { id: item.id },
            data: {
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              gstRate: item.gstRate,
              amount: item.quantity * item.rate
            }
          });
        }
      }

      // Fetch updated invoice with items
      const updatedInvoice = await prisma.invoice.findUnique({
        where: { id: req.params.id },
        include: {
          customer: true,
          items: true
        }
      });

      return res.json(updatedInvoice);
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice', details: error.message });
  }
});

// Delete invoice
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.invoice.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

module.exports = router;

