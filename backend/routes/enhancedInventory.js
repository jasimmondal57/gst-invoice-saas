const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Get reorder suggestions
router.get('/reorder-suggestions', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;

    const inventories = await prisma.inventory.findMany({
      where: { organizationId },
      include: { product: true },
    });

    const suggestions = inventories
      .filter((inv) => inv.quantity < inv.reorderLevel)
      .map((inv) => ({
        productId: inv.product.id,
        productName: inv.product.name,
        currentStock: inv.quantity,
        reorderLevel: inv.reorderLevel,
        reorderQuantity: inv.reorderQuantity,
        suggestedPOQuantity: inv.reorderQuantity,
        unitPrice: inv.product.price,
        estimatedCost: inv.reorderQuantity * inv.product.price,
        priority: inv.quantity === 0 ? 'CRITICAL' : inv.quantity < inv.reorderLevel / 2 ? 'HIGH' : 'MEDIUM',
      }))
      .sort((a, b) => {
        const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    const totalEstimatedCost = suggestions.reduce((sum, item) => sum + item.estimatedCost, 0);

    res.json({
      suggestions,
      summary: {
        totalSuggestions: suggestions.length,
        criticalItems: suggestions.filter((s) => s.priority === 'CRITICAL').length,
        highPriorityItems: suggestions.filter((s) => s.priority === 'HIGH').length,
        totalEstimatedCost,
      },
    });
  } catch (error) {
    console.error('Error generating reorder suggestions:', error);
    res.status(500).json({ error: 'Failed to generate reorder suggestions' });
  }
});

// Get stock forecast
router.get('/forecast', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { days = 30 } = req.query;

    const inventories = await prisma.inventory.findMany({
      where: { organizationId },
      include: { product: true },
    });

    const forecasts = await Promise.all(
      inventories.map(async (inv) => {
        // Get average daily sales for the product
        const movements = await prisma.stockMovement.findMany({
          where: {
            productId: inv.productId,
            type: 'SALE',
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        });

        const totalSales = movements.reduce((sum, m) => sum + m.quantity, 0);
        const avgDailySales = totalSales / 30;
        const projectedStock = inv.quantity - avgDailySales * parseInt(days);
        const daysUntilStockout = avgDailySales > 0 ? inv.quantity / avgDailySales : Infinity;

        return {
          productId: inv.product.id,
          productName: inv.product.name,
          currentStock: inv.quantity,
          avgDailySales: parseFloat(avgDailySales.toFixed(2)),
          projectedStock: parseFloat(projectedStock.toFixed(2)),
          daysUntilStockout: daysUntilStockout === Infinity ? 'N/A' : Math.floor(daysUntilStockout),
          forecastStatus:
            projectedStock < 0
              ? 'STOCKOUT'
              : projectedStock < inv.reorderLevel
              ? 'WARNING'
              : 'HEALTHY',
        };
      })
    );

    res.json({
      forecast: forecasts,
      summary: {
        totalProducts: forecasts.length,
        healthyItems: forecasts.filter((f) => f.forecastStatus === 'HEALTHY').length,
        warningItems: forecasts.filter((f) => f.forecastStatus === 'WARNING').length,
        stockoutRisk: forecasts.filter((f) => f.forecastStatus === 'STOCKOUT').length,
      },
    });
  } catch (error) {
    console.error('Error generating forecast:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

// Get inventory optimization recommendations
router.get('/optimization', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;

    const inventories = await prisma.inventory.findMany({
      where: { organizationId },
      include: { product: true },
    });

    const recommendations = await Promise.all(
      inventories.map(async (inv) => {
        const movements = await prisma.stockMovement.findMany({
          where: {
            productId: inv.productId,
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
            },
          },
        });

        const sales = movements
          .filter((m) => m.type === 'SALE')
          .reduce((sum, m) => sum + m.quantity, 0);
        const purchases = movements
          .filter((m) => m.type === 'PURCHASE')
          .reduce((sum, m) => sum + m.quantity, 0);

        let recommendation = 'MAINTAIN';
        let reason = 'Current stock levels are optimal';

        if (inv.quantity === 0 && sales > 0) {
          recommendation = 'URGENT_REORDER';
          reason = 'Product is out of stock but has demand';
        } else if (inv.quantity > inv.reorderLevel * 3 && sales === 0) {
          recommendation = 'REDUCE_STOCK';
          reason = 'Excess stock with no recent sales';
        } else if (sales > purchases * 1.5) {
          recommendation = 'INCREASE_REORDER';
          reason = 'Sales exceed purchases significantly';
        } else if (purchases > sales * 2) {
          recommendation = 'DECREASE_REORDER';
          reason = 'Purchases exceed sales significantly';
        }

        return {
          productId: inv.product.id,
          productName: inv.product.name,
          currentStock: inv.quantity,
          reorderLevel: inv.reorderLevel,
          reorderQuantity: inv.reorderQuantity,
          sales90Days: sales,
          purchases90Days: purchases,
          recommendation,
          reason,
          suggestedReorderQuantity:
            recommendation === 'INCREASE_REORDER'
              ? Math.ceil(inv.reorderQuantity * 1.2)
              : recommendation === 'DECREASE_REORDER'
              ? Math.floor(inv.reorderQuantity * 0.8)
              : inv.reorderQuantity,
        };
      })
    );

    res.json({
      recommendations,
      summary: {
        totalProducts: recommendations.length,
        maintain: recommendations.filter((r) => r.recommendation === 'MAINTAIN').length,
        urgentReorder: recommendations.filter((r) => r.recommendation === 'URGENT_REORDER').length,
        increaseReorder: recommendations.filter((r) => r.recommendation === 'INCREASE_REORDER').length,
        decreaseReorder: recommendations.filter((r) => r.recommendation === 'DECREASE_REORDER').length,
        reduceStock: recommendations.filter((r) => r.recommendation === 'REDUCE_STOCK').length,
      },
    });
  } catch (error) {
    console.error('Error generating optimization recommendations:', error);
    res.status(500).json({ error: 'Failed to generate optimization recommendations' });
  }
});

// Update reorder parameters
router.put('/update-reorder/:productId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { productId } = req.params;
    const { reorderLevel, reorderQuantity } = req.body;

    const inventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory || inventory.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    const updated = await prisma.inventory.update({
      where: { productId },
      data: {
        reorderLevel: reorderLevel || inventory.reorderLevel,
        reorderQuantity: reorderQuantity || inventory.reorderQuantity,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating reorder parameters:', error);
    res.status(500).json({ error: 'Failed to update reorder parameters' });
  }
});

// Get inventory health score
router.get('/health-score', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;

    const inventories = await prisma.inventory.findMany({
      where: { organizationId },
      include: { product: true },
    });

    let totalScore = 0;
    const scores = inventories.map((inv) => {
      let score = 100;

      // Deduct for out of stock
      if (inv.quantity === 0) score -= 30;
      // Deduct for low stock
      else if (inv.quantity < inv.reorderLevel) score -= 15;
      // Deduct for excess stock
      else if (inv.quantity > inv.reorderLevel * 3) score -= 10;

      totalScore += score;
      return { productId: inv.product.id, productName: inv.product.name, score };
    });

    const avgScore = inventories.length > 0 ? totalScore / inventories.length : 0;
    const healthStatus =
      avgScore >= 90 ? 'EXCELLENT' : avgScore >= 75 ? 'GOOD' : avgScore >= 50 ? 'FAIR' : 'POOR';

    res.json({
      scores,
      summary: {
        avgScore: parseFloat(avgScore.toFixed(2)),
        healthStatus,
        excellentItems: scores.filter((s) => s.score >= 90).length,
        goodItems: scores.filter((s) => s.score >= 75 && s.score < 90).length,
        fairItems: scores.filter((s) => s.score >= 50 && s.score < 75).length,
        poorItems: scores.filter((s) => s.score < 50).length,
      },
    });
  } catch (error) {
    console.error('Error calculating health score:', error);
    res.status(500).json({ error: 'Failed to calculate health score' });
  }
});

module.exports = router;

