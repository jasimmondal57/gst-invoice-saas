const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// ===== CHART OF ACCOUNTS =====

// Create account
router.post('/accounts', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { code, name, type, subType, description, openingBalance } = req.body;

    const account = await prisma.chartOfAccounts.create({
      data: {
        organizationId,
        code,
        name,
        type,
        subType,
        description,
        openingBalance: openingBalance || 0,
      },
    });

    res.status(201).json(account);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Get all accounts
router.get('/accounts', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { type } = req.query;

    const where: any = { organizationId };
    if (type) where.type = type;

    const accounts = await prisma.chartOfAccounts.findMany({
      where,
      orderBy: { code: 'asc' },
    });

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Get account by ID
router.get('/accounts/:accountId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { accountId } = req.params;

    const account = await prisma.chartOfAccounts.findUnique({
      where: { id: accountId },
      include: { ledgerEntries: true },
    });

    if (!account || account.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

// Update account
router.put('/accounts/:accountId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { accountId } = req.params;
    const { name, subType, description, openingBalance, status } = req.body;

    const account = await prisma.chartOfAccounts.findUnique({
      where: { id: accountId },
    });

    if (!account || account.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const updated = await prisma.chartOfAccounts.update({
      where: { id: accountId },
      data: {
        name: name || account.name,
        subType: subType || account.subType,
        description: description || account.description,
        openingBalance: openingBalance !== undefined ? openingBalance : account.openingBalance,
        status: status || account.status,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// ===== JOURNAL ENTRIES =====

// Create journal entry
router.post('/journal-entries', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { entryDate, description, referenceNo, lines } = req.body;

    // Generate entry number
    const lastEntry = await prisma.journalEntry.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    const entryNumber = `JE-${Date.now()}`;

    // Calculate totals
    let totalDebit = 0;
    let totalCredit = 0;

    lines.forEach((line: any) => {
      totalDebit += line.debit || 0;
      totalCredit += line.credit || 0;
    });

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({ error: 'Debit and credit must be equal' });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        organizationId,
        entryNumber,
        entryDate: new Date(entryDate),
        description,
        referenceNo,
        totalDebit,
        totalCredit,
        lines: {
          create: lines.map((line: any) => ({
            accountId: line.accountId,
            description: line.description,
            debit: line.debit || 0,
            credit: line.credit || 0,
          })),
        },
      },
      include: { lines: true },
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

// Get journal entries
router.get('/journal-entries', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { status } = req.query;

    const where: any = { organizationId };
    if (status) where.status = status;

    const entries = await prisma.journalEntry.findMany({
      where,
      include: { lines: true },
      orderBy: { entryDate: 'desc' },
    });

    res.json(entries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Post journal entry
router.put('/journal-entries/:entryId/post', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { entryId } = req.params;

    const entry = await prisma.journalEntry.findUnique({
      where: { id: entryId },
      include: { lines: true },
    });

    if (!entry || entry.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    if (entry.status === 'POSTED') {
      return res.status(400).json({ error: 'Entry already posted' });
    }

    // Create ledger entries
    for (const line of entry.lines) {
      await prisma.ledgerEntry.create({
        data: {
          organizationId,
          accountId: line.accountId,
          journalLineId: line.id,
          entryDate: entry.entryDate,
          description: entry.description,
          debit: line.debit,
          credit: line.credit,
          balance: 0,
        },
      });
    }

    const updated = await prisma.journalEntry.update({
      where: { id: entryId },
      data: { status: 'POSTED' },
      include: { lines: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error posting journal entry:', error);
    res.status(500).json({ error: 'Failed to post journal entry' });
  }
});

// ===== LEDGER =====

// Get ledger for account
router.get('/ledger/:accountId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { accountId } = req.params;

    const account = await prisma.chartOfAccounts.findUnique({
      where: { id: accountId },
    });

    if (!account || account.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const entries = await prisma.ledgerEntry.findMany({
      where: { accountId },
      orderBy: { entryDate: 'asc' },
    });

    let balance = account.openingBalance;
    const ledger = entries.map((entry) => {
      balance += entry.debit - entry.credit;
      return { ...entry, balance };
    });

    res.json({
      account,
      openingBalance: account.openingBalance,
      entries: ledger,
      closingBalance: balance,
    });
  } catch (error) {
    console.error('Error fetching ledger:', error);
    res.status(500).json({ error: 'Failed to fetch ledger' });
  }
});

// ===== TRIAL BALANCE =====

// Generate trial balance
router.post('/trial-balance', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { asOfDate } = req.body;

    const accounts = await prisma.chartOfAccounts.findMany({
      where: { organizationId },
    });

    const trialBalance = [];
    let totalDebit = 0;
    let totalCredit = 0;

    for (const account of accounts) {
      const entries = await prisma.ledgerEntry.findMany({
        where: {
          accountId: account.id,
          entryDate: { lte: new Date(asOfDate) },
        },
      });

      let debit = 0;
      let credit = 0;

      entries.forEach((entry) => {
        debit += entry.debit;
        credit += entry.credit;
      });

      if (debit !== 0 || credit !== 0) {
        trialBalance.push({
          accountCode: account.code,
          accountName: account.name,
          debit,
          credit,
        });

        totalDebit += debit;
        totalCredit += credit;
      }
    }

    res.json({
      asOfDate,
      trialBalance,
      summary: {
        totalDebit,
        totalCredit,
        balanced: Math.abs(totalDebit - totalCredit) < 0.01,
      },
    });
  } catch (error) {
    console.error('Error generating trial balance:', error);
    res.status(500).json({ error: 'Failed to generate trial balance' });
  }
});

module.exports = router;

