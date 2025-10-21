const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
app.use(express.json());

const prisma = new PrismaClient();
const reportsRouter = require('../routes/reports');

// Mock auth middleware
app.use((req, res, next) => {
  req.user = { id: 'test-user-id' };
  next();
});

app.use('/api/v1/reports', reportsRouter);

describe('Reports Module Tests', () => {
  let organizationId = 'test-org-id';
  let customerId = 'test-customer-id';
  let supplierId = 'test-supplier-id';

  beforeAll(async () => {
    // Setup test data
    await prisma.organization.create({
      data: {
        id: organizationId,
        name: 'Test Organization',
        gstin: '27AABCT1234H1Z0'
      }
    });

    // Create test customer
    await prisma.customer.create({
      data: {
        id: customerId,
        organizationId,
        name: 'Test Customer',
        gstin: '27AABCT1234H1Z1',
        email: 'customer@example.com'
      }
    });

    // Create test supplier
    await prisma.supplier.create({
      data: {
        id: supplierId,
        organizationId,
        name: 'Test Supplier',
        gstin: '27AABCT1234H1Z2',
        email: 'supplier@example.com'
      }
    });

    // Create test invoices
    await prisma.invoice.create({
      data: {
        organizationId,
        customerId,
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
        status: 'COMPLETED'
      }
    });

    // Create test purchases
    await prisma.purchase.create({
      data: {
        organizationId,
        supplierId,
        purchaseNumber: 'PUR-001',
        purchaseDate: new Date(),
        dueDate: new Date(),
        supplierGSTIN: '27AABCT1234H1Z2',
        supplierName: 'Test Supplier',
        subtotal: 500,
        totalGST: 90,
        total: 590,
        status: 'COMPLETED'
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Sales Report', () => {
    test('Get sales report', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/sales-report?organizationId=${organizationId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('totalTax');
      expect(response.body).toHaveProperty('invoices');
    });

    test('Get sales report with date range', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/v1/reports/sales-report?organizationId=${organizationId}&startDate=${startDate}&endDate=${endDate}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalRevenue');
    });
  });

  describe('Purchase Report', () => {
    test('Get purchase report', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/purchase-report?organizationId=${organizationId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalCost');
      expect(response.body).toHaveProperty('totalTax');
      expect(response.body).toHaveProperty('purchases');
    });
  });

  describe('Profit & Loss Report', () => {
    test('Get profit and loss report', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/profit-loss?organizationId=${organizationId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('totalCost');
      expect(response.body).toHaveProperty('profit');
      expect(response.body).toHaveProperty('profitMargin');
    });
  });

  describe('Customer-wise Report', () => {
    test('Get customer-wise report', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/customer-report?organizationId=${organizationId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Supplier-wise Report', () => {
    test('Get supplier-wise report', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/supplier-report?organizationId=${organizationId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GST Reports', () => {
    test('Get GSTR-1 report', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/gstr-1?organizationId=${organizationId}&month=10&year=2025`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('supplies');
    });

    test('Get GSTR-2 report', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/gstr-2?organizationId=${organizationId}&month=10&year=2025`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('inwardSupplies');
    });

    test('Get GSTR-3B report', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/gstr-3b?organizationId=${organizationId}&month=10&year=2025`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('outwardSupplies');
      expect(response.body).toHaveProperty('inwardSupplies');
      expect(response.body).toHaveProperty('netTax');
    });

    test('Get GSTR-9 report', async () => {
      const response = await request(app)
        .get(`/api/v1/reports/gstr-9?organizationId=${organizationId}&year=2025`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalOutwardSupplies');
      expect(response.body).toHaveProperty('totalInwardSupplies');
    });
  });
});

module.exports = {};

