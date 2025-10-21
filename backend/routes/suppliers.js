const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all suppliers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.query;
    const suppliers = await prisma.supplier.findMany({
      where: { organizationId }
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Create supplier
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId, name, email, phone, gstin, address, city, state, pincode } = req.body;

    const supplier = await prisma.supplier.create({
      data: {
        organizationId,
        name,
        email,
        phone,
        gstin,
        address,
        city,
        state,
        pincode
      }
    });

    res.status(201).json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// Get supplier details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// Update supplier
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// Delete supplier
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.supplier.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

module.exports = router;

