const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ===== BOM (Bill of Materials) Routes =====

// Get all BOMs
router.get('/bom', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.query;
    const boms = await prisma.bOM.findMany({
      where: { organizationId },
      include: { product: true, items: { include: { product: true } } }
    });
    res.json(boms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch BOMs' });
  }
});

// Create BOM
router.post('/bom', authMiddleware, async (req, res) => {
  try {
    const { organizationId, productId, name, description, items } = req.body;

    const bom = await prisma.bOM.create({
      data: {
        organizationId,
        productId,
        name,
        description,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      include: { product: true, items: { include: { product: true } } }
    });

    res.status(201).json(bom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create BOM' });
  }
});

// Get BOM details
router.get('/bom/:id', authMiddleware, async (req, res) => {
  try {
    const bom = await prisma.bOM.findUnique({
      where: { id: req.params.id },
      include: { product: true, items: { include: { product: true } } }
    });

    if (!bom) {
      return res.status(404).json({ error: 'BOM not found' });
    }

    res.json(bom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch BOM' });
  }
});

// Update BOM
router.put('/bom/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, items } = req.body;

    // Delete existing items
    await prisma.bOMItem.deleteMany({
      where: { bomId: req.params.id }
    });

    // Update BOM and create new items
    const bom = await prisma.bOM.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      include: { product: true, items: { include: { product: true } } }
    });

    res.json(bom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update BOM' });
  }
});

// Delete BOM
router.delete('/bom/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.bOM.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'BOM deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete BOM' });
  }
});

// ===== Production Order Routes =====

// Get all production orders
router.get('/production-orders', authMiddleware, async (req, res) => {
  try {
    const { organizationId, status } = req.query;
    const orders = await prisma.productionOrder.findMany({
      where: {
        organizationId,
        status: status || undefined
      },
      include: { bom: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch production orders' });
  }
});

// Create production order
router.post('/production-orders', authMiddleware, async (req, res) => {
  try {
    const { organizationId, bomId, quantity, notes } = req.body;

    // Generate order number
    const lastOrder = await prisma.productionOrder.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });

    const orderNumber = `PO-${Date.now()}`;

    const order = await prisma.productionOrder.create({
      data: {
        organizationId,
        bomId,
        orderNumber,
        quantity,
        notes,
        status: 'DRAFT'
      },
      include: { bom: { include: { product: true } } }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create production order' });
  }
});

// Get production order details
router.get('/production-orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await prisma.productionOrder.findUnique({
      where: { id: req.params.id },
      include: { bom: { include: { product: true, items: { include: { product: true } } } } }
    });

    if (!order) {
      return res.status(404).json({ error: 'Production order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch production order' });
  }
});

// Update production order status
router.put('/production-orders/:id', authMiddleware, async (req, res) => {
  try {
    const { status, startDate, endDate, notes } = req.body;

    const order = await prisma.productionOrder.update({
      where: { id: req.params.id },
      data: {
        status: status !== undefined ? status : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        notes: notes !== undefined ? notes : undefined
      },
      include: { bom: { include: { product: true } } }
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update production order' });
  }
});

// Delete production order
router.delete('/production-orders/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.productionOrder.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Production order deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete production order' });
  }
});

// Get production summary
router.get('/production-summary/:organizationId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.params;

    const orders = await prisma.productionOrder.findMany({
      where: { organizationId }
    });

    const summary = {
      totalOrders: orders.length,
      draftOrders: orders.filter(o => o.status === 'DRAFT').length,
      plannedOrders: orders.filter(o => o.status === 'PLANNED').length,
      inProgressOrders: orders.filter(o => o.status === 'IN_PROGRESS').length,
      completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
      cancelledOrders: orders.filter(o => o.status === 'CANCELLED').length
    };

    res.json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch production summary' });
  }
});

module.exports = router;

