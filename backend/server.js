const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/organizations', require('./routes/organizations'));
app.use('/api/v1/invoices', require('./routes/invoices'));
app.use('/api/v1/customers', require('./routes/customers'));
app.use('/api/v1/suppliers', require('./routes/suppliers'));
app.use('/api/v1/products', require('./routes/products'));
app.use('/api/v1/purchases', require('./routes/purchases'));
app.use('/api/v1/inventory', require('./routes/inventory'));
app.use('/api/v1/party-groups', require('./routes/partyGroups'));
app.use('/api/v1/payments', require('./routes/payments'));
app.use('/api/v1/e-invoices', require('./routes/eInvoices'));
app.use('/api/v1/reports', require('./routes/reports'));
app.use('/api/v1/manufacturing', require('./routes/manufacturing'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/backup', require('./routes/backup'));

// Phase 1: Purchase Orders, Bank Reconciliation, Cheques
app.use('/api/v1/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/v1/bank-reconciliation', require('./routes/bankReconciliation'));
app.use('/api/v1/cheques', require('./routes/cheques'));

// Phase 1 Continuation: Inventory Reports, Payment Reconciliation & Enhanced Inventory
app.use('/api/v1/reports/inventory', require('./routes/inventoryReports'));
app.use('/api/v1/payment-reconciliation', require('./routes/paymentReconciliation'));
app.use('/api/v1/inventory-enhanced', require('./routes/enhancedInventory'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error middleware caught:', err);
  console.error('Error stack:', err.stack);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`Sending error response: ${status} - ${message}`);

  res.status(status).json({
    error: message,
    status: status,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

