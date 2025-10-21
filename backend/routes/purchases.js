const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all purchases for organization
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId, status } = req.query;

    const where = { organizationId };
    if (status) where.status = status;

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        supplier: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(purchases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// Generate next purchase number
router.get('/generate-number/:organizationId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const lastPurchase = await prisma.purchase.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });

    const prefix = 'PO-';
    const startNumber = 1;
    let nextNumber = startNumber;

    if (lastPurchase && lastPurchase.purchaseNumber) {
      const match = lastPurchase.purchaseNumber.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }

    const nextPurchaseNumber = `${prefix}${String(nextNumber).padStart(5, '0')}`;

    res.json({ purchaseNumber: nextPurchaseNumber, nextNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate purchase number' });
  }
});

// Create purchase
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId, supplierId, purchaseNumber, purchaseDate, purchaseType, items } = req.body;

    let subtotal = 0;
    let taxAmount = 0;

    items.forEach(item => {
      const itemAmount = item.quantity * item.rate;
      const itemTax = itemAmount * (item.gstRate / 100);
      subtotal += itemAmount;
      taxAmount += itemTax;
    });

    const totalAmount = subtotal + taxAmount;

    const purchase = await prisma.purchase.create({
      data: {
        organizationId,
        supplierId,
        userId: req.user.id,
        purchaseNumber,
        purchaseDate: new Date(purchaseDate),
        purchaseType: purchaseType || 'INVOICE',
        subtotal,
        taxAmount,
        totalAmount,
        status: 'DRAFT',
        items: {
          create: items
        }
      },
      include: {
        supplier: true,
        items: true
      }
    });

    res.status(201).json(purchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create purchase' });
  }
});

// Get purchase details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: req.params.id },
      include: {
        supplier: true,
        items: true
      }
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.json(purchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch purchase' });
  }
});

// Update purchase
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const purchase = await prisma.purchase.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        supplier: true,
        items: true
      }
    });

    res.json(purchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update purchase' });
  }
});

// Delete purchase
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.purchase.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete purchase' });
  }
});

// Get all suppliers
router.get('/suppliers/list/:organizationId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.params;

    const suppliers = await prisma.supplier.findMany({
      where: { organizationId }
    });

    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

module.exports = router;

