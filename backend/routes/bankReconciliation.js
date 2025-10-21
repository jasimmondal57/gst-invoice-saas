const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Get all bank reconciliations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { status } = req.query;

    const where = { organizationId };
    if (status) where.status = status;

    const reconciliations = await prisma.bankReconciliation.findMany({
      where,
      include: { transactions: true },
      orderBy: { statementDate: 'desc' },
    });

    res.json(reconciliations);
  } catch (error) {
    console.error('Error fetching reconciliations:', error);
    res.status(500).json({ error: 'Failed to fetch reconciliations' });
  }
});

// Get single reconciliation
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { id } = req.params;

    const reconciliation = await prisma.bankReconciliation.findUnique({
      where: { id },
      include: { transactions: true },
    });

    if (!reconciliation || reconciliation.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Reconciliation not found' });
    }

    res.json(reconciliation);
  } catch (error) {
    console.error('Error fetching reconciliation:', error);
    res.status(500).json({ error: 'Failed to fetch reconciliation' });
  }
});

// Create bank reconciliation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId, bankAccount, statementDate, openingBalance, closingBalance, notes } = req.body;

    if (!bankAccount || !statementDate) {
      return res.status(400).json({ error: 'Bank account and statement date are required' });
    }

    const reconciliation = await prisma.bankReconciliation.create({
      data: {
        organizationId,
        bankAccount,
        statementDate: new Date(statementDate),
        openingBalance,
        closingBalance,
        notes,
        status: 'PENDING',
      },
    });

    res.status(201).json(reconciliation);
  } catch (error) {
    console.error('Error creating reconciliation:', error);
    res.status(500).json({ error: 'Failed to create reconciliation' });
  }
});

// Add transaction to reconciliation
router.post('/:id/transactions', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { id } = req.params;
    const { transactionDate, description, amount, type, referenceNo } = req.body;

    const reconciliation = await prisma.bankReconciliation.findUnique({
      where: { id },
    });

    if (!reconciliation || reconciliation.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Reconciliation not found' });
    }

    const transaction = await prisma.bankTransaction.create({
      data: {
        reconciliationId: id,
        transactionDate: new Date(transactionDate),
        description,
        amount,
        type,
        referenceNo,
      },
    });

    // Update reconciliation totals
    const allTransactions = await prisma.bankTransaction.findMany({
      where: { reconciliationId: id },
    });

    let totalDeposits = 0;
    let totalWithdrawals = 0;

    allTransactions.forEach((t) => {
      if (t.type === 'DEPOSIT' || t.type === 'TRANSFER' || t.type === 'INTEREST') {
        totalDeposits += t.amount;
      } else {
        totalWithdrawals += t.amount;
      }
    });

    await prisma.bankReconciliation.update({
      where: { id },
      data: {
        totalDeposits,
        totalWithdrawals,
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

// Match transaction with payment
router.put('/:id/transactions/:transactionId/match', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { id, transactionId } = req.params;
    const { paymentId } = req.body;

    const reconciliation = await prisma.bankReconciliation.findUnique({
      where: { id },
    });

    if (!reconciliation || reconciliation.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Reconciliation not found' });
    }

    const transaction = await prisma.bankTransaction.update({
      where: { id: transactionId },
      data: {
        matched: true,
        matchedPaymentId: paymentId,
      },
    });

    res.json(transaction);
  } catch (error) {
    console.error('Error matching transaction:', error);
    res.status(500).json({ error: 'Failed to match transaction' });
  }
});

// Complete reconciliation
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { id } = req.params;

    const reconciliation = await prisma.bankReconciliation.findUnique({
      where: { id },
      include: { transactions: true },
    });

    if (!reconciliation || reconciliation.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Reconciliation not found' });
    }

    // Check if all transactions are matched
    const unmatchedCount = reconciliation.transactions.filter((t) => !t.matched).length;

    const updated = await prisma.bankReconciliation.update({
      where: { id },
      data: {
        status: unmatchedCount === 0 ? 'COMPLETED' : 'DISCREPANCY',
      },
      include: { transactions: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error completing reconciliation:', error);
    res.status(500).json({ error: 'Failed to complete reconciliation' });
  }
});

// Delete reconciliation
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { id } = req.params;

    const reconciliation = await prisma.bankReconciliation.findUnique({
      where: { id },
    });

    if (!reconciliation || reconciliation.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Reconciliation not found' });
    }

    await prisma.bankReconciliation.delete({
      where: { id },
    });

    res.json({ message: 'Reconciliation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reconciliation:', error);
    res.status(500).json({ error: 'Failed to delete reconciliation' });
  }
});

module.exports = router;

