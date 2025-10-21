const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const prisma = new PrismaClient();
const backupRouter = require('../routes/backup');

// Mock auth middleware
app.use((req, res, next) => {
  req.user = { id: 'test-user-id' };
  next();
});

app.use('/api/v1/backup', backupRouter);

describe('Backup Module Tests', () => {
  let organizationId = 'test-org-id';
  let backupFileName;

  beforeAll(async () => {
    // Setup test data
    await prisma.organization.create({
      data: {
        id: organizationId,
        name: 'Test Organization',
        gstin: '27AABCT1234H1Z0'
      }
    });

    // Create test invoice
    await prisma.invoice.create({
      data: {
        organizationId,
        invoiceNumber: 'INV-001',
        invoiceDate: new Date(),
        dueDate: new Date(),
        supplierGSTIN: '27AABCT1234H1Z0',
        supplierName: 'Test Supplier',
        customerGSTIN: '27AABCT1234H1Z1',
        customerName: 'Test Customer',
        subtotal: 1000,
        totalGST: 180,
        total: 1180,
        status: 'DRAFT'
      }
    });
  });

  afterAll(async () => {
    // Cleanup test backups
    const backupDir = path.join(__dirname, '../backups');
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir);
      files.forEach(file => {
        if (file.includes('test-org-id')) {
          fs.unlinkSync(path.join(backupDir, file));
        }
      });
    }
    await prisma.$disconnect();
  });

  describe('Backup Operations', () => {
    test('Create backup', async () => {
      const response = await request(app)
        .post('/api/v1/backup/create')
        .send({
          organizationId
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('fileName');
      expect(response.body).toHaveProperty('size');
      backupFileName = response.body.fileName;
    });

    test('List backups', async () => {
      const response = await request(app)
        .get(`/api/v1/backup/list/${organizationId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('Download backup', async () => {
      const response = await request(app)
        .get(`/api/v1/backup/download/${backupFileName}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('Export Operations', () => {
    test('Export invoices', async () => {
      const response = await request(app)
        .get(`/api/v1/backup/export/invoices/${organizationId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Export customers', async () => {
      const response = await request(app)
        .get(`/api/v1/backup/export/customers/${organizationId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Export suppliers', async () => {
      const response = await request(app)
        .get(`/api/v1/backup/export/suppliers/${organizationId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Export purchases', async () => {
      const response = await request(app)
        .get(`/api/v1/backup/export/purchases/${organizationId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Import Operations', () => {
    test('Import data', async () => {
      const importData = {
        organizationId,
        type: 'invoices',
        data: [
          {
            invoiceNumber: 'INV-IMPORT-001',
            invoiceDate: new Date(),
            dueDate: new Date(),
            supplierGSTIN: '27AABCT1234H1Z0',
            supplierName: 'Test Supplier',
            customerGSTIN: '27AABCT1234H1Z1',
            customerName: 'Test Customer',
            subtotal: 2000,
            totalGST: 360,
            total: 2360,
            status: 'DRAFT'
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/backup/import')
        .send(importData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('imported');
    });
  });

  describe('Restore Operations', () => {
    test('Restore from backup', async () => {
      const response = await request(app)
        .post('/api/v1/backup/restore')
        .send({
          organizationId,
          fileName: backupFileName
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('restored');
    });
  });
});

module.exports = {};

