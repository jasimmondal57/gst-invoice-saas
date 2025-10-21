# Phase 1 API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Products API

### Get All Products
```
GET /products?organizationId=<orgId>
```
**Response**: Array of products with inventory

### Get Product Details
```
GET /products/:id
```
**Response**: Product with inventory and stock movements

### Create Product
```
POST /products
Content-Type: application/json

{
  "organizationId": "string",
  "name": "string",
  "description": "string",
  "hsn": "string",
  "sac": "string",
  "unit": "Nos|Kg|Ltr|Mtr|Box|Pcs",
  "price": number,
  "gstRate": number,
  "barcode": "string",
  "lowStockAlert": number,
  "openingStock": number
}
```

### Update Product
```
PUT /products/:id
Content-Type: application/json

{
  "name": "string",
  "description": "string",
  "price": number,
  "gstRate": number,
  "lowStockAlert": number
}
```

### Delete Product
```
DELETE /products/:id
```

### Update Inventory Stock
```
PUT /products/:id/inventory
Content-Type: application/json

{
  "organizationId": "string",
  "quantity": number,
  "type": "ADD|SUBTRACT|SET",
  "notes": "string"
}
```

---

## Payments API

### Get All Payments
```
GET /payments?organizationId=<orgId>&status=<status>
```
**Status**: PENDING|COMPLETED|FAILED|CANCELLED

**Response**: Array of payments

### Get Payment Details
```
GET /payments/:id
```

### Create Payment
```
POST /payments
Content-Type: application/json

{
  "organizationId": "string",
  "invoiceId": "string",
  "purchaseId": "string",
  "customerId": "string",
  "supplierId": "string",
  "amount": number,
  "paymentDate": "YYYY-MM-DD",
  "paymentMode": "CASH|CHEQUE|BANK_TRANSFER|CREDIT_CARD|DEBIT_CARD|UPI|WALLET",
  "referenceNo": "string",
  "notes": "string"
}
```

### Update Payment
```
PUT /payments/:id
Content-Type: application/json

{
  "amount": number,
  "paymentDate": "YYYY-MM-DD",
  "paymentMode": "string",
  "status": "PENDING|COMPLETED|FAILED|CANCELLED",
  "notes": "string"
}
```

### Delete Payment
```
DELETE /payments/:id
```

### Get Outstanding Payments
```
GET /payments/invoice/:invoiceId/outstanding
```

**Response**:
```json
{
  "invoiceId": "string",
  "invoiceAmount": number,
  "totalPaid": number,
  "outstanding": number,
  "payments": []
}
```

### Get Payment Summary
```
GET /payments/summary/all?organizationId=<orgId>
```

**Response**:
```json
{
  "totalPayments": number,
  "totalAmount": number,
  "byStatus": {
    "COMPLETED": number,
    "PENDING": number,
    "FAILED": number,
    "CANCELLED": number
  },
  "byMode": {
    "CASH": number,
    "CHEQUE": number,
    "BANK_TRANSFER": number,
    "CREDIT_CARD": number,
    "UPI": number
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "organizationId is required"
}
```

### 404 Not Found
```json
{
  "error": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch products",
  "details": "error message"
}
```

---

## Stock Movement Types

- **OPENING_STOCK**: Initial stock when product created
- **PURCHASE**: Stock received from supplier
- **SALE**: Stock sold to customer
- **ADJUSTMENT**: Manual stock adjustment
- **RETURN**: Stock returned by customer
- **DAMAGE**: Stock damaged/lost

---

## Payment Modes

- **CASH**: Direct cash payment
- **CHEQUE**: Cheque payment
- **BANK_TRANSFER**: Online bank transfer
- **CREDIT_CARD**: Credit card payment
- **DEBIT_CARD**: Debit card payment
- **UPI**: UPI payment
- **WALLET**: Digital wallet payment

---

## Payment Status

- **PENDING**: Payment awaiting confirmation
- **COMPLETED**: Payment successfully processed
- **FAILED**: Payment failed
- **CANCELLED**: Payment cancelled

---

## Example Requests

### Create Product with Opening Stock
```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org123",
    "name": "Laptop",
    "hsn": "8471.30",
    "unit": "Nos",
    "price": 50000,
    "gstRate": 18,
    "openingStock": 10
  }'
```

### Record Payment
```bash
curl -X POST http://localhost:5000/api/v1/payments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org123",
    "invoiceId": "inv123",
    "amount": 50000,
    "paymentDate": "2025-10-21",
    "paymentMode": "BANK_TRANSFER",
    "referenceNo": "TXN-12345"
  }'
```

### Adjust Stock
```bash
curl -X PUT http://localhost:5000/api/v1/products/prod123/inventory \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org123",
    "quantity": 5,
    "type": "ADD",
    "notes": "Received from supplier"
  }'
```

---

**API Version**: 1.0
**Last Updated**: October 21, 2025
**Status**: ✅ Production Ready

