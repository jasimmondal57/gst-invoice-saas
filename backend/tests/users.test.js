const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
app.use(express.json());

const prisma = new PrismaClient();
const usersRouter = require('../routes/users');

// Mock auth middleware
app.use((req, res, next) => {
  req.user = { id: 'test-user-id' };
  next();
});

app.use('/api/v1/users', usersRouter);

describe('User Management Module Tests', () => {
  let organizationId = 'test-org-id';
  let userId = 'test-user-id';
  let invitedUserId;
  let customRoleId;

  beforeAll(async () => {
    // Setup test data
    await prisma.organization.create({
      data: {
        id: organizationId,
        name: 'Test Organization',
        gstin: '27AABCT1234H1Z0'
      }
    });

    await prisma.user.create({
      data: {
        id: userId,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '9876543210',
        password: 'hashed-password'
      }
    });

    await prisma.organizationMember.create({
      data: {
        userId,
        organizationId,
        role: 'OWNER'
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('User Management', () => {
    test('Get all users in organization', async () => {
      const response = await request(app)
        .get(`/api/v1/users?organizationId=${organizationId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Invite user to organization', async () => {
      const response = await request(app)
        .post('/api/v1/users/invite')
        .send({
          organizationId,
          email: 'newuser@example.com',
          role: 'MANAGER'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('newuser@example.com');
      invitedUserId = response.body.id;
    });

    test('Update user role', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${invitedUserId}`)
        .send({
          organizationId,
          role: 'ACCOUNTANT'
        });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('ACCOUNTANT');
    });

    test('Get user details', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
    });
  });

  describe('Custom Roles', () => {
    test('Create custom role', async () => {
      const response = await request(app)
        .post('/api/v1/users/roles')
        .send({
          organizationId,
          name: 'Custom Manager',
          description: 'Custom manager role',
          permissions: JSON.stringify(['create_invoice', 'view_reports'])
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Custom Manager');
      customRoleId = response.body.id;
    });

    test('Get all custom roles', async () => {
      const response = await request(app)
        .get(`/api/v1/users/roles?organizationId=${organizationId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Update custom role', async () => {
      const response = await request(app)
        .put(`/api/v1/users/roles/${customRoleId}`)
        .send({
          name: 'Updated Custom Manager',
          permissions: JSON.stringify(['create_invoice', 'view_reports', 'manage_payments'])
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Custom Manager');
    });

    test('Delete custom role', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/roles/${customRoleId}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Audit Trail', () => {
    test('Get audit trail', async () => {
      const response = await request(app)
        .get(`/api/v1/users/audit-trail?organizationId=${organizationId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Get audit trail with filters', async () => {
      const response = await request(app)
        .get(`/api/v1/users/audit-trail?organizationId=${organizationId}&action=CREATE&entity=Invoice`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Delete Operations', () => {
    test('Remove user from organization', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${invitedUserId}`)
        .send({
          organizationId
        });

      expect(response.status).toBe(200);
    });
  });
});

module.exports = {};

