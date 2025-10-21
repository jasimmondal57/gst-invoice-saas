const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all organizations for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('GET /organizations - User ID:', req.user.id);

    let organizations = await prisma.organizationMember.findMany({
      where: { userId: req.user.id },
      include: { organization: true }
    });

    console.log('GET /organizations - Found organizations:', organizations.length);

    // If user has no organizations, create a default one
    if (organizations.length === 0) {
      console.log('GET /organizations - No organizations found for user, creating default organization');

      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      // Generate a unique GSTIN placeholder
      const gstinPlaceholder = `TEMP-${req.user.id.substring(0, 8).toUpperCase()}`;

      const newOrganization = await prisma.organization.create({
        data: {
          name: `${user.firstName} ${user.lastName}'s Business`,
          gstin: gstinPlaceholder,
          email: user.email,
          phone: user.phone || '',
          address: '',
          city: '',
          state: '',
          pincode: '',
        }
      });

      console.log('GET /organizations - Created new organization:', newOrganization.id);

      // Add user as owner
      await prisma.organizationMember.create({
        data: {
          userId: req.user.id,
          organizationId: newOrganization.id,
          role: 'OWNER'
        }
      });

      organizations = [{ organization: newOrganization }];
    }

    console.log('GET /organizations - Returning organizations:', organizations.map(m => m.organization.id));
    res.json(organizations.map(m => m.organization));
  } catch (error) {
    console.error('GET /organizations - Error:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// Create organization
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, gstin, email, phone, address, city, state, pincode } = req.body;

    const organization = await prisma.organization.create({
      data: {
        name,
        gstin,
        email,
        phone,
        address,
        city,
        state,
        pincode,
      }
    });

    // Add creator as owner
    await prisma.organizationMember.create({
      data: {
        userId: req.user.id,
        organizationId: organization.id,
        role: 'OWNER'
      }
    });

    res.status(201).json(organization);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

// Get organization details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: req.params.id }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(organization);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// Update organization
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Update organization request:', {
      id: req.params.id,
      bodyKeys: Object.keys(req.body),
      body: req.body
    });

    // Filter allowed fields to prevent schema validation errors
    const allowedFields = [
      'name', 'gstin', 'pan', 'email', 'phone', 'address', 'city', 'state', 'pincode', 'country',
      'logo', 'website', 'businessType', 'invoicePrefix', 'invoiceStartNumber', 'invoiceTemplate',
      'defaultDueDate', 'paymentTerms', 'bankName', 'bankAccount', 'bankIFSC'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (field in req.body && req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== '') {
        updateData[field] = req.body[field];
      }
    });

    console.log('Update data to be saved:', updateData);

    const organization = await prisma.organization.update({
      where: { id: req.params.id },
      data: updateData
    });

    console.log('Organization updated successfully:', organization.id);
    res.json(organization);
  } catch (error) {
    console.error('Organization update error:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    });

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return res.status(400).json({ error: `${field} already exists` });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.status(500).json({ error: 'Failed to update organization', details: error.message });
  }
});

module.exports = router;

