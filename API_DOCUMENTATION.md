# 📚 API DOCUMENTATION

## **BASE URL**
```
http://localhost:5000/api/v1
```

---

## **AUTHENTICATION**

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### **Register**
```
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "SecurePassword123"
}

Response: 201 Created
{
  "id": "user-id",
  "token": "jwt-token",
  "user": { ... }
}
```

### **Login**
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response: 200 OK
{
  "token": "jwt-token",
  "user": { ... }
}
```

---

## **MANUFACTURING ENDPOINTS**

### **Bill of Materials (BOM)**

#### **Create BOM**
```
POST /manufacturing/bom
{
  "organizationId": "org-id",
  "productId": "product-id",
  "name": "BOM Name",
  "description": "BOM Description",
  "items": [
    {
      "productId": "component-id",
      "quantity": 5
    }
  ]
}

Response: 201 Created
```

#### **Get All BOMs**
```
GET /manufacturing/bom?organizationId=org-id

Response: 200 OK
[
  {
    "id": "bom-id",
    "name": "BOM Name",
    "productId": "product-id",
    "items": [ ... ]
  }
]
```

#### **Get BOM Details**
```
GET /manufacturing/bom/:id

Response: 200 OK
{
  "id": "bom-id",
  "name": "BOM Name",
  "items": [ ... ]
}
```

#### **Update BOM**
```
PUT /manufacturing/bom/:id
{
  "name": "Updated Name",
  "description": "Updated Description",
  "items": [ ... ]
}

Response: 200 OK
```

#### **Delete BOM**
```
DELETE /manufacturing/bom/:id

Response: 200 OK
```

### **Production Orders**

#### **Create Production Order**
```
POST /manufacturing/production-orders
{
  "organizationId": "org-id",
  "bomId": "bom-id",
  "quantity": 100,
  "notes": "Production notes"
}

Response: 201 Created
{
  "id": "order-id",
  "orderNumber": "PO-001",
  "status": "DRAFT",
  "quantity": 100
}
```

#### **Get All Production Orders**
```
GET /manufacturing/production-orders?organizationId=org-id

Response: 200 OK
[ ... ]
```

#### **Update Production Order**
```
PUT /manufacturing/production-orders/:id
{
  "status": "IN_PROGRESS",
  "startDate": "2025-10-20T10:00:00Z"
}

Response: 200 OK
```

#### **Get Production Summary**
```
GET /manufacturing/production-summary/:organizationId

Response: 200 OK
{
  "totalOrders": 10,
  "draftOrders": 2,
  "inProgressOrders": 3,
  "completedOrders": 5
}
```

---

## **USER MANAGEMENT ENDPOINTS**

### **Users**

#### **Get All Users**
```
GET /users?organizationId=org-id

Response: 200 OK
[ ... ]
```

#### **Invite User**
```
POST /users/invite
{
  "organizationId": "org-id",
  "email": "newuser@example.com",
  "role": "MANAGER"
}

Response: 201 Created
```

#### **Update User Role**
```
PUT /users/:userId
{
  "organizationId": "org-id",
  "role": "ACCOUNTANT"
}

Response: 200 OK
```

#### **Remove User**
```
DELETE /users/:userId
{
  "organizationId": "org-id"
}

Response: 200 OK
```

### **Custom Roles**

#### **Create Custom Role**
```
POST /users/roles
{
  "organizationId": "org-id",
  "name": "Custom Manager",
  "description": "Custom role description",
  "permissions": "[\"create_invoice\", \"view_reports\"]"
}

Response: 201 Created
```

#### **Get All Roles**
```
GET /users/roles?organizationId=org-id

Response: 200 OK
[ ... ]
```

#### **Update Role**
```
PUT /users/roles/:roleId
{
  "name": "Updated Name",
  "permissions": "[...]"
}

Response: 200 OK
```

#### **Delete Role**
```
DELETE /users/roles/:roleId

Response: 200 OK
```

### **Audit Trail**

#### **Get Audit Trail**
```
GET /users/audit-trail?organizationId=org-id&action=CREATE&entity=Invoice

Response: 200 OK
[
  {
    "id": "audit-id",
    "action": "CREATE",
    "entity": "Invoice",
    "entityId": "invoice-id",
    "changes": { ... },
    "createdAt": "2025-10-20T10:00:00Z"
  }
]
```

---

## **BACKUP ENDPOINTS**

#### **Create Backup**
```
POST /backup/create
{
  "organizationId": "org-id"
}

Response: 201 Created
{
  "fileName": "backup-2025-10-20.json",
  "size": 1024
}
```

#### **List Backups**
```
GET /backup/list/:organizationId

Response: 200 OK
[ ... ]
```

#### **Download Backup**
```
GET /backup/download/:fileName

Response: 200 OK (JSON file)
```

#### **Export Data**
```
GET /backup/export/:type/:organizationId
# type: invoices, customers, suppliers, purchases

Response: 200 OK
[ ... ]
```

#### **Import Data**
```
POST /backup/import
{
  "organizationId": "org-id",
  "type": "invoices",
  "data": [ ... ]
}

Response: 201 Created
{
  "imported": 5
}
```

#### **Restore Backup**
```
POST /backup/restore
{
  "organizationId": "org-id",
  "fileName": "backup-2025-10-20.json"
}

Response: 200 OK
{
  "restored": true
}
```

---

## **REPORTS ENDPOINTS**

#### **Sales Report**
```
GET /reports/sales-report?organizationId=org-id&startDate=2025-10-01&endDate=2025-10-31

Response: 200 OK
{
  "totalRevenue": 50000,
  "totalTax": 9000,
  "invoices": [ ... ]
}
```

#### **Purchase Report**
```
GET /reports/purchase-report?organizationId=org-id

Response: 200 OK
{
  "totalCost": 25000,
  "totalTax": 4500,
  "purchases": [ ... ]
}
```

#### **Profit & Loss**
```
GET /reports/profit-loss?organizationId=org-id

Response: 200 OK
{
  "totalRevenue": 50000,
  "totalCost": 25000,
  "profit": 25000,
  "profitMargin": 50
}
```

#### **Customer-wise Report**
```
GET /reports/customer-report?organizationId=org-id

Response: 200 OK
[
  {
    "customerId": "cust-id",
    "customerName": "Customer Name",
    "totalSales": 10000,
    "totalTax": 1800
  }
]
```

#### **Supplier-wise Report**
```
GET /reports/supplier-report?organizationId=org-id

Response: 200 OK
[ ... ]
```

#### **GSTR Reports**
```
GET /reports/gstr-1?organizationId=org-id&month=10&year=2025
GET /reports/gstr-2?organizationId=org-id&month=10&year=2025
GET /reports/gstr-3b?organizationId=org-id&month=10&year=2025
GET /reports/gstr-9?organizationId=org-id&year=2025

Response: 200 OK
{ ... }
```

---

## **ERROR RESPONSES**

### **400 Bad Request**
```json
{
  "error": "Invalid input",
  "details": "Field 'email' is required"
}
```

### **401 Unauthorized**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### **403 Forbidden**
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### **404 Not Found**
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### **500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## **RATE LIMITING**

- **Limit:** 100 requests per minute per IP
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## **PAGINATION**

All list endpoints support pagination:
```
GET /endpoint?page=1&limit=20

Response includes:
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

**Last Updated:** October 20, 2025

