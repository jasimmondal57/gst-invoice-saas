const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all users in organization
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.query;

    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: { user: true }
    });

    const users = members.map(m => ({
      id: m.user.id,
      email: m.user.email,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      phone: m.user.phone,
      role: m.role,
      status: m.user.status,
      createdAt: m.createdAt
    }));

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Invite user to organization
router.post('/invite', authMiddleware, async (req, res) => {
  try {
    const { organizationId, email, role } = req.body;

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    // If user doesn't exist, create with temporary password
    if (!user) {
      const bcrypt = require('bcryptjs');
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: email.split('@')[0],
          status: 'ACTIVE'
        }
      });
    }

    // Add user to organization
    const member = await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId,
        role: role || 'VIEWER'
      }
    });

    res.status(201).json({ message: 'User invited successfully', member });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to invite user' });
  }
});

// Update user role
router.put('/:userId/role', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { organizationId, role } = req.body;

    const member = await prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId
        }
      },
      data: { role }
    });

    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Remove user from organization
router.delete('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { organizationId } = req.query;

    await prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId
        }
      }
    });

    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove user' });
  }
});

// Get audit trail
router.get('/audit-trail/:organizationId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const auditTrails = await prisma.auditTrail.findMany({
      where: { organizationId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.auditTrail.count({
      where: { organizationId }
    });

    res.json({
      auditTrails,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
});

// Log audit trail
router.post('/audit-trail', authMiddleware, async (req, res) => {
  try {
    const { organizationId, userId, action, entity, entityId, changes } = req.body;

    const auditTrail = await prisma.auditTrail.create({
      data: {
        organizationId,
        userId,
        action,
        entity,
        entityId,
        changes
      }
    });

    res.status(201).json(auditTrail);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to log audit trail' });
  }
});

// Create custom role
router.post('/roles', authMiddleware, async (req, res) => {
  try {
    const { organizationId, name, description, permissions } = req.body;

    const role = await prisma.customRole.create({
      data: {
        organizationId,
        name,
        description,
        permissions: permissions || []
      }
    });

    res.status(201).json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Get custom roles
router.get('/roles/:organizationId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.params;

    const roles = await prisma.customRole.findMany({
      where: { organizationId }
    });

    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Update custom role
router.put('/roles/:roleId', authMiddleware, async (req, res) => {
  try {
    const { roleId } = req.params;
    const { name, description, permissions } = req.body;

    const role = await prisma.customRole.update({
      where: { id: roleId },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        permissions: permissions !== undefined ? permissions : undefined
      }
    });

    res.json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete custom role
router.delete('/roles/:roleId', authMiddleware, async (req, res) => {
  try {
    const { roleId } = req.params;

    await prisma.customRole.delete({
      where: { id: roleId }
    });

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

module.exports = router;

