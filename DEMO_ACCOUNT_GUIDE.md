# 🎯 Demo Account Testing Guide

## Demo Account Credentials

### Login Information
- **Email**: `demo@company.com`
- **Password**: `demo123`

---

## 📊 Demo Data Overview

### Organization
- **Name**: Demo Company Ltd
- **GSTIN**: 27AABCT1234H1Z0
- **PAN**: AABCT1234H
- **Location**: Mumbai, Maharashtra
- **Email**: demo@company.com
- **Phone**: 9876543210

### Demo Customers (4 Total)

#### 1. Acme Corporation (B2B)
- **GSTIN**: 07AABCT1234H1Z0
- **Location**: Delhi
- **Email**: contact@acme.com
- **Phone**: 9876543210

#### 2. Tech Solutions Pvt Ltd (B2B)
- **GSTIN**: 29AABCT1234H1Z0
- **Location**: Bangalore
- **Email**: sales@techsol.com
- **Phone**: 9876543211

#### 3. Retail Store XYZ (B2C)
- **Location**: Chennai
- **Email**: retail@xyz.com
- **Phone**: 9876543212

#### 4. Global Enterprises (B2B)
- **GSTIN**: 18AABCT1234H1Z0
- **Location**: Pune
- **Email**: global@enterprises.com
- **Phone**: 9876543213

### Demo Products (4 Total)

| Product | HSN | Price | GST | Stock |
|---------|-----|-------|-----|-------|
| Laptop Pro | 8471 | ₹85,000 | 18% | 50 |
| Wireless Mouse | 8517 | ₹1,500 | 18% | 200 |
| USB-C Cable | 8544 | ₹500 | 18% | 500 |
| Monitor 27 inch | 8528 | ₹25,000 | 18% | 30 |

### Demo Invoices (3 Total)

#### Invoice 1: INV-001
- **Customer**: Acme Corporation (B2B - Delhi)
- **Status**: PAID ✅
- **Date**: 15-Oct-2025
- **Due Date**: 15-Nov-2025
- **Items**: 
  - 2x Laptop Pro @ ₹85,000 = ₹170,000
  - 5x Wireless Mouse @ ₹1,500 = ₹7,500
- **Subtotal**: ₹180,000
- **GST (18%)**: ₹32,400
- **Total**: ₹212,400
- **Payment**: ₹200,000 (Bank Transfer - TXN-001)

#### Invoice 2: INV-002
- **Customer**: Tech Solutions Pvt Ltd (B2B - Bangalore)
- **Status**: SENT 📤
- **Date**: 18-Oct-2025
- **Due Date**: 18-Nov-2025
- **Items**:
  - 100x USB-C Cable @ ₹500 = ₹50,000
  - 1x Monitor 27 inch @ ₹25,000 = ₹25,000
- **Subtotal**: ₹75,000
- **GST (18%)**: ₹13,500
- **Total**: ₹88,500
- **Payment**: ₹75,000 (Cheque - CHQ-001) - PENDING

#### Invoice 3: INV-003
- **Customer**: Retail Store XYZ (B2C - Chennai)
- **Status**: SENT 📤
- **Date**: 20-Oct-2025
- **Due Date**: 20-Nov-2025
- **Items**:
  - 1x Laptop Pro @ ₹85,000 = ₹85,000
- **Subtotal**: ₹85,000
- **GST (18%)**: ₹15,300
- **Total**: ₹100,300

---

## 🧪 Testing Scenarios

### 1. Test Invoice Creation
- Go to **Invoices → Create Invoice**
- Select customer: "Acme Corporation"
- Add products from the demo catalog
- Verify GST calculation (SGST/CGST for same state, IGST for different state)
- Create invoice and verify it shows as "UNPAID"

### 2. Test Invoice Status Workflow
- Go to **Invoices** page
- Filter by "UNPAID" to see unpaid invoices
- Click on INV-002 to edit
- Change status to "PAID"
- Verify status badge updates to green

### 3. Test Customer Management
- Go to **Customers** page
- View all 4 demo customers
- Edit a customer (e.g., update phone number)
- Create a new customer
- Delete a customer (optional)

### 4. Test Payment Tracking
- Go to **Payments** section
- View payment for INV-001 (COMPLETED)
- View payment for INV-002 (PENDING)
- Record a new payment for INV-003

### 5. Test Inventory Management
- Go to **Inventory** page
- View all 4 products with stock levels
- Check low stock alerts (if any)
- Update product quantities

### 6. Test Reports
- Go to **Reports** section
- Generate sales report
- View payment summary
- Check GST compliance report

### 7. Test GST Compliance
- **Intrastate Invoice** (INV-001): Delhi to Delhi
  - Should show SGST + CGST (9% + 9%)
- **Interstate Invoice** (INV-002): Mumbai to Bangalore
  - Should show IGST (18%)
- **B2C Invoice** (INV-003): Mumbai to Chennai
  - Should show IGST (18%)

---

## 📱 Features to Test

✅ **Dashboard**: View summary of invoices, payments, customers
✅ **Invoices**: Create, view, edit, delete invoices
✅ **Customers**: Manage B2B and B2C customers
✅ **Products**: View inventory and product catalog
✅ **Payments**: Track and record payments
✅ **Reports**: Generate various business reports
✅ **GST Compliance**: Verify SGST/CGST vs IGST calculation
✅ **Status Tracking**: UNPAID → PAID workflow
✅ **Multi-state Support**: Test with different customer states

---

## 🚀 Quick Start

1. **Login** with demo credentials
2. **Explore Dashboard** to see overview
3. **View Invoices** to see sample data
4. **Create New Invoice** to test functionality
5. **Test Filters** (UNPAID, PAID, SENT, OVERDUE)
6. **Edit Invoice Status** to test workflow
7. **Manage Customers** to test CRUD operations

---

## 💡 Tips

- All demo data is pre-populated and ready to use
- You can create additional test data without affecting demo data
- Passwords are hashed and secure
- All GST calculations follow Indian tax laws
- States are validated against official Indian states list

---

## 🔄 Reset Demo Data

To reset and recreate demo data:
```bash
cd backend
npx prisma migrate reset --force
node scripts/seed-demo-data.js
```

---

**Happy Testing! 🎉**

