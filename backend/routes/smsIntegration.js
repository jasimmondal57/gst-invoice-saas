const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// SMS templates
const smsTemplates = {
  INVOICE_SENT: 'Invoice #{invoiceNumber} for ₹{amount} has been sent. View: {link}',
  PAYMENT_REMINDER: 'Reminder: Invoice #{invoiceNumber} for ₹{amount} is due on {dueDate}. Pay now: {link}',
  PAYMENT_RECEIVED: 'Payment of ₹{amount} received for invoice #{invoiceNumber}. Thank you!',
  OTP: 'Your OTP is {otp}. Valid for 10 minutes.',
};

// ===== SMS CONFIGURATION =====

// Get SMS Configuration
router.get('/config', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;

    const config = await prisma.smsConfig.findFirst({
      where: { organizationId },
    });

    if (!config) {
      return res.status(404).json({ error: 'SMS configuration not found' });
    }

    res.json(config);
  } catch (error) {
    console.error('Error fetching SMS config:', error);
    res.status(500).json({ error: 'Failed to fetch SMS configuration' });
  }
});

// Update SMS Configuration
router.put('/config', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { provider, apiKey, apiSecret, senderId } = req.body;

    const config = await prisma.smsConfig.upsert({
      where: { organizationId },
      update: {
        provider,
        apiKey,
        apiSecret,
        senderId,
      },
      create: {
        organizationId,
        provider,
        apiKey,
        apiSecret,
        senderId,
      },
    });

    res.json(config);
  } catch (error) {
    console.error('Error updating SMS config:', error);
    res.status(500).json({ error: 'Failed to update SMS configuration' });
  }
});

// ===== SMS TEMPLATES =====

// Get SMS Templates
router.get('/templates', authMiddleware, async (req, res) => {
  try {
    res.json(smsTemplates);
  } catch (error) {
    console.error('Error fetching SMS templates:', error);
    res.status(500).json({ error: 'Failed to fetch SMS templates' });
  }
});

// ===== SEND SMS =====

// Send Invoice SMS
router.post('/send-invoice', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { invoiceId, recipientPhone } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Create SMS log
    const sms = await prisma.smsLog.create({
      data: {
        organizationId,
        invoiceId,
        recipientPhone,
        message: `Invoice #${invoice.invoiceNumber} for ₹${invoice.totalAmount} has been sent.`,
        type: 'INVOICE_SENT',
        status: 'SENT',
      },
    });

    // In production, send actual SMS via Twilio or similar
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({...});

    res.json({ success: true, sms });
  } catch (error) {
    console.error('Error sending invoice SMS:', error);
    res.status(500).json({ error: 'Failed to send invoice SMS' });
  }
});

// Send Payment Reminder SMS
router.post('/send-reminder', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { invoiceId, recipientPhone } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const sms = await prisma.smsLog.create({
      data: {
        organizationId,
        invoiceId,
        recipientPhone,
        message: `Reminder: Invoice #${invoice.invoiceNumber} for ₹${invoice.totalAmount} is pending.`,
        type: 'PAYMENT_REMINDER',
        status: 'SENT',
      },
    });

    res.json({ success: true, sms });
  } catch (error) {
    console.error('Error sending reminder SMS:', error);
    res.status(500).json({ error: 'Failed to send reminder SMS' });
  }
});

// Send Payment Received SMS
router.post('/send-payment-received', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { invoiceId, recipientPhone, paymentAmount } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const sms = await prisma.smsLog.create({
      data: {
        organizationId,
        invoiceId,
        recipientPhone,
        message: `Payment of ₹${paymentAmount} received for invoice #${invoice.invoiceNumber}. Thank you!`,
        type: 'PAYMENT_RECEIVED',
        status: 'SENT',
      },
    });

    res.json({ success: true, sms });
  } catch (error) {
    console.error('Error sending payment received SMS:', error);
    res.status(500).json({ error: 'Failed to send payment received SMS' });
  }
});

// Send OTP SMS
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Create OTP log
    const otpLog = await prisma.otpLog.create({
      data: {
        phone,
        otp: otp.toString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // In production, send actual SMS
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({...});

    res.json({ success: true, otpId: otpLog.id });
  } catch (error) {
    console.error('Error sending OTP SMS:', error);
    res.status(500).json({ error: 'Failed to send OTP SMS' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { otpId, otp } = req.body;

    const otpLog = await prisma.otpLog.findUnique({
      where: { id: otpId },
    });

    if (!otpLog) {
      return res.status(404).json({ error: 'OTP not found' });
    }

    if (otpLog.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (new Date() > otpLog.expiresAt) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Mark OTP as verified
    await prisma.otpLog.update({
      where: { id: otpId },
      data: { verified: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// ===== SMS LOGS =====

// Get SMS Logs
router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { limit = 20, page = 1 } = req.query;

    const logs = await prisma.smsLog.findMany({
      where: { organizationId },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.smsLog.count({
      where: { organizationId },
    });

    res.json({ logs, total, page, limit });
  } catch (error) {
    console.error('Error fetching SMS logs:', error);
    res.status(500).json({ error: 'Failed to fetch SMS logs' });
  }
});

module.exports = router;

