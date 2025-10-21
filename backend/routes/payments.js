const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all payments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId, status } = req.query;
    const payments = await prisma.payment.findMany({
      where: {
        organizationId,
        status: status || undefined
      },
      orderBy: { paymentDate: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Create payment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId, invoiceId, purchaseId, customerId, supplierId, amount, paymentDate, paymentMode, referenceNo, notes } = req.body;

    const payment = await prisma.payment.create({
      data: {
        organizationId,
        invoiceId,
        purchaseId,
        customerId,
        supplierId,
        amount,
        paymentDate: new Date(paymentDate),
        paymentMode,
        referenceNo,
        notes,
        status: 'COMPLETED'
      }
    });

    // Update outstanding amount for customer/supplier
    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });
      if (customer) {
        await prisma.customer.update({
          where: { id: customerId },
          data: {
            outstandingAmount: Math.max(0, customer.outstandingAmount - amount)
          }
        });
      }
    }

    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId }
      });
      if (supplier) {
        await prisma.supplier.update({
          where: { id: supplierId },
          data: {
            outstandingAmount: Math.max(0, supplier.outstandingAmount - amount)
          }
        });
      }
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Get payment details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Update payment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { amount, paymentDate, paymentMode, referenceNo, notes, status } = req.body;

    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: {
        amount: amount !== undefined ? amount : undefined,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        paymentMode: paymentMode !== undefined ? paymentMode : undefined,
        referenceNo: referenceNo !== undefined ? referenceNo : undefined,
        notes: notes !== undefined ? notes : undefined,
        status: status !== undefined ? status : undefined
      }
    });

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// Delete payment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Reverse outstanding amount update
    if (payment.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: payment.customerId }
      });
      if (customer) {
        await prisma.customer.update({
          where: { id: payment.customerId },
          data: {
            outstandingAmount: customer.outstandingAmount + payment.amount
          }
        });
      }
    }

    if (payment.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: payment.supplierId }
      });
      if (supplier) {
        await prisma.supplier.update({
          where: { id: payment.supplierId },
          data: {
            outstandingAmount: supplier.outstandingAmount + payment.amount
          }
        });
      }
    }

    await prisma.payment.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

// Get payment summary
router.get('/summary/:organizationId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.params;
    
    const totalReceived = await prisma.payment.aggregate({
      where: {
        organizationId,
        customerId: { not: null },
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    });

    const totalPaid = await prisma.payment.aggregate({
      where: {
        organizationId,
        supplierId: { not: null },
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    });

    res.json({
      totalReceived: totalReceived._sum.amount || 0,
      totalPaid: totalPaid._sum.amount || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch payment summary' });
  }
});

module.exports = router;

