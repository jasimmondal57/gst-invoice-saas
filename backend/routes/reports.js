const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get GSTR-1 report
router.get('/gstr-1', authMiddleware, async (req, res) => {
  try {
    const { organizationId, month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        invoiceDate: {
          gte: startDate,
          lte: endDate
        },
        status: { not: 'DRAFT' }
      },
      include: { items: true, customer: true }
    });

    // Calculate GSTR-1 data
    const gstr1Data = {
      month,
      year,
      totalInvoices: invoices.length,
      totalTaxableValue: 0,
      totalTax: 0,
      invoices: []
    };

    invoices.forEach(invoice => {
      gstr1Data.totalTaxableValue += invoice.subtotal;
      gstr1Data.totalTax += invoice.taxAmount;
      gstr1Data.invoices.push({
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        customerGSTIN: invoice.customer.gstin,
        taxableValue: invoice.subtotal,
        tax: invoice.taxAmount
      });
    });

    res.json(gstr1Data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate GSTR-1 report' });
  }
});

// Get GSTR-2 report
router.get('/gstr-2', authMiddleware, async (req, res) => {
  try {
    const { organizationId, month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const purchases = await prisma.purchase.findMany({
      where: {
        organizationId,
        purchaseDate: {
          gte: startDate,
          lte: endDate
        },
        status: { not: 'DRAFT' }
      },
      include: { items: true, supplier: true }
    });

    const gstr2Data = {
      month,
      year,
      totalPurchases: purchases.length,
      totalTaxableValue: 0,
      totalTax: 0,
      purchases: []
    };

    purchases.forEach(purchase => {
      gstr2Data.totalTaxableValue += purchase.subtotal;
      gstr2Data.totalTax += purchase.taxAmount;
      gstr2Data.purchases.push({
        purchaseNumber: purchase.purchaseNumber,
        purchaseDate: purchase.purchaseDate,
        supplierGSTIN: purchase.supplier.gstin,
        taxableValue: purchase.subtotal,
        tax: purchase.taxAmount
      });
    });

    res.json(gstr2Data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate GSTR-2 report' });
  }
});

// Get Sales Report
router.get('/sales-report', authMiddleware, async (req, res) => {
  try {
    const { organizationId, startDate, endDate } = req.query;

    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        invoiceDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        status: { not: 'DRAFT' }
      },
      include: { items: true, customer: true }
    });

    const report = {
      startDate,
      endDate,
      totalInvoices: invoices.length,
      totalRevenue: 0,
      totalTax: 0,
      invoices: []
    };

    invoices.forEach(invoice => {
      report.totalRevenue += invoice.totalAmount;
      report.totalTax += invoice.taxAmount;
      report.invoices.push({
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        customerName: invoice.customer.name,
        amount: invoice.totalAmount,
        tax: invoice.taxAmount
      });
    });

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

// Get Purchase Report
router.get('/purchase-report', authMiddleware, async (req, res) => {
  try {
    const { organizationId, startDate, endDate } = req.query;

    const purchases = await prisma.purchase.findMany({
      where: {
        organizationId,
        purchaseDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        status: { not: 'DRAFT' }
      },
      include: { items: true, supplier: true }
    });

    const report = {
      startDate,
      endDate,
      totalPurchases: purchases.length,
      totalCost: 0,
      totalTax: 0,
      purchases: []
    };

    purchases.forEach(purchase => {
      report.totalCost += purchase.totalAmount;
      report.totalTax += purchase.taxAmount;
      report.purchases.push({
        purchaseNumber: purchase.purchaseNumber,
        purchaseDate: purchase.purchaseDate,
        supplierName: purchase.supplier.name,
        amount: purchase.totalAmount,
        tax: purchase.taxAmount
      });
    });

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate purchase report' });
  }
});

// Get Customer-wise Report
router.get('/customer-report', authMiddleware, async (req, res) => {
  try {
    const { organizationId, startDate, endDate } = req.query;

    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        invoiceDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        status: { not: 'DRAFT' }
      },
      include: { customer: true }
    });

    const customerMap = {};
    invoices.forEach(invoice => {
      const customerId = invoice.customer.id;
      if (!customerMap[customerId]) {
        customerMap[customerId] = {
          customerId,
          customerName: invoice.customer.name,
          totalInvoices: 0,
          totalAmount: 0,
          totalTax: 0
        };
      }
      customerMap[customerId].totalInvoices += 1;
      customerMap[customerId].totalAmount += invoice.totalAmount;
      customerMap[customerId].totalTax += invoice.taxAmount;
    });

    res.json({
      startDate,
      endDate,
      customers: Object.values(customerMap)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate customer report' });
  }
});

// Get Supplier-wise Report
router.get('/supplier-report', authMiddleware, async (req, res) => {
  try {
    const { organizationId, startDate, endDate } = req.query;

    const purchases = await prisma.purchase.findMany({
      where: {
        organizationId,
        purchaseDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        status: { not: 'DRAFT' }
      },
      include: { supplier: true }
    });

    const supplierMap = {};
    purchases.forEach(purchase => {
      const supplierId = purchase.supplier.id;
      if (!supplierMap[supplierId]) {
        supplierMap[supplierId] = {
          supplierId,
          supplierName: purchase.supplier.name,
          totalPurchases: 0,
          totalAmount: 0,
          totalTax: 0
        };
      }
      supplierMap[supplierId].totalPurchases += 1;
      supplierMap[supplierId].totalAmount += purchase.totalAmount;
      supplierMap[supplierId].totalTax += purchase.taxAmount;
    });

    res.json({
      startDate,
      endDate,
      suppliers: Object.values(supplierMap)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate supplier report' });
  }
});

// Get Profit & Loss Report
router.get('/profit-loss', authMiddleware, async (req, res) => {
  try {
    const { organizationId, startDate, endDate } = req.query;

    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        invoiceDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        status: { not: 'DRAFT' }
      }
    });

    const purchases = await prisma.purchase.findMany({
      where: {
        organizationId,
        purchaseDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        status: { not: 'DRAFT' }
      }
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalCost = purchases.reduce((sum, pur) => sum + pur.totalAmount, 0);
    const profit = totalRevenue - totalCost;

    res.json({
      startDate,
      endDate,
      totalRevenue,
      totalCost,
      profit,
      profitMargin: totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate P&L report' });
  }
});

// Get GSTR-3B Report
router.get('/gstr-3b', authMiddleware, async (req, res) => {
  try {
    const { organizationId, month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        invoiceDate: { gte: startDate, lte: endDate },
        status: { not: 'DRAFT' }
      }
    });

    const purchases = await prisma.purchase.findMany({
      where: {
        organizationId,
        purchaseDate: { gte: startDate, lte: endDate },
        status: { not: 'DRAFT' }
      }
    });

    const outwardTax = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
    const inwardTax = purchases.reduce((sum, pur) => sum + pur.taxAmount, 0);
    const netTax = outwardTax - inwardTax;

    res.json({
      month,
      year,
      outwardSupplies: invoices.length,
      outwardTax,
      inwardSupplies: purchases.length,
      inwardTax,
      netTax,
      taxPayable: netTax > 0 ? netTax : 0,
      taxRefundable: netTax < 0 ? Math.abs(netTax) : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate GSTR-3B report' });
  }
});

// Get GSTR-9 Report (Annual)
router.get('/gstr-9', authMiddleware, async (req, res) => {
  try {
    const { organizationId, year } = req.query;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        invoiceDate: { gte: startDate, lte: endDate },
        status: { not: 'DRAFT' }
      }
    });

    const purchases = await prisma.purchase.findMany({
      where: {
        organizationId,
        purchaseDate: { gte: startDate, lte: endDate },
        status: { not: 'DRAFT' }
      }
    });

    const totalOutwardValue = invoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const totalOutwardTax = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
    const totalInwardValue = purchases.reduce((sum, pur) => sum + pur.subtotal, 0);
    const totalInwardTax = purchases.reduce((sum, pur) => sum + pur.taxAmount, 0);

    res.json({
      year,
      totalOutwardSupplies: invoices.length,
      totalOutwardValue,
      totalOutwardTax,
      totalInwardSupplies: purchases.length,
      totalInwardValue,
      totalInwardTax,
      netTax: totalOutwardTax - totalInwardTax
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate GSTR-9 report' });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.query;

    const totalInvoices = await prisma.invoice.count({
      where: { organizationId }
    });

    const totalRevenue = await prisma.invoice.aggregate({
      where: { organizationId },
      _sum: { totalAmount: true }
    });

    const paidInvoices = await prisma.invoice.count({
      where: { organizationId, status: 'PAID' }
    });

    const overdueInvoices = await prisma.invoice.count({
      where: { organizationId, status: 'OVERDUE' }
    });

    res.json({
      totalInvoices,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      paidInvoices,
      overdueInvoices
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;

