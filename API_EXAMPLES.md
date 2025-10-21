# GST Invoice SaaS - API Examples

## Authentication

### Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "9876543210"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx123abc",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Login User
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx123abc",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## Organizations

### Create Organization
```bash
curl -X POST http://localhost:5000/api/v1/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "ABC Trading Company",
    "gstin": "27AABCT1234H1Z0",
    "email": "info@abctrading.com",
    "phone": "9876543210",
    "address": "123 Business Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }'
```

### Get All Organizations
```bash
curl -X GET http://localhost:5000/api/v1/organizations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Organization Details
```bash
curl -X GET http://localhost:5000/api/v1/organizations/clx123abc \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Organization
```bash
curl -X PUT http://localhost:5000/api/v1/organizations/clx123abc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "ABC Trading Company Ltd",
    "phone": "9876543211"
  }'
```

## Customers

### Create Customer
```bash
curl -X POST http://localhost:5000/api/v1/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "organizationId": "clx123abc",
    "name": "XYZ Retail Store",
    "email": "contact@xyzretail.com",
    "phone": "9876543210",
    "gstin": "27AABCU1234H1Z0",
    "address": "456 Retail Plaza",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001"
  }'
```

### Get All Customers
```bash
curl -X GET "http://localhost:5000/api/v1/customers?organizationId=clx123abc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Customer
```bash
curl -X PUT http://localhost:5000/api/v1/customers/clx456def \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "phone": "9876543211"
  }'
```

### Delete Customer
```bash
curl -X DELETE http://localhost:5000/api/v1/customers/clx456def \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Products

### Create Product
```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "organizationId": "clx123abc",
    "name": "Laptop",
    "description": "Dell Inspiron 15",
    "hsn": "8471",
    "unit": "Nos",
    "price": 50000,
    "gstRate": 18
  }'
```

### Get All Products
```bash
curl -X GET "http://localhost:5000/api/v1/products?organizationId=clx123abc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Product
```bash
curl -X PUT http://localhost:5000/api/v1/products/clx789ghi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "price": 52000,
    "gstRate": 18
  }'
```

## Invoices

### Create Invoice
```bash
curl -X POST http://localhost:5000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "organizationId": "clx123abc",
    "customerId": "clx456def",
    "invoiceNumber": "INV-001",
    "invoiceDate": "2025-01-15",
    "items": [
      {
        "description": "Laptop",
        "quantity": 2,
        "unit": "Nos",
        "rate": 50000,
        "gstRate": 18
      },
      {
        "description": "Mouse",
        "quantity": 2,
        "unit": "Nos",
        "rate": 500,
        "gstRate": 18
      }
    ]
  }'
```

**Response:**
```json
{
  "id": "clx999jkl",
  "organizationId": "clx123abc",
  "customerId": "clx456def",
  "invoiceNumber": "INV-001",
  "invoiceDate": "2025-01-15T00:00:00Z",
  "subtotal": 101000,
  "taxAmount": 18180,
  "totalAmount": 119180,
  "status": "DRAFT",
  "items": [
    {
      "id": "clx999jkl-1",
      "description": "Laptop",
      "quantity": 2,
      "unit": "Nos",
      "rate": 50000,
      "gstRate": 18,
      "amount": 100000
    },
    {
      "id": "clx999jkl-2",
      "description": "Mouse",
      "quantity": 2,
      "unit": "Nos",
      "rate": 500,
      "gstRate": 18,
      "amount": 1000
    }
  ]
}
```

### Get All Invoices
```bash
curl -X GET "http://localhost:5000/api/v1/invoices?organizationId=clx123abc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Invoice Details
```bash
curl -X GET http://localhost:5000/api/v1/invoices/clx999jkl \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Invoice
```bash
curl -X PUT http://localhost:5000/api/v1/invoices/clx999jkl \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "SENT"
  }'
```

### Delete Invoice
```bash
curl -X DELETE http://localhost:5000/api/v1/invoices/clx999jkl \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## E-Invoices

### Generate E-Invoice
```bash
curl -X POST http://localhost:5000/api/v1/e-invoices/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "invoiceId": "clx999jkl",
    "organizationId": "clx123abc"
  }'
```

**Response:**
```json
{
  "id": "clx111mno",
  "organizationId": "clx123abc",
  "invoiceId": "clx999jkl",
  "irn": "1705315200000-abc123def456",
  "ackNo": "ACK-1705315200000",
  "ackDate": "2025-01-15T10:30:00Z",
  "status": "GENERATED",
  "qrCode": "data:image/png;base64,..."
}
```

### Get E-Invoice
```bash
curl -X GET http://localhost:5000/api/v1/e-invoices/clx111mno \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Reports

### Get GSTR-1 Report
```bash
curl -X GET "http://localhost:5000/api/v1/reports/gstr-1?organizationId=clx123abc&month=1&year=2025" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "month": 1,
  "year": 2025,
  "totalInvoices": 5,
  "totalTaxableValue": 500000,
  "totalTax": 90000,
  "invoices": [
    {
      "invoiceNumber": "INV-001",
      "invoiceDate": "2025-01-15T00:00:00Z",
      "customerGSTIN": "27AABCU1234H1Z0",
      "taxableValue": 100000,
      "tax": 18000
    }
  ]
}
```

### Get Dashboard Statistics
```bash
curl -X GET "http://localhost:5000/api/v1/reports/dashboard/stats?organizationId=clx123abc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "totalInvoices": 10,
  "totalRevenue": 1000000,
  "paidInvoices": 7,
  "overdueInvoices": 2
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Invalid token"
}
```

### 400 Bad Request
```json
{
  "error": "Email already registered"
}
```

### 404 Not Found
```json
{
  "error": "Invoice not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create invoice"
}
```

## Testing with Postman

1. Import the API collection
2. Set `{{base_url}}` to `http://localhost:5000/api/v1`
3. Set `{{token}}` after login
4. Use pre-request scripts to set variables
5. Test each endpoint

---

**All endpoints require authentication except /auth/register and /auth/login**

