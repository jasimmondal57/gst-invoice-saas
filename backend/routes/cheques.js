const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Get all cheques
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { status } = req.query;

    const where = { organizationId };
    if (status) where.status = status;

    const cheques = await prisma.cheque.findMany({
      where,
      orderBy: { chequeDate: 'desc' },
    });

    res.json(cheques);
  } catch (error) {
    console.error('Error fetching cheques:', error);
    res.status(500).json({ error: 'Failed to fetch cheques' });
  }
});

// Get single cheque
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { id } = req.params;

    const cheque = await prisma.cheque.findUnique({
      where: { id },
    });

    if (!cheque || cheque.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Cheque not found' });
    }

    res.json(cheque);
  } catch (error) {
    console.error('Error fetching cheque:', error);
    res.status(500).json({ error: 'Failed to fetch cheque' });
  }
});

// Create cheque
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId, chequeNumber, chequeDate, amount, bankName, paymentId, notes } = req.body;

    if (!chequeNumber || !chequeDate || !amount || !bankName) {
      return res.status(400).json({ error: 'Cheque number, date, amount, and bank name are required' });
    }

    // Check if cheque number already exists
    const existingCheque = await prisma.cheque.findFirst({
      where: {
        organizationId,
        chequeNumber,
      },
    });

    if (existingCheque) {
      return res.status(400).json({ error: 'Cheque number already exists' });
    }

    const cheque = await prisma.cheque.create({
      data: {
        organizationId,
        chequeNumber,
        chequeDate: new Date(chequeDate),
        amount,
        bankName,
        paymentId,
        notes,
        status: 'ISSUED',
      },
    });

    res.status(201).json(cheque);
  } catch (error) {
    console.error('Error creating cheque:', error);
    res.status(500).json({ error: 'Failed to create cheque', details: error.message });
  }
});

// Update cheque status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ISSUED', 'DEPOSITED', 'CLEARED', 'BOUNCED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const cheque = await prisma.cheque.findUnique({
      where: { id },
    });

    if (!cheque || cheque.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Cheque not found' });
    }

    const updated = await prisma.cheque.update({
      where: { id },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating cheque:', error);
    res.status(500).json({ error: 'Failed to update cheque' });
  }
});

// Update cheque
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { id } = req.params;
    const { chequeDate, amount, bankName, notes } = req.body;

    const cheque = await prisma.cheque.findUnique({
      where: { id },
    });

    if (!cheque || cheque.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Cheque not found' });
    }

    const updated = await prisma.cheque.update({
      where: { id },
      data: {
        chequeDate: chequeDate ? new Date(chequeDate) : undefined,
        amount,
        bankName,
        notes,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating cheque:', error);
    res.status(500).json({ error: 'Failed to update cheque' });
  }
});

// Get cheque summary
router.get('/summary/stats', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;

    const cheques = await prisma.cheque.findMany({
      where: { organizationId },
    });

    const summary = {
      totalCheques: cheques.length,
      issuedCount: cheques.filter((c) => c.status === 'ISSUED').length,
      depositedCount: cheques.filter((c) => c.status === 'DEPOSITED').length,
      clearedCount: cheques.filter((c) => c.status === 'CLEARED').length,
      bouncedCount: cheques.filter((c) => c.status === 'BOUNCED').length,
      cancelledCount: cheques.filter((c) => c.status === 'CANCELLED').length,
      totalAmount: cheques.reduce((sum, c) => sum + c.amount, 0),
      clearedAmount: cheques
        .filter((c) => c.status === 'CLEARED')
        .reduce((sum, c) => sum + c.amount, 0),
      pendingAmount: cheques
        .filter((c) => c.status === 'ISSUED' || c.status === 'DEPOSITED')
        .reduce((sum, c) => sum + c.amount, 0),
      bouncedAmount: cheques
        .filter((c) => c.status === 'BOUNCED')
        .reduce((sum, c) => sum + c.amount, 0),
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching cheque summary:', error);
    res.status(500).json({ error: 'Failed to fetch cheque summary' });
  }
});

// Delete cheque
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { id } = req.params;

    const cheque = await prisma.cheque.findUnique({
      where: { id },
    });

    if (!cheque || cheque.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Cheque not found' });
    }

    await prisma.cheque.delete({
      where: { id },
    });

    res.json({ message: 'Cheque deleted successfully' });
  } catch (error) {
    console.error('Error deleting cheque:', error);
    res.status(500).json({ error: 'Failed to delete cheque' });
  }
});

module.exports = router;

