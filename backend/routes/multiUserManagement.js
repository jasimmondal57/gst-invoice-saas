const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// ===== USER MANAGEMENT =====

// Get all users in organization
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;

    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: { user: true },
    });

    const users = members.map((member) => ({
      id: member.user.id,
      email: member.user.email,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      role: member.user.role,
      status: member.user.status,
      joinedAt: member.createdAt,
    }));

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role
router.put('/users/:userId/role', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { userId } = req.params;
    const { role } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Log activity
    await prisma.auditTrail.create({
      data: {
        organizationId,
        userId: req.body.userId || userId,
        action: 'UPDATE_USER_ROLE',
        entity: 'User',
        entityId: userId,
        changes: JSON.stringify({ role }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Update user status
router.put('/users/:userId/status', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { userId } = req.params;
    const { status } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    // Log activity
    await prisma.auditTrail.create({
      data: {
        organizationId,
        userId: req.body.userId || userId,
        action: 'UPDATE_USER_STATUS',
        entity: 'User',
        entityId: userId,
        changes: JSON.stringify({ status }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Remove user from organization
router.delete('/users/:userId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { userId } = req.params;

    const member = await prisma.organizationMember.findFirst({
      where: { organizationId, userId },
    });

    if (!member) {
      return res.status(404).json({ error: 'User not found in organization' });
    }

    await prisma.organizationMember.delete({
      where: { id: member.id },
    });

    // Log activity
    await prisma.auditTrail.create({
      data: {
        organizationId,
        userId: req.body.userId || userId,
        action: 'REMOVE_USER',
        entity: 'User',
        entityId: userId,
      },
    });

    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error removing user:', error);
    res.status(500).json({ error: 'Failed to remove user' });
  }
});

// ===== CUSTOM ROLES =====

// Create custom role
router.post('/roles', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { name, description, permissions } = req.body;

    const role = await prisma.customRole.create({
      data: {
        organizationId,
        name,
        description,
        permissions: JSON.stringify(permissions),
      },
    });

    res.status(201).json({
      ...role,
      permissions: JSON.parse(role.permissions || '[]'),
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Get all roles
router.get('/roles', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;

    const roles = await prisma.customRole.findMany({
      where: { organizationId },
    });

    const formattedRoles = roles.map((role) => ({
      ...role,
      permissions: JSON.parse(role.permissions || '[]'),
    }));

    res.json(formattedRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Update role
router.put('/roles/:roleId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { roleId } = req.params;
    const { name, description, permissions } = req.body;

    const role = await prisma.customRole.findUnique({
      where: { id: roleId },
    });

    if (!role || role.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const updated = await prisma.customRole.update({
      where: { id: roleId },
      data: {
        name: name || role.name,
        description: description || role.description,
        permissions: permissions ? JSON.stringify(permissions) : role.permissions,
      },
    });

    res.json({
      ...updated,
      permissions: JSON.parse(updated.permissions || '[]'),
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete role
router.delete('/roles/:roleId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { roleId } = req.params;

    const role = await prisma.customRole.findUnique({
      where: { id: roleId },
    });

    if (!role || role.organizationId !== organizationId) {
      return res.status(404).json({ error: 'Role not found' });
    }

    await prisma.customRole.delete({
      where: { id: roleId },
    });

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// ===== AUDIT TRAIL =====

// Get audit trail
router.get('/audit-trail', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { action, entity, limit = 100 } = req.query;

    const where: any = { organizationId };
    if (action) where.action = action;
    if (entity) where.entity = entity;

    const trails = await prisma.auditTrail.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(trails);
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
});

// Get user activity
router.get('/audit-trail/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const trails = await prisma.auditTrail.findMany({
      where: { organizationId, userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json(trails);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

// Get activity summary
router.get('/audit-trail/summary', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;

    const trails = await prisma.auditTrail.findMany({
      where: { organizationId },
    });

    const summary = {
      totalActions: trails.length,
      actionsByType: {},
      actionsByEntity: {},
      actionsByUser: {},
    };

    trails.forEach((trail) => {
      summary.actionsByType[trail.action] = (summary.actionsByType[trail.action] || 0) + 1;
      summary.actionsByEntity[trail.entity] = (summary.actionsByEntity[trail.entity] || 0) + 1;
      summary.actionsByUser[trail.userId] = (summary.actionsByUser[trail.userId] || 0) + 1;
    });

    res.json(summary);
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    res.status(500).json({ error: 'Failed to fetch activity summary' });
  }
});

module.exports = router;

