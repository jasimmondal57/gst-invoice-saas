const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Generate e-invoice
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { invoiceId, organizationId } = req.body;

    // Fetch invoice details
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        items: true,
        organization: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // TODO: Integrate with GST e-invoice API
    // For now, generate a mock IRN
    const irn = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const ackNo = `ACK-${Date.now()}`;

    const eInvoice = await prisma.eInvoice.create({
      data: {
        organizationId,
        invoiceId,
        irn,
        ackNo,
        ackDate: new Date(),
        status: 'GENERATED'
      }
    });

    res.status(201).json(eInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate e-invoice' });
  }
});

// Get e-invoice
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const eInvoice = await prisma.eInvoice.findUnique({
      where: { id: req.params.id },
      include: { invoice: true }
    });

    if (!eInvoice) {
      return res.status(404).json({ error: 'E-invoice not found' });
    }

    res.json(eInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch e-invoice' });
  }
});

module.exports = router;

