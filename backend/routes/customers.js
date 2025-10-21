const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all customers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.query;
    const customers = await prisma.customer.findMany({
      where: { organizationId }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Create customer
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId, name, email, phone, type, gstin, address, city, state, pincode, partyGroupId } = req.body;

    // Validation
    if (!organizationId || !name) {
      return res.status(400).json({ error: 'organizationId and name are required' });
    }

    // For B2B customers, GSTIN is required
    if (type === 'B2B' && !gstin) {
      return res.status(400).json({ error: 'GSTIN is required for B2B customers' });
    }

    const customer = await prisma.customer.create({
      data: {
        organizationId,
        name,
        email,
        phone,
        type: type || 'B2B',
        gstin: type === 'B2C' ? null : gstin,
        address,
        city,
        state,
        pincode,
        partyGroupId
      }
    });
    res.status(201).json(customer);
  } catch (error) {
    console.error('Customer creation error:', error);
    res.status(500).json({ error: 'Failed to create customer', details: error.message });
  }
});

// Get customer
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id }
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Update customer
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router;

