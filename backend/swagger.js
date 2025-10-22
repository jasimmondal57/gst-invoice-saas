const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GST Invoice SaaS API',
      version: '1.0.0',
      description: 'Complete API documentation for GST Invoice Management SaaS Platform',
      contact: {
        name: 'Support',
        email: 'support@gstinvoice.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server',
      },
      {
        url: 'https://api.gstinvoice.com/api/v1',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Invoice: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            invoiceNumber: { type: 'string' },
            invoiceDate: { type: 'string', format: 'date-time' },
            customerId: { type: 'string' },
            subtotal: { type: 'number' },
            taxAmount: { type: 'number' },
            totalAmount: { type: 'number' },
            status: { type: 'string', enum: ['DRAFT', 'SENT', 'PAID', 'CANCELLED'] },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            invoiceId: { type: 'string' },
            amount: { type: 'number' },
            paymentMode: { type: 'string', enum: ['CASH', 'CHEQUE', 'BANK_TRANSFER', 'STRIPE', 'RAZORPAY'] },
            status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED'] },
            transactionId: { type: 'string' },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            gstin: { type: 'string' },
            type: { type: 'string', enum: ['B2B', 'B2C'] },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};

