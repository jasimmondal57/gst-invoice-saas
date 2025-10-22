const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// ===== SALES REPORTS =====

// Sales Summary Report
router.get('/sales/summary', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { startDate, endDate } = req.query;

    const where = { organizationId };
    if (startDate && endDate) {
      where.invoiceDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: { items: true, customer: true },
    });

    let totalSales = 0;
    let totalTax = 0;
    let totalItems = 0;
    const customerWiseSales = {};

    invoices.forEach((inv) => {
      totalSales += inv.subtotal;
      totalTax += inv.taxAmount;
      totalItems += inv.items.length;
      customerWiseSales[inv.customer.name] = (customerWiseSales[inv.customer.name] || 0) + inv.subtotal;
    });

    res.json({
      totalSales,
      totalTax,
      totalInvoices: invoices.length,
      totalItems,
      averageInvoiceValue: invoices.length > 0 ? totalSales / invoices.length : 0,
      customerWiseSales,
    });
  } catch (error) {
    console.error('Error generating sales summary:', error);
    res.status(500).json({ error: 'Failed to generate sales summary' });
  }
});

// Sales by Customer Report
router.get('/sales/customer', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;

    const invoices = await prisma.invoice.findMany({
      where: { organizationId },
      include: { customer: true },
    });

    const customerSales = {};

    invoices.forEach((inv) => {
      if (!customerSales[inv.customer.id]) {
        customerSales[inv.customer.id] = {
          customerId: inv.customer.id,
          customerName: inv.customer.name,
          totalSales: 0,
          totalTax: 0,
          invoiceCount: 0,
          lastInvoiceDate: null,
        };
      }
      customerSales[inv.customer.id].totalSales += inv.subtotal;
      customerSales[inv.customer.id].totalTax += inv.taxAmount;
      customerSales[inv.customer.id].invoiceCount += 1;
      customerSales[inv.customer.id].lastInvoiceDate = inv.invoiceDate;
    });

    res.json(Object.values(customerSales));
  } catch (error) {
    console.error('Error generating customer sales report:', error);
    res.status(500).json({ error: 'Failed to generate customer sales report' });
  }
});

// ===== PURCHASE REPORTS =====

// Purchase Summary Report
router.get('/purchase/summary', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { startDate, endDate } = req.query;

    const where = { organizationId };
    if (startDate && endDate) {
      where.purchaseDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: { items: true, supplier: true },
    });

    let totalPurchases = 0;
    let totalTax = 0;
    let totalItems = 0;
    const supplierWisePurchases = {};

    purchases.forEach((pur) => {
      totalPurchases += pur.subtotal;
      totalTax += pur.taxAmount;
      totalItems += pur.items.length;
      supplierWisePurchases[pur.supplier.name] = (supplierWisePurchases[pur.supplier.name] || 0) + pur.subtotal;
    });

    res.json({
      totalPurchases,
      totalTax,
      totalPurchaseOrders: purchases.length,
      totalItems,
      averagePurchaseValue: purchases.length > 0 ? totalPurchases / purchases.length : 0,
      supplierWisePurchases,
    });
  } catch (error) {
    console.error('Error generating purchase summary:', error);
    res.status(500).json({ error: 'Failed to generate purchase summary' });
  }
});

// ===== PROFIT & LOSS REPORT =====

// P&L Report
router.get('/profit-loss', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { startDate, endDate } = req.query;

    const invoiceWhere = { organizationId };
    const purchaseWhere = { organizationId };

    if (startDate && endDate) {
      invoiceWhere.invoiceDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
      purchaseWhere.purchaseDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const invoices = await prisma.invoice.findMany({
      where: invoiceWhere,
    });

    const purchases = await prisma.purchase.findMany({
      where: purchaseWhere,
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalCost = purchases.reduce((sum, pur) => sum + pur.totalAmount, 0);
    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    res.json({
      totalRevenue,
      totalCost,
      grossProfit,
      profitMargin: profitMargin.toFixed(2),
      invoiceCount: invoices.length,
      purchaseCount: purchases.length,
    });
  } catch (error) {
    console.error('Error generating P&L report:', error);
    res.status(500).json({ error: 'Failed to generate P&L report' });
  }
});

// ===== INVENTORY REPORTS =====

// Top Selling Products
router.get('/inventory/top-products', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { limit = 10 } = req.query;

    const items = await prisma.invoiceItem.findMany({
      where: {
        invoice: { organizationId },
      },
      include: { product: true },
    });

    const productSales = {};

    items.forEach((item) => {
      if (!productSales[item.product.id]) {
        productSales[item.product.id] = {
          productId: item.product.id,
          productName: item.product.name,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      productSales[item.product.id].totalQuantity += item.quantity;
      productSales[item.product.id].totalRevenue += item.amount;
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, parseInt(limit));

    res.json(topProducts);
  } catch (error) {
    console.error('Error generating top products report:', error);
    res.status(500).json({ error: 'Failed to generate top products report' });
  }
});

// ===== CUSTOM REPORTS =====

// Generate Custom Report
router.post('/custom', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { reportType, filters } = req.body;

    let data = {};

    switch (reportType) {
      case 'SALES_BY_MONTH':
        const invoices = await prisma.invoice.findMany({
          where: { organizationId },
        });
        const monthlyData = {};
        invoices.forEach((inv) => {
          const month = new Date(inv.invoiceDate).toLocaleString('default', { month: 'long', year: 'numeric' });
          monthlyData[month] = (monthlyData[month] || 0) + inv.totalAmount;
        });
        data = monthlyData;
        break;

      case 'PAYMENT_STATUS':
        const allInvoices = await prisma.invoice.findMany({
          where: { organizationId },
          include: { payments: true },
        });
        let paid = 0;
        let pending = 0;
        let overdue = 0;
        allInvoices.forEach((inv) => {
          const paidAmount = inv.payments.reduce((sum, p) => sum + p.amount, 0);
          if (paidAmount >= inv.totalAmount) {
            paid += 1;
          } else if (new Date(inv.invoiceDate) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
            overdue += 1;
          } else {
            pending += 1;
          }
        });
        data = { paid, pending, overdue };
        break;

      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error generating custom report:', error);
    res.status(500).json({ error: 'Failed to generate custom report' });
  }
});

module.exports = router;

