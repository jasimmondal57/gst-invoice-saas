const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// ===== GSTR-1 REPORT =====

// Generate GSTR-1 Report
router.post('/gstr1/generate', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { month, year } = req.body;

    // Get all B2B invoices for the month
    const b2bInvoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        invoiceType: 'B2B',
        invoiceDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      include: { items: true },
    });

    // Get all B2C invoices for the month
    const b2cInvoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        invoiceType: 'B2C',
        invoiceDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      include: { items: true },
    });

    // Calculate totals
    let b2bSupplies = b2bInvoices.length;
    let b2bTaxableValue = b2bInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    let b2bTax = b2bInvoices.reduce((sum, inv) => sum + inv.taxAmount, 0);

    let b2cSupplies = b2cInvoices.length;
    let b2cTaxableValue = b2cInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    let b2cTax = b2cInvoices.reduce((sum, inv) => sum + inv.taxAmount, 0);

    // Create or update GSTR-1 report
    const report = await prisma.gSTR1Report.upsert({
      where: {
        organizationId_month_year: { organizationId, month, year },
      },
      update: {
        b2bSupplies,
        b2bTaxableValue,
        b2bIGST: b2bTax * 0.5,
        b2bCGST: b2bTax * 0.25,
        b2bSGST: b2bTax * 0.25,
        b2cSupplies,
        b2cTaxableValue,
        b2cIGST: b2cTax * 0.5,
        b2cCGST: b2cTax * 0.25,
        b2cSGST: b2cTax * 0.25,
        totalTaxableValue: b2bTaxableValue + b2cTaxableValue,
        totalTax: b2bTax + b2cTax,
      },
      create: {
        organizationId,
        month,
        year,
        b2bSupplies,
        b2bTaxableValue,
        b2bIGST: b2bTax * 0.5,
        b2bCGST: b2bTax * 0.25,
        b2bSGST: b2bTax * 0.25,
        b2cSupplies,
        b2cTaxableValue,
        b2cIGST: b2cTax * 0.5,
        b2cCGST: b2cTax * 0.25,
        b2cSGST: b2cTax * 0.25,
        totalTaxableValue: b2bTaxableValue + b2cTaxableValue,
        totalTax: b2bTax + b2cTax,
      },
    });

    res.json(report);
  } catch (error) {
    console.error('Error generating GSTR-1:', error);
    res.status(500).json({ error: 'Failed to generate GSTR-1' });
  }
});

// Get GSTR-1 Report
router.get('/gstr1/:month/:year', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { month, year } = req.params;

    const report = await prisma.gSTR1Report.findUnique({
      where: {
        organizationId_month_year: {
          organizationId,
          month: parseInt(month),
          year: parseInt(year),
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'GSTR-1 report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching GSTR-1:', error);
    res.status(500).json({ error: 'Failed to fetch GSTR-1' });
  }
});

// ===== GSTR-2 REPORT =====

// Generate GSTR-2 Report
router.post('/gstr2/generate', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { month, year } = req.body;

    // Get all B2B purchases for the month
    const b2bPurchases = await prisma.purchase.findMany({
      where: {
        organizationId,
        purchaseDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      include: { items: true },
    });

    // Calculate totals
    let b2bCount = b2bPurchases.length;
    let b2bTaxableValue = b2bPurchases.reduce((sum, pur) => sum + pur.subtotal, 0);
    let b2bTax = b2bPurchases.reduce((sum, pur) => sum + pur.taxAmount, 0);

    // Create or update GSTR-2 report
    const report = await prisma.gSTR2Report.upsert({
      where: {
        organizationId_month_year: { organizationId, month, year },
      },
      update: {
        b2bPurchases: b2bCount,
        b2bTaxableValue,
        b2bIGST: b2bTax * 0.5,
        b2bCGST: b2bTax * 0.25,
        b2bSGST: b2bTax * 0.25,
        totalTaxableValue: b2bTaxableValue,
        totalTax: b2bTax,
      },
      create: {
        organizationId,
        month,
        year,
        b2bPurchases: b2bCount,
        b2bTaxableValue,
        b2bIGST: b2bTax * 0.5,
        b2bCGST: b2bTax * 0.25,
        b2bSGST: b2bTax * 0.25,
        totalTaxableValue: b2bTaxableValue,
        totalTax: b2bTax,
      },
    });

    res.json(report);
  } catch (error) {
    console.error('Error generating GSTR-2:', error);
    res.status(500).json({ error: 'Failed to generate GSTR-2' });
  }
});

// Get GSTR-2 Report
router.get('/gstr2/:month/:year', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { month, year } = req.params;

    const report = await prisma.gSTR2Report.findUnique({
      where: {
        organizationId_month_year: {
          organizationId,
          month: parseInt(month),
          year: parseInt(year),
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'GSTR-2 report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching GSTR-2:', error);
    res.status(500).json({ error: 'Failed to fetch GSTR-2' });
  }
});

// ===== GSTR-3B REPORT =====

// Generate GSTR-3B Report
router.post('/gstr3b/generate', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { month, year } = req.body;

    // Get GSTR-1 and GSTR-2 data
    const gstr1 = await prisma.gSTR1Report.findUnique({
      where: {
        organizationId_month_year: { organizationId, month, year },
      },
    });

    const gstr2 = await prisma.gSTR2Report.findUnique({
      where: {
        organizationId_month_year: { organizationId, month, year },
      },
    });

    const outwardSupplies = gstr1?.totalTaxableValue || 0;
    const outwardTax = gstr1?.totalTax || 0;
    const inwardSupplies = gstr2?.totalTaxableValue || 0;
    const inwardTax = gstr2?.totalTax || 0;
    const itcAvailable = inwardTax;
    const taxPayable = Math.max(0, outwardTax - itcAvailable);

    // Create or update GSTR-3B report
    const report = await prisma.gSTR3BReport.upsert({
      where: {
        organizationId_month_year: { organizationId, month, year },
      },
      update: {
        outwardSupplies,
        outwardTax,
        inwardSupplies,
        inwardTax,
        itcAvailable,
        taxPayable,
        totalPayable: taxPayable,
      },
      create: {
        organizationId,
        month,
        year,
        outwardSupplies,
        outwardTax,
        inwardSupplies,
        inwardTax,
        itcAvailable,
        taxPayable,
        totalPayable: taxPayable,
      },
    });

    res.json(report);
  } catch (error) {
    console.error('Error generating GSTR-3B:', error);
    res.status(500).json({ error: 'Failed to generate GSTR-3B' });
  }
});

// Get GSTR-3B Report
router.get('/gstr3b/:month/:year', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { month, year } = req.params;

    const report = await prisma.gSTR3BReport.findUnique({
      where: {
        organizationId_month_year: {
          organizationId,
          month: parseInt(month),
          year: parseInt(year),
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'GSTR-3B report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching GSTR-3B:', error);
    res.status(500).json({ error: 'Failed to fetch GSTR-3B' });
  }
});

// ===== E-INVOICE =====

// Generate E-Invoice
router.post('/einvoice/generate/:invoiceId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { invoiceId } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Generate IRN (mock implementation)
    const irn = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const qrCode = `https://einvoice.gst.gov.in/irn/${irn}`;

    const eInvoice = await prisma.eInvoice.upsert({
      where: {
        organizationId_invoiceId: { organizationId, invoiceId },
      },
      update: {
        irn,
        qrCode,
        status: 'GENERATED',
      },
      create: {
        organizationId,
        invoiceId,
        irn,
        qrCode,
        status: 'GENERATED',
      },
    });

    res.json(eInvoice);
  } catch (error) {
    console.error('Error generating E-Invoice:', error);
    res.status(500).json({ error: 'Failed to generate E-Invoice' });
  }
});

// Get E-Invoice
router.get('/einvoice/:invoiceId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { invoiceId } = req.params;

    const eInvoice = await prisma.eInvoice.findUnique({
      where: {
        organizationId_invoiceId: { organizationId, invoiceId },
      },
    });

    if (!eInvoice) {
      return res.status(404).json({ error: 'E-Invoice not found' });
    }

    res.json(eInvoice);
  } catch (error) {
    console.error('Error fetching E-Invoice:', error);
    res.status(500).json({ error: 'Failed to fetch E-Invoice' });
  }
});

module.exports = router;

