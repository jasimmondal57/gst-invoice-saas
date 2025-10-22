const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Email templates
const emailTemplates = {
  INVOICE_SENT: {
    subject: 'Invoice #{invoiceNumber}',
    body: `
      <h2>Invoice #{invoiceNumber}</h2>
      <p>Dear {customerName},</p>
      <p>Please find attached your invoice for ₹{amount}.</p>
      <p>Invoice Date: {invoiceDate}</p>
      <p>Due Date: {dueDate}</p>
      <p>Thank you for your business!</p>
    `,
  },
  PAYMENT_REMINDER: {
    subject: 'Payment Reminder - Invoice #{invoiceNumber}',
    body: `
      <h2>Payment Reminder</h2>
      <p>Dear {customerName},</p>
      <p>This is a reminder that invoice #{invoiceNumber} for ₹{amount} is due on {dueDate}.</p>
      <p>Please make the payment at your earliest convenience.</p>
      <p>Thank you!</p>
    `,
  },
  PAYMENT_RECEIVED: {
    subject: 'Payment Received - Invoice #{invoiceNumber}',
    body: `
      <h2>Payment Received</h2>
      <p>Dear {customerName},</p>
      <p>We have received your payment of ₹{amount} for invoice #{invoiceNumber}.</p>
      <p>Payment Date: {paymentDate}</p>
      <p>Thank you for your prompt payment!</p>
    `,
  },
  WELCOME: {
    subject: 'Welcome to GST Invoice SaaS',
    body: `
      <h2>Welcome!</h2>
      <p>Dear {userName},</p>
      <p>Welcome to GST Invoice SaaS. Your account has been created successfully.</p>
      <p>You can now log in and start managing your invoices.</p>
      <p>Best regards,<br/>GST Invoice SaaS Team</p>
    `,
  },
};

// ===== EMAIL CONFIGURATION =====

// Get Email Configuration
router.get('/config', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;

    const config = await prisma.emailConfig.findFirst({
      where: { organizationId },
    });

    if (!config) {
      return res.status(404).json({ error: 'Email configuration not found' });
    }

    res.json(config);
  } catch (error) {
    console.error('Error fetching email config:', error);
    res.status(500).json({ error: 'Failed to fetch email configuration' });
  }
});

// Update Email Configuration
router.put('/config', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { smtpHost, smtpPort, smtpUser, smtpPassword, fromEmail } = req.body;

    const config = await prisma.emailConfig.upsert({
      where: { organizationId },
      update: {
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        fromEmail,
      },
      create: {
        organizationId,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        fromEmail,
      },
    });

    res.json(config);
  } catch (error) {
    console.error('Error updating email config:', error);
    res.status(500).json({ error: 'Failed to update email configuration' });
  }
});

// ===== EMAIL TEMPLATES =====

// Get Email Templates
router.get('/templates', authMiddleware, async (req, res) => {
  try {
    res.json(emailTemplates);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ error: 'Failed to fetch email templates' });
  }
});

// ===== SEND EMAILS =====

// Send Invoice Email
router.post('/send-invoice', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { invoiceId, recipientEmail } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Create email record
    const email = await prisma.emailLog.create({
      data: {
        organizationId,
        invoiceId,
        recipientEmail,
        subject: `Invoice #${invoice.invoiceNumber}`,
        type: 'INVOICE_SENT',
        status: 'SENT',
      },
    });

    // In production, send actual email via SMTP
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({...});

    res.json({ success: true, email });
  } catch (error) {
    console.error('Error sending invoice email:', error);
    res.status(500).json({ error: 'Failed to send invoice email' });
  }
});

// Send Payment Reminder
router.post('/send-reminder', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { invoiceId, recipientEmail } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const email = await prisma.emailLog.create({
      data: {
        organizationId,
        invoiceId,
        recipientEmail,
        subject: `Payment Reminder - Invoice #${invoice.invoiceNumber}`,
        type: 'PAYMENT_REMINDER',
        status: 'SENT',
      },
    });

    res.json({ success: true, email });
  } catch (error) {
    console.error('Error sending reminder email:', error);
    res.status(500).json({ error: 'Failed to send reminder email' });
  }
});

// Send Payment Received Email
router.post('/send-payment-received', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { invoiceId, recipientEmail, paymentAmount } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const email = await prisma.emailLog.create({
      data: {
        organizationId,
        invoiceId,
        recipientEmail,
        subject: `Payment Received - Invoice #${invoice.invoiceNumber}`,
        type: 'PAYMENT_RECEIVED',
        status: 'SENT',
      },
    });

    res.json({ success: true, email });
  } catch (error) {
    console.error('Error sending payment received email:', error);
    res.status(500).json({ error: 'Failed to send payment received email' });
  }
});

// ===== EMAIL LOGS =====

// Get Email Logs
router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { limit = 20, page = 1 } = req.query;

    const logs = await prisma.emailLog.findMany({
      where: { organizationId },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.emailLog.count({
      where: { organizationId },
    });

    res.json({ logs, total, page, limit });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({ error: 'Failed to fetch email logs' });
  }
});

// Resend Email
router.post('/resend/:emailLogId', authMiddleware, async (req, res) => {
  try {
    const { emailLogId } = req.params;

    const emailLog = await prisma.emailLog.update({
      where: { id: emailLogId },
      data: { status: 'SENT' },
    });

    res.json({ success: true, emailLog });
  } catch (error) {
    console.error('Error resending email:', error);
    res.status(500).json({ error: 'Failed to resend email' });
  }
});

module.exports = router;

