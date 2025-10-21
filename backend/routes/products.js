const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all products with inventory
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.query;
    if (!organizationId) {
      return res.status(400).json({ error: 'organizationId is required' });
    }

    const products = await prisma.product.findMany({
      where: { organizationId },
      include: {
        inventory: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

// Create product with inventory
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId, name, description, hsn, sac, unit, price, gstRate, barcode, lowStockAlert, openingStock } = req.body;

    if (!organizationId || !name || price === undefined) {
      return res.status(400).json({ error: 'organizationId, name, and price are required' });
    }

    const product = await prisma.product.create({
      data: {
        organizationId,
        name,
        description,
        hsn,
        sac,
        unit: unit || 'Nos',
        price: parseFloat(price),
        gstRate: parseFloat(gstRate) || 18,
        barcode,
        lowStockAlert: parseFloat(lowStockAlert) || 10,
        inventory: {
          create: {
            organizationId,
            quantity: parseFloat(openingStock) || 0,
            reorderLevel: 10,
            reorderQuantity: 50
          }
        }
      },
      include: {
        inventory: true
      }
    });

    // Log opening stock movement
    if (openingStock && parseFloat(openingStock) > 0) {
      await prisma.stockMovement.create({
        data: {
          organizationId,
          productId: product.id,
          type: 'OPENING_STOCK',
          quantity: parseFloat(openingStock),
          notes: 'Opening stock'
        }
      });
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

// Get product with inventory details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        inventory: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product', details: error.message });
  }
});

// Update product
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, hsn, sac, unit, price, gstRate, barcode, lowStockAlert } = req.body;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(hsn && { hsn }),
        ...(sac && { sac }),
        ...(unit && { unit }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(gstRate !== undefined && { gstRate: parseFloat(gstRate) }),
        ...(barcode && { barcode }),
        ...(lowStockAlert !== undefined && { lowStockAlert: parseFloat(lowStockAlert) })
      },
      include: {
        inventory: true
      }
    });
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product', details: error.message });
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product', details: error.message });
  }
});

// Update inventory stock
router.put('/:id/inventory', authMiddleware, async (req, res) => {
  try {
    const { organizationId, quantity, type, notes } = req.body;

    if (quantity === undefined || !type) {
      return res.status(400).json({ error: 'quantity and type are required' });
    }

    // Get current inventory
    const inventory = await prisma.inventory.findUnique({
      where: { productId: req.params.id }
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    // Calculate new quantity
    let newQuantity = inventory.quantity;
    if (type === 'ADD') {
      newQuantity += parseFloat(quantity);
    } else if (type === 'SUBTRACT') {
      newQuantity -= parseFloat(quantity);
    } else if (type === 'SET') {
      newQuantity = parseFloat(quantity);
    }

    // Prevent negative stock
    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Update inventory
    const updated = await prisma.inventory.update({
      where: { productId: req.params.id },
      data: {
        quantity: newQuantity,
        lastRestockDate: new Date()
      }
    });

    // Log stock movement
    await prisma.stockMovement.create({
      data: {
        organizationId: organizationId || inventory.organizationId,
        productId: req.params.id,
        type: type,
        quantity: parseFloat(quantity),
        notes
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ error: 'Failed to update inventory', details: error.message });
  }
});

module.exports = router;

