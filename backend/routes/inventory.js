const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get inventory for organization
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.query;
    const inventory = await prisma.inventory.findMany({
      where: { organizationId },
      include: { product: true }
    });
    res.json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get low stock items
router.get('/low-stock/:organizationId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        organizationId,
        quantity: {
          lte: prisma.raw('reorderLevel')
        }
      },
      include: { product: true }
    });
    res.json(lowStockItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

// Get inventory for product
router.get('/:productId', authMiddleware, async (req, res) => {
  try {
    const inventory = await prisma.inventory.findUnique({
      where: { productId: req.params.productId },
      include: { product: true }
    });
    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }
    res.json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Update inventory
router.put('/:productId', authMiddleware, async (req, res) => {
  try {
    const { quantity, reorderLevel, reorderQuantity } = req.body;
    const inventory = await prisma.inventory.update({
      where: { productId: req.params.productId },
      data: {
        quantity: quantity !== undefined ? quantity : undefined,
        reorderLevel: reorderLevel !== undefined ? reorderLevel : undefined,
        reorderQuantity: reorderQuantity !== undefined ? reorderQuantity : undefined
      },
      include: { product: true }
    });
    res.json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

// Record stock movement
router.post('/movement/record', authMiddleware, async (req, res) => {
  try {
    const { organizationId, productId, type, quantity, reference, notes } = req.body;

    // Record movement
    const movement = await prisma.stockMovement.create({
      data: {
        organizationId,
        productId,
        type,
        quantity,
        reference,
        notes
      }
    });

    // Update inventory
    const inventory = await prisma.inventory.findUnique({
      where: { productId }
    });

    if (inventory) {
      let newQuantity = inventory.quantity;
      if (type === 'PURCHASE' || type === 'OPENING_STOCK' || type === 'RETURN') {
        newQuantity += quantity;
      } else if (type === 'SALE' || type === 'DAMAGE') {
        newQuantity -= quantity;
      } else if (type === 'ADJUSTMENT') {
        newQuantity = quantity;
      }

      await prisma.inventory.update({
        where: { productId },
        data: { quantity: newQuantity }
      });
    }

    res.status(201).json(movement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record stock movement' });
  }
});

// Get stock movements for product
router.get('/movements/:productId', authMiddleware, async (req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: { productId: req.params.productId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(movements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
});

module.exports = router;

