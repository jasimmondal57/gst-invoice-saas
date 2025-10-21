const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Get all purchase orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { status, supplierId } = req.query;

    const where = { organizationId };
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        user: { select: { firstName: true, lastName: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

// Get single purchase order
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { id } = req.params;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { include: { product: true } },
      },
    });

    if (!purchaseOrder || purchaseOrder.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.json(purchaseOrder);
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
});

// Create purchase order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId, userId, supplierId, poDate, expectedDeliveryDate, items, notes } = req.body;

    if (!supplierId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Supplier and items are required' });
    }

    // Generate PO number
    const lastPO = await prisma.purchaseOrder.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    const poNumber = `PO-${Date.now()}`;

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;

    items.forEach((item) => {
      const itemAmount = item.quantity * item.rate;
      const itemTax = itemAmount * (item.gstRate / 100);
      subtotal += itemAmount;
      taxAmount += itemTax;
    });

    const totalAmount = subtotal + taxAmount;

    // Create purchase order
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        organizationId,
        supplierId,
        userId,
        poNumber,
        poDate: new Date(poDate),
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        subtotal,
        taxAmount,
        totalAmount,
        notes,
        status: 'DRAFT',
        items: {
          create: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            rate: item.rate,
            gstRate: item.gstRate || 18,
            amount: item.quantity * item.rate,
            productId: item.productId,
          })),
        },
      },
      include: {
        supplier: true,
        items: true,
      },
    });

    res.status(201).json(purchaseOrder);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Failed to create purchase order', details: error.message });
  }
});

// Update purchase order
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { organizationId, userId } = req.body;
    const { id } = req.params;
    const { status, expectedDeliveryDate, notes, items } = req.body;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!purchaseOrder || purchaseOrder.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    // Calculate new totals if items changed
    let subtotal = purchaseOrder.subtotal;
    let taxAmount = purchaseOrder.taxAmount;

    if (items) {
      subtotal = 0;
      taxAmount = 0;
      items.forEach((item) => {
        const itemAmount = item.quantity * item.rate;
        const itemTax = itemAmount * (item.gstRate / 100);
        subtotal += itemAmount;
        taxAmount += itemTax;
      });
    }

    const totalAmount = subtotal + taxAmount;

    // Update purchase order
    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
        notes,
        subtotal,
        taxAmount,
        totalAmount,
      },
      include: {
        supplier: true,
        items: true,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ error: 'Failed to update purchase order' });
  }
});

// Confirm purchase order (change status to CONFIRMED)
router.put('/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { id } = req.params;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!purchaseOrder || purchaseOrder.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: { supplier: true, items: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error confirming purchase order:', error);
    res.status(500).json({ error: 'Failed to confirm purchase order' });
  }
});

// Receive purchase order (change status to RECEIVED and update inventory)
router.put('/:id/receive', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { id } = req.params;
    const { items } = req.body;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!purchaseOrder || purchaseOrder.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    // Update inventory for each item
    if (items) {
      for (const item of items) {
        if (item.productId && item.receivedQuantity > 0) {
          // Update inventory
          const inventory = await prisma.inventory.findUnique({
            where: { productId: item.productId },
          });

          if (inventory) {
            await prisma.inventory.update({
              where: { productId: item.productId },
              data: {
                quantity: inventory.quantity + item.receivedQuantity,
                lastRestockDate: new Date(),
              },
            });

            // Log stock movement
            await prisma.stockMovement.create({
              data: {
                organizationId,
                productId: item.productId,
                type: 'PURCHASE',
                quantity: item.receivedQuantity,
                reference: purchaseOrder.poNumber,
                notes: `Received from PO ${purchaseOrder.poNumber}`,
              },
            });
          }
        }
      }
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'RECEIVED' },
      include: { supplier: true, items: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error receiving purchase order:', error);
    res.status(500).json({ error: 'Failed to receive purchase order' });
  }
});

// Delete purchase order
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { id } = req.params;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!purchaseOrder || purchaseOrder.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    await prisma.purchaseOrder.delete({
      where: { id },
    });

    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({ error: 'Failed to delete purchase order' });
  }
});

module.exports = router;

