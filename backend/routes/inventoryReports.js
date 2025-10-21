const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Stock Valuation Report
router.get('/valuation', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;

    const inventories = await prisma.inventory.findMany({
      where: { organizationId },
      include: { product: true },
    });

    const valuationReport = inventories.map((inv) => {
      const valuationAmount = inv.quantity * inv.product.price;
      const valuationWithGST = valuationAmount * (1 + inv.product.gstRate / 100);

      return {
        productId: inv.product.id,
        productName: inv.product.name,
        hsn: inv.product.hsn,
        unit: inv.product.unit,
        quantity: inv.quantity,
        unitPrice: inv.product.price,
        valuationAmount,
        gstRate: inv.product.gstRate,
        valuationWithGST,
        reorderLevel: inv.reorderLevel,
        status: inv.quantity < inv.reorderLevel ? 'LOW_STOCK' : 'OK',
      };
    });

    const totalValuation = valuationReport.reduce((sum, item) => sum + item.valuationAmount, 0);
    const totalWithGST = valuationReport.reduce((sum, item) => sum + item.valuationWithGST, 0);

    res.json({
      report: valuationReport,
      summary: {
        totalItems: valuationReport.length,
        totalQuantity: valuationReport.reduce((sum, item) => sum + item.quantity, 0),
        totalValuation,
        totalWithGST,
        lowStockItems: valuationReport.filter((item) => item.status === 'LOW_STOCK').length,
      },
    });
  } catch (error) {
    console.error('Error generating valuation report:', error);
    res.status(500).json({ error: 'Failed to generate valuation report' });
  }
});

// Stock Aging Report
router.get('/aging', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { days = 30 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const inventories = await prisma.inventory.findMany({
      where: { organizationId },
      include: { product: true },
    });

    const agingReport = inventories.map((inv) => {
      const lastRestockDate = inv.lastRestockDate || inv.createdAt;
      const daysOld = Math.floor((new Date() - lastRestockDate) / (1000 * 60 * 60 * 24));
      const isAged = lastRestockDate < cutoffDate;

      return {
        productId: inv.product.id,
        productName: inv.product.name,
        quantity: inv.quantity,
        lastRestockDate,
        daysOld,
        isAged,
        ageCategory:
          daysOld < 30 ? 'Fresh' : daysOld < 90 ? 'Medium' : daysOld < 180 ? 'Old' : 'Very Old',
      };
    });

    const agedItems = agingReport.filter((item) => item.isAged);

    res.json({
      report: agingReport,
      summary: {
        totalItems: agingReport.length,
        agedItems: agedItems.length,
        freshItems: agingReport.filter((item) => item.ageCategory === 'Fresh').length,
        mediumItems: agingReport.filter((item) => item.ageCategory === 'Medium').length,
        oldItems: agingReport.filter((item) => item.ageCategory === 'Old').length,
        veryOldItems: agingReport.filter((item) => item.ageCategory === 'Very Old').length,
      },
    });
  } catch (error) {
    console.error('Error generating aging report:', error);
    res.status(500).json({ error: 'Failed to generate aging report' });
  }
});

// Stock Turnover Report
router.get('/turnover', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { months = 3 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - parseInt(months));

    const products = await prisma.product.findMany({
      where: { organizationId },
      include: { inventory: true },
    });

    const turnoverReport = await Promise.all(
      products.map(async (product) => {
        const movements = await prisma.stockMovement.findMany({
          where: {
            productId: product.id,
            createdAt: { gte: cutoffDate },
          },
        });

        const purchases = movements
          .filter((m) => m.type === 'PURCHASE')
          .reduce((sum, m) => sum + m.quantity, 0);
        const sales = movements
          .filter((m) => m.type === 'SALE')
          .reduce((sum, m) => sum + m.quantity, 0);
        const adjustments = movements
          .filter((m) => m.type === 'ADJUSTMENT')
          .reduce((sum, m) => sum + m.quantity, 0);

        const avgInventory = product.inventory?.quantity || 0;
        const turnoverRatio = avgInventory > 0 ? sales / avgInventory : 0;

        return {
          productId: product.id,
          productName: product.name,
          currentStock: product.inventory?.quantity || 0,
          purchases,
          sales,
          adjustments,
          turnoverRatio: parseFloat(turnoverRatio.toFixed(2)),
          turnoverCategory:
            turnoverRatio > 5 ? 'Very High' : turnoverRatio > 2 ? 'High' : 'Low',
        };
      })
    );

    const totalSales = turnoverReport.reduce((sum, item) => sum + item.sales, 0);
    const totalPurchases = turnoverReport.reduce((sum, item) => sum + item.purchases, 0);
    const avgTurnover =
      turnoverReport.length > 0
        ? (turnoverReport.reduce((sum, item) => sum + item.turnoverRatio, 0) /
            turnoverReport.length).toFixed(2)
        : 0;

    res.json({
      report: turnoverReport,
      summary: {
        period: `${months} months`,
        totalProducts: turnoverReport.length,
        totalSales,
        totalPurchases,
        avgTurnover,
        highTurnoverItems: turnoverReport.filter((item) => item.turnoverCategory === 'Very High')
          .length,
        lowTurnoverItems: turnoverReport.filter((item) => item.turnoverCategory === 'Low').length,
      },
    });
  } catch (error) {
    console.error('Error generating turnover report:', error);
    res.status(500).json({ error: 'Failed to generate turnover report' });
  }
});

// Low Stock Alert Report
router.get('/low-stock', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;

    const inventories = await prisma.inventory.findMany({
      where: { organizationId },
      include: { product: true },
    });

    const lowStockItems = inventories
      .filter((inv) => inv.quantity < inv.reorderLevel)
      .map((inv) => ({
        productId: inv.product.id,
        productName: inv.product.name,
        hsn: inv.product.hsn,
        currentStock: inv.quantity,
        reorderLevel: inv.reorderLevel,
        reorderQuantity: inv.reorderQuantity,
        shortage: inv.reorderLevel - inv.quantity,
        suggestedPOQuantity: inv.reorderQuantity,
        unitPrice: inv.product.price,
        estimatedCost: inv.reorderQuantity * inv.product.price,
      }));

    const totalEstimatedCost = lowStockItems.reduce((sum, item) => sum + item.estimatedCost, 0);

    res.json({
      report: lowStockItems,
      summary: {
        totalLowStockItems: lowStockItems.length,
        totalShortage: lowStockItems.reduce((sum, item) => sum + item.shortage, 0),
        totalEstimatedCost,
        suggestedPOAmount: totalEstimatedCost,
      },
    });
  } catch (error) {
    console.error('Error generating low stock report:', error);
    res.status(500).json({ error: 'Failed to generate low stock report' });
  }
});

// Stock Movement Report
router.get('/movement', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { productId, startDate, endDate } = req.query;

    const where = { organizationId };
    if (productId) where.productId = productId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    const movementReport = movements.map((m) => ({
      id: m.id,
      productId: m.product.id,
      productName: m.product.name,
      type: m.type,
      quantity: m.quantity,
      reference: m.reference,
      notes: m.notes,
      date: m.createdAt,
    }));

    const summary = {
      totalMovements: movementReport.length,
      byType: {
        PURCHASE: movements.filter((m) => m.type === 'PURCHASE').length,
        SALE: movements.filter((m) => m.type === 'SALE').length,
        ADJUSTMENT: movements.filter((m) => m.type === 'ADJUSTMENT').length,
        RETURN: movements.filter((m) => m.type === 'RETURN').length,
        DAMAGE: movements.filter((m) => m.type === 'DAMAGE').length,
        OPENING_STOCK: movements.filter((m) => m.type === 'OPENING_STOCK').length,
      },
    };

    res.json({
      report: movementReport,
      summary,
    });
  } catch (error) {
    console.error('Error generating movement report:', error);
    res.status(500).json({ error: 'Failed to generate movement report' });
  }
});

// Inventory Summary Dashboard
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;

    const inventories = await prisma.inventory.findMany({
      where: { organizationId },
      include: { product: true },
    });

    const totalItems = inventories.length;
    const totalQuantity = inventories.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalValue = inventories.reduce((sum, inv) => sum + inv.quantity * inv.product.price, 0);
    const lowStockCount = inventories.filter((inv) => inv.quantity < inv.reorderLevel).length;
    const outOfStockCount = inventories.filter((inv) => inv.quantity === 0).length;

    res.json({
      summary: {
        totalItems,
        totalQuantity,
        totalValue,
        lowStockCount,
        outOfStockCount,
        inStockCount: totalItems - outOfStockCount,
        stockHealth: {
          excellent: totalItems - lowStockCount - outOfStockCount,
          warning: lowStockCount,
          critical: outOfStockCount,
        },
      },
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

module.exports = router;

