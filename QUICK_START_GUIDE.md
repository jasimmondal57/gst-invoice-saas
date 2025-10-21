# 🚀 Quick Start Guide - Phase 1 Features

## 1️⃣ Company Setup (Settings Page)

### How to Access:
1. Go to Dashboard
2. Click on **Settings** card (⚙️)
3. Configure your company details

### What to Configure:

#### **Company Profile Tab**
- **Company Name** - Your business name
- **GSTIN** - 15-character GST number
- **PAN** - Permanent Account Number
- **Business Type** - Type of business
- **Email & Phone** - Contact details
- **Address** - Full business address
- **Website** - Your website URL

#### **Invoice Settings Tab**
- **Invoice Prefix** - e.g., "INV-", "BILL-", "GST-"
- **Starting Invoice Number** - First invoice number (default: 1)
- **Invoice Template** - Choose template style
- **Default Due Date** - Days until payment due (default: 30)
- **Payment Terms** - e.g., "Net 30", "Due on receipt"

#### **Bank Details Tab**
- **Bank Name** - Your bank name
- **Account Number** - Bank account number
- **IFSC Code** - Bank IFSC code

---

## 2️⃣ Invoice Creation (Enhanced)

### How to Create Invoice:
1. Go to Dashboard
2. Click on **Invoices** card
3. Click **+ New Invoice**
4. Fill in the form

### New Features:

#### **Item-Level Discounts**
- Add discount to each line item
- Choose discount type: **%** (Percentage) or **₹** (Fixed Amount)
- GST is calculated on discounted amount
- Example: Item ₹1000 with 10% discount = ₹900 (GST on ₹900)

#### **Transaction-Level Discount**
- Apply discount to entire invoice
- In the Summary section, enter discount amount
- Choose type: **%** or **₹**
- Reduces subtotal before final calculation

#### **Payment Terms**
- Add custom payment terms
- Examples: "Net 30", "Due on receipt", "50% advance"

#### **Shipping Address**
- Add different shipping address if needed
- Leave blank if same as billing address

#### **Additional Notes**
- Add any special instructions or notes
- Will appear on invoice

### Auto-Features:
✅ Invoice number auto-generated with your prefix
✅ Company details auto-filled from settings
✅ Real-time calculations for all amounts
✅ GST calculated correctly with discounts

---

## 3️⃣ Purchase Management

### How to Access:
1. Go to Dashboard
2. Click on **Purchases** card (🛒)

### Create Purchase:
1. Click **+ New Purchase**
2. Select supplier from dropdown
3. Or click **+ New** to add new supplier
4. Select purchase date
5. Click **Create Purchase**

### Supplier Management:
- **Add Supplier** - Click "+ New" button
- **Fill Details:**
  - Supplier Name (required)
  - Email
  - Phone
  - GSTIN
  - Address, City, State, Pincode

### Purchase Types:
- **INVOICE** - Regular purchase invoice
- **PO** - Purchase order
- **RETURN** - Purchase return

### Purchase Status:
- **DRAFT** - Not yet finalized
- **RECEIVED** - Goods received
- **VERIFIED** - Verified and checked
- **PAID** - Payment made
- **CANCELLED** - Cancelled purchase

---

## 📊 Database Models

### Supplier Model
```
- id (unique identifier)
- organizationId (which company)
- name, email, phone, gstin
- address, city, state, pincode
- createdAt, updatedAt
```

### Purchase Model
```
- id (unique identifier)
- organizationId, supplierId, userId
- purchaseNumber (auto-generated)
- purchaseDate, purchaseType
- subtotal, taxAmount, totalAmount
- status (DRAFT, RECEIVED, VERIFIED, PAID, CANCELLED)
- items (line items)
- notes
```

### PurchaseItem Model
```
- id (unique identifier)
- purchaseId (which purchase)
- description, quantity, unit
- rate, gstRate, amount
```

---

## 🔌 API Endpoints

### Invoices
```
GET    /api/v1/invoices                    - List invoices
POST   /api/v1/invoices                    - Create invoice
GET    /api/v1/invoices/:id                - Get invoice details
PUT    /api/v1/invoices/:id                - Update invoice
DELETE /api/v1/invoices/:id                - Delete invoice
GET    /api/v1/invoices/generate-number/:orgId - Generate invoice number
```

### Suppliers
```
GET    /api/v1/suppliers                   - List suppliers
POST   /api/v1/suppliers                   - Create supplier
GET    /api/v1/suppliers/:id               - Get supplier details
PUT    /api/v1/suppliers/:id               - Update supplier
DELETE /api/v1/suppliers/:id               - Delete supplier
```

### Purchases
```
GET    /api/v1/purchases                   - List purchases
POST   /api/v1/purchases                   - Create purchase
GET    /api/v1/purchases/:id               - Get purchase details
PUT    /api/v1/purchases/:id               - Update purchase
DELETE /api/v1/purchases/:id               - Delete purchase
GET    /api/v1/purchases/generate-number/:orgId - Generate purchase number
```

---

## 💡 Tips & Tricks

### Invoice Creation Tips:
1. **Set up company settings first** - Saves time on every invoice
2. **Use consistent invoice prefix** - Helps with organization
3. **Add payment terms** - Clarifies payment expectations
4. **Use item discounts** - For promotional offers
5. **Use transaction discount** - For bulk discounts

### Supplier Management Tips:
1. **Add GSTIN** - Required for GST invoices
2. **Keep contact info updated** - For communication
3. **Organize by state** - Helps with GST compliance
4. **Add bank details** - For payment tracking

### Best Practices:
✅ Always verify invoice numbers are sequential
✅ Keep supplier information up-to-date
✅ Use consistent payment terms
✅ Review calculations before finalizing
✅ Maintain backup of important data

---

## ❓ FAQ

**Q: Can I change invoice prefix after creating invoices?**
A: Yes, but new invoices will use the new prefix. Old invoices keep their original numbers.

**Q: What if I need to add items to a purchase?**
A: This will be available in Phase 2 when we add the purchase detail page.

**Q: Can I have multiple suppliers with same name?**
A: Yes, but we recommend adding GSTIN to differentiate them.

**Q: How are discounts calculated?**
A: Item discount is applied first, then GST on discounted amount. Transaction discount is applied to subtotal.

**Q: Can I edit a purchase after creating it?**
A: Yes, click "View" on the purchase and edit the details.

---

## 🎯 What's Coming Next (Phase 2)

- Inventory Management
- Stock Tracking
- Enhanced Party Management
- Payment Management
- Reporting Module
- Manufacturing Module
- E-Invoice & E-Waybill

---

**Need Help?** Check the documentation or contact support.

