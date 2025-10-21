const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

// Create backup
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;

    // Fetch all data for the organization
    const [invoices, purchases, customers, suppliers, products, inventory, payments] = await Promise.all([
      prisma.invoice.findMany({ where: { organizationId }, include: { items: true, customer: true } }),
      prisma.purchase.findMany({ where: { organizationId }, include: { items: true, supplier: true } }),
      prisma.customer.findMany({ where: { organizationId } }),
      prisma.supplier.findMany({ where: { organizationId } }),
      prisma.product.findMany({ where: { organizationId } }),
      prisma.inventory.findMany({ where: { organizationId } }),
      prisma.payment.findMany({ where: { organizationId } })
    ]);

    const backupData = {
      organizationId,
      timestamp: new Date().toISOString(),
      data: {
        invoices,
        purchases,
        customers,
        suppliers,
        products,
        inventory,
        payments
      }
    };

    // Save backup to file
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFileName = `backup-${organizationId}-${Date.now()}.json`;
    const backupPath = path.join(backupDir, backupFileName);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

    res.json({
      message: 'Backup created successfully',
      fileName: backupFileName,
      size: fs.statSync(backupPath).size,
      timestamp: backupData.timestamp
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// List backups
router.get('/list/:organizationId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const backupDir = path.join(process.cwd(), 'backups');

    if (!fs.existsSync(backupDir)) {
      return res.json({ backups: [] });
    }

    const files = fs.readdirSync(backupDir);
    const backups = files
      .filter(f => f.includes(organizationId))
      .map(f => {
        const filePath = path.join(backupDir, f);
        const stats = fs.statSync(filePath);
        return {
          fileName: f,
          size: stats.size,
          createdAt: stats.birthtime
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json({ backups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// Download backup
router.get('/download/:fileName', authMiddleware, async (req, res) => {
  try {
    const { fileName } = req.params;
    const backupDir = path.join(process.cwd(), 'backups');
    const backupPath = path.join(backupDir, fileName);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    res.download(backupPath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to download backup' });
  }
});

// Restore backup
router.post('/restore', authMiddleware, async (req, res) => {
  try {
    const { organizationId, backupData } = req.body;

    // Clear existing data
    await Promise.all([
      prisma.invoice.deleteMany({ where: { organizationId } }),
      prisma.purchase.deleteMany({ where: { organizationId } }),
      prisma.customer.deleteMany({ where: { organizationId } }),
      prisma.supplier.deleteMany({ where: { organizationId } }),
      prisma.product.deleteMany({ where: { organizationId } }),
      prisma.inventory.deleteMany({ where: { organizationId } }),
      prisma.payment.deleteMany({ where: { organizationId } })
    ]);

    // Restore data
    if (backupData.customers && backupData.customers.length > 0) {
      await prisma.customer.createMany({ data: backupData.customers });
    }
    if (backupData.suppliers && backupData.suppliers.length > 0) {
      await prisma.supplier.createMany({ data: backupData.suppliers });
    }
    if (backupData.products && backupData.products.length > 0) {
      await prisma.product.createMany({ data: backupData.products });
    }
    if (backupData.inventory && backupData.inventory.length > 0) {
      await prisma.inventory.createMany({ data: backupData.inventory });
    }

    res.json({ message: 'Backup restored successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// Export data as CSV
router.get('/export/:type/:organizationId', authMiddleware, async (req, res) => {
  try {
    const { type, organizationId } = req.params;

    let data = [];
    let fileName = '';

    switch (type) {
      case 'invoices':
        data = await prisma.invoice.findMany({
          where: { organizationId },
          include: { customer: true }
        });
        fileName = `invoices-${Date.now()}.json`;
        break;
      case 'purchases':
        data = await prisma.purchase.findMany({
          where: { organizationId },
          include: { supplier: true }
        });
        fileName = `purchases-${Date.now()}.json`;
        break;
      case 'customers':
        data = await prisma.customer.findMany({
          where: { organizationId }
        });
        fileName = `customers-${Date.now()}.json`;
        break;
      case 'suppliers':
        data = await prisma.supplier.findMany({
          where: { organizationId }
        });
        fileName = `suppliers-${Date.now()}.json`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Import data
router.post('/import', authMiddleware, async (req, res) => {
  try {
    const { organizationId, type, data } = req.body;

    let result;
    switch (type) {
      case 'customers':
        result = await prisma.customer.createMany({
          data: data.map(d => ({ ...d, organizationId }))
        });
        break;
      case 'suppliers':
        result = await prisma.supplier.createMany({
          data: data.map(d => ({ ...d, organizationId }))
        });
        break;
      case 'products':
        result = await prisma.product.createMany({
          data: data.map(d => ({ ...d, organizationId }))
        });
        break;
      default:
        return res.status(400).json({ error: 'Invalid import type' });
    }

    res.json({
      message: 'Data imported successfully',
      count: result.count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

module.exports = router;

