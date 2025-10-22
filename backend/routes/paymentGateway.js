const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// ===== STRIPE INTEGRATION =====

// Create Stripe Payment Intent
router.post('/stripe/create-intent', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { invoiceId, amount } = req.body;

    // Validate invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        organizationId,
        amount,
        paymentMode: 'STRIPE',
        status: 'PENDING',
        transactionId: `stripe_${Date.now()}`,
      },
    });

    // In production, call Stripe API
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100),
    //   currency: 'inr',
    //   metadata: { invoiceId, paymentId: payment.id },
    // });

    res.json({
      paymentId: payment.id,
      clientSecret: 'stripe_client_secret_demo',
      amount,
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Error creating Stripe payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm Stripe Payment
router.post('/stripe/confirm', authMiddleware, async (req, res) => {
  try {
    const { paymentId, paymentIntentId } = req.body;

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        transactionId: paymentIntentId,
      },
    });

    // Update invoice status
    await prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'PAID' },
    });

    res.json({ success: true, payment });
  } catch (error) {
    console.error('Error confirming Stripe payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// ===== RAZORPAY INTEGRATION =====

// Create Razorpay Order
router.post('/razorpay/create-order', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { invoiceId, amount } = req.body;

    // Validate invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        organizationId,
        amount,
        paymentMode: 'RAZORPAY',
        status: 'PENDING',
        transactionId: `razorpay_${Date.now()}`,
      },
    });

    // In production, call Razorpay API
    // const Razorpay = require('razorpay');
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET,
    // });
    // const order = await razorpay.orders.create({
    //   amount: Math.round(amount * 100),
    //   currency: 'INR',
    //   receipt: payment.id,
    // });

    res.json({
      paymentId: payment.id,
      orderId: 'razorpay_order_demo',
      amount,
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify Razorpay Payment
router.post('/razorpay/verify', authMiddleware, async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    // In production, verify signature
    // const crypto = require('crypto');
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    //   .digest('hex');
    // if (expectedSignature !== razorpaySignature) {
    //   return res.status(400).json({ error: 'Invalid signature' });
    // }

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        transactionId: razorpayPaymentId,
      },
    });

    // Update invoice status
    await prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'PAID' },
    });

    res.json({ success: true, payment });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// ===== SUBSCRIPTION MANAGEMENT =====

// Create Subscription
router.post('/subscriptions', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { planId, billingCycle } = req.body;

    const subscription = await prisma.subscription.create({
      data: {
        organizationId,
        planId,
        billingCycle,
        status: 'ACTIVE',
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Get Subscription
router.get('/subscriptions/:organizationId', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.params;

    const subscription = await prisma.subscription.findFirst({
      where: { organizationId },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Cancel Subscription
router.post('/subscriptions/:subscriptionId/cancel', authMiddleware, async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'CANCELLED' },
    });

    res.json(subscription);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// ===== INVOICE PAYMENT LINKS =====

// Create Payment Link
router.post('/payment-links', authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { invoiceId } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const paymentLink = await prisma.paymentLink.create({
      data: {
        invoiceId,
        organizationId,
        link: `${process.env.NEXT_PUBLIC_API_URL}/pay/${invoiceId}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      },
    });

    res.json(paymentLink);
  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ error: 'Failed to create payment link' });
  }
});

// Get Payment Link
router.get('/payment-links/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const paymentLink = await prisma.paymentLink.findFirst({
      where: { invoiceId },
    });

    if (!paymentLink) {
      return res.status(404).json({ error: 'Payment link not found' });
    }

    res.json(paymentLink);
  } catch (error) {
    console.error('Error fetching payment link:', error);
    res.status(500).json({ error: 'Failed to fetch payment link' });
  }
});

module.exports = router;

