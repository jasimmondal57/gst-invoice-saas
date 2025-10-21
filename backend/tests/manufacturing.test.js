const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
app.use(express.json());

const prisma = new PrismaClient();
const manufacturingRouter = require('../routes/manufacturing');

// Mock auth middleware
app.use((req, res, next) => {
  req.user = { id: 'test-user-id' };
  next();
});

app.use('/api/v1/manufacturing', manufacturingRouter);

describe('Manufacturing Module Tests', () => {
  let organizationId = 'test-org-id';
  let productId = 'test-product-id';
  let bomId;
  let productionOrderId;

  beforeAll(async () => {
    // Setup test data
    await prisma.organization.create({
      data: {
        id: organizationId,
        name: 'Test Organization',
        gstin: '27AABCT1234H1Z0'
      }
    });

    await prisma.product.create({
      data: {
        id: productId,
        organizationId,
        name: 'Test Product',
        sku: 'TEST-001',
        hsn: '1234',
        gstRate: 18
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('BOM Management', () => {
    test('Create BOM', async () => {
      const response = await request(app)
        .post('/api/v1/manufacturing/bom')
        .send({
          organizationId,
          productId,
          name: 'Test BOM',
          description: 'Test BOM Description',
          items: []
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test BOM');
      bomId = response.body.id;
    });

    test('Get all BOMs', async () => {
      const response = await request(app)
        .get(`/api/v1/manufacturing/bom?organizationId=${organizationId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('Get BOM details', async () => {
      const response = await request(app)
        .get(`/api/v1/manufacturing/bom/${bomId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(bomId);
    });

    test('Update BOM', async () => {
      const response = await request(app)
        .put(`/api/v1/manufacturing/bom/${bomId}`)
        .send({
          name: 'Updated BOM',
          description: 'Updated Description',
          items: []
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated BOM');
    });
  });

  describe('Production Order Management', () => {
    test('Create Production Order', async () => {
      const response = await request(app)
        .post('/api/v1/manufacturing/production-orders')
        .send({
          organizationId,
          bomId,
          quantity: 100,
          notes: 'Test production order'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.quantity).toBe(100);
      expect(response.body.status).toBe('DRAFT');
      productionOrderId = response.body.id;
    });

    test('Get all Production Orders', async () => {
      const response = await request(app)
        .get(`/api/v1/manufacturing/production-orders?organizationId=${organizationId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Get Production Order details', async () => {
      const response = await request(app)
        .get(`/api/v1/manufacturing/production-orders/${productionOrderId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(productionOrderId);
    });

    test('Update Production Order status', async () => {
      const response = await request(app)
        .put(`/api/v1/manufacturing/production-orders/${productionOrderId}`)
        .send({
          status: 'IN_PROGRESS',
          startDate: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('IN_PROGRESS');
    });

    test('Get Production Summary', async () => {
      const response = await request(app)
        .get(`/api/v1/manufacturing/production-summary/${organizationId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('inProgressOrders');
    });
  });

  describe('Delete Operations', () => {
    test('Delete Production Order', async () => {
      const response = await request(app)
        .delete(`/api/v1/manufacturing/production-orders/${productionOrderId}`);

      expect(response.status).toBe(200);
    });

    test('Delete BOM', async () => {
      const response = await request(app)
        .delete(`/api/v1/manufacturing/bom/${bomId}`);

      expect(response.status).toBe(200);
    });
  });
});

module.exports = {};

