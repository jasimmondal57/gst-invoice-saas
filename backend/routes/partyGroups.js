const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all party groups
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.query;
    const groups = await prisma.partyGroup.findMany({
      where: { organizationId },
      include: {
        customers: true,
        suppliers: true
      }
    });
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch party groups' });
  }
});

// Create party group
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId, name, description } = req.body;

    const group = await prisma.partyGroup.create({
      data: {
        organizationId,
        name,
        description
      }
    });

    res.status(201).json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create party group' });
  }
});

// Get party group details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await prisma.partyGroup.findUnique({
      where: { id: req.params.id },
      include: {
        customers: true,
        suppliers: true
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Party group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch party group' });
  }
});

// Update party group
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    const group = await prisma.partyGroup.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined
      },
      include: {
        customers: true,
        suppliers: true
      }
    });

    res.json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update party group' });
  }
});

// Delete party group
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.partyGroup.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Party group deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete party group' });
  }
});

module.exports = router;

