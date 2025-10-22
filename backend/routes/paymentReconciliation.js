const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Get all invoices with payment status
router.get('/invoices', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { status } = req.query;

    const invoices = await prisma.invoice.findMany({
      where: { organizationId },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { invoiceDate: 'desc' },
    });

    // Calculate payment status for each invoice
    const invoicesWithPaymentStatus = await Promise.all(
      invoices.map(async (invoice) => {
        const payments = await prisma.payment.findMany({
          where: { invoiceId: invoice.id },
        });

        const paidAmount = payments
          .filter((p) => p.status === 'COMPLETED')
          .reduce((sum, p) => sum + p.amount, 0);
        const pendingAmount = invoice.totalAmount - paidAmount;
        const paymentStatus =
          pendingAmount === 0 ? 'PAID' : pendingAmount === invoice.totalAmount ? 'UNPAID' : 'PARTIAL';

        return {
          ...invoice,
          paidAmount,
          pendingAmount,
          paymentStatus,
          paymentPercentage: ((paidAmount / invoice.totalAmount) * 100).toFixed(2),
        };
      })
    );

    // Filter by status if provided
    let filtered = invoicesWithPaymentStatus;
    if (status) {
      filtered = invoicesWithPaymentStatus.filter((inv) => inv.paymentStatus === status);
    }

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get invoice payment details
router.get('/invoices/:invoiceId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { invoiceId } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!invoice || invoice.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const payments = await prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { paymentDate: 'desc' },
    });

    const paidAmount = payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = invoice.totalAmount - paidAmount;

    res.json({
      invoice,
      payments,
      summary: {
        totalAmount: invoice.totalAmount,
        paidAmount,
        pendingAmount,
        paymentStatus: pendingAmount === 0 ? 'PAID' : pendingAmount === invoice.totalAmount ? 'UNPAID' : 'PARTIAL',
        paymentPercentage: ((paidAmount / invoice.totalAmount) * 100).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    res.status(500).json({ error: 'Failed to fetch invoice details' });
  }
});

// Record payment against invoice
router.post('/invoices/:invoiceId/payments', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { invoiceId } = req.params;
    const { amount, paymentDate, paymentMode, referenceNo, notes } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Check if payment amount exceeds pending amount
    const existingPayments = await prisma.payment.findMany({
      where: { invoiceId, status: 'COMPLETED' },
    });

    const paidAmount = existingPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = invoice.totalAmount - paidAmount;

    if (amount > pendingAmount) {
      return res.status(400).json({
        error: `Payment amount exceeds pending amount. Pending: ₹${pendingAmount}`,
      });
    }

    const payment = await prisma.payment.create({
      data: {
        organizationId,
        invoiceId,
        amount,
        paymentDate: new Date(paymentDate),
        paymentMode,
        referenceNo,
        notes,
        status: 'COMPLETED',
      },
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// Get outstanding payments summary
router.get('/outstanding/summary', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;

    const invoices = await prisma.invoice.findMany({
      where: { organizationId },
      include: { customer: true },
    });

    let totalOutstanding = 0;
    let overdueAmount = 0;
    let upcomingAmount = 0;
    const outstandingByCustomer = {};

    const today = new Date();

    for (const invoice of invoices) {
      const payments = await prisma.payment.findMany({
        where: { invoiceId: invoice.id, status: 'COMPLETED' },
      });

      const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      const pendingAmount = invoice.totalAmount - paidAmount;

      if (pendingAmount > 0) {
        totalOutstanding += pendingAmount;

        if (invoice.dueDate && invoice.dueDate < today) {
          overdueAmount += pendingAmount;
        } else if (invoice.dueDate) {
          upcomingAmount += pendingAmount;
        }

        const customerName = invoice.customer.name;
        outstandingByCustomer[customerName] = (outstandingByCustomer[customerName] || 0) + pendingAmount;
      }
    }

    res.json({
      summary: {
        totalOutstanding,
        overdueAmount,
        upcomingAmount,
        outstandingByCustomer,
      },
    });
  } catch (error) {
    console.error('Error fetching outstanding summary:', error);
    res.status(500).json({ error: 'Failed to fetch outstanding summary' });
  }
});

// Get customer-wise outstanding
router.get('/outstanding/customer/:customerId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { customerId } = req.params;

    const invoices = await prisma.invoice.findMany({
      where: { organizationId, customerId },
      include: { customer: true },
    });

    const outstandingInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        const payments = await prisma.payment.findMany({
          where: { invoiceId: invoice.id, status: 'COMPLETED' },
        });

        const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const pendingAmount = invoice.totalAmount - paidAmount;

        return {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.dueDate,
          totalAmount: invoice.totalAmount,
          paidAmount,
          pendingAmount,
          status: pendingAmount === 0 ? 'PAID' : 'OUTSTANDING',
        };
      })
    );

    const totalOutstanding = outstandingInvoices
      .filter((inv) => inv.status === 'OUTSTANDING')
      .reduce((sum, inv) => sum + inv.pendingAmount, 0);

    res.json({
      customer: invoices[0]?.customer,
      invoices: outstandingInvoices,
      totalOutstanding,
    });
  } catch (error) {
    console.error('Error fetching customer outstanding:', error);
    res.status(500).json({ error: 'Failed to fetch customer outstanding' });
  }
});

// Get payment history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { invoiceId, customerId } = req.query;

    const where = { organizationId };
    if (invoiceId) where.invoiceId = invoiceId;
    if (customerId) where.customerId = customerId;

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
    });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

module.exports = router;

