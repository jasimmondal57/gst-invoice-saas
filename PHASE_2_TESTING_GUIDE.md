# 🧪 Phase 2 Testing Guide

## Quick Start Testing

### 1. **Party Groups Management**

**Create a Party Group:**
1. Go to Dashboard → Party Groups
2. Click "+ New Group"
3. Enter:
   - Group Name: "Retail Customers"
   - Description: "All retail customers"
4. Click "Create Group"
5. Verify group appears in the list

**Edit Party Group:**
1. Click "Edit" on any group
2. Modify the name or description
3. Click "Update Group"
4. Verify changes are saved

**Delete Party Group:**
1. Click "Delete" on any group
2. Confirm deletion
3. Verify group is removed

---

### 2. **Inventory Management**

**View Inventory:**
1. Go to Dashboard → Inventory
2. You should see all products with their stock levels
3. Check for "Low Stock" badges (yellow)

**Update Inventory:**
1. Click on a product to update
2. Change:
   - Quantity
   - Reorder Level
   - Reorder Quantity
3. Click "Update"
4. Verify changes are saved

**Low Stock Alerts:**
1. Set a product's quantity below its reorder level
2. Go to Inventory page
3. Verify product shows "Low Stock" badge
4. Check the low stock alerts section

---

### 3. **Payment Management**

**Record a Payment:**
1. Go to Dashboard → Payments
2. Click "+ Record Payment"
3. Fill in:
   - Amount: 5000
   - Payment Date: Today
   - Payment Mode: Bank Transfer
   - Reference No: TXN123456
   - Notes: Payment for Invoice INV-001
4. Click "Record Payment"
5. Verify payment appears in the list

**View Payment Summary:**
1. Check the summary cards at the top:
   - Total Received (from customers)
   - Total Paid (to suppliers)
2. Verify amounts are calculated correctly

**Delete Payment:**
1. Click "Delete" on any payment
2. Confirm deletion
3. Verify payment is removed and summary is updated

---

## 🔍 API Testing (Using cURL or Postman)

### Party Groups API

**Create Party Group:**
```bash
curl -X POST http://localhost:5000/api/v1/party-groups \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "ORG_ID",
    "name": "Wholesale Suppliers",
    "description": "All wholesale suppliers"
  }'
```

**Get All Party Groups:**
```bash
curl -X GET "http://localhost:5000/api/v1/party-groups?organizationId=ORG_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Inventory API

**Get All Inventory:**
```bash
curl -X GET "http://localhost:5000/api/v1/inventory?organizationId=ORG_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Low Stock Items:**
```bash
curl -X GET "http://localhost:5000/api/v1/inventory/low-stock/ORG_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update Inventory:**
```bash
curl -X PUT "http://localhost:5000/api/v1/inventory/PRODUCT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 100,
    "reorderLevel": 20,
    "reorderQuantity": 50
  }'
```

---

### Payments API

**Create Payment:**
```bash
curl -X POST http://localhost:5000/api/v1/payments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "ORG_ID",
    "customerId": "CUSTOMER_ID",
    "amount": 5000,
    "paymentDate": "2025-10-20",
    "paymentMode": "BANK_TRANSFER",
    "referenceNo": "TXN123456",
    "notes": "Payment received"
  }'
```

**Get All Payments:**
```bash
curl -X GET "http://localhost:5000/api/v1/payments?organizationId=ORG_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Payment Summary:**
```bash
curl -X GET "http://localhost:5000/api/v1/payments/summary/ORG_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Verification Checklist

- [ ] Party Groups can be created, edited, and deleted
- [ ] Inventory shows all products with stock levels
- [ ] Low stock alerts appear for items below reorder level
- [ ] Inventory quantities can be updated
- [ ] Payments can be recorded with different modes
- [ ] Payment summary shows correct totals
- [ ] Outstanding amounts are updated when payments are recorded
- [ ] All pages load without errors
- [ ] Forms validate input correctly
- [ ] Success/error messages display properly
- [ ] Dashboard shows all new cards (Inventory, Party Groups, Payments)

---

## 🐛 Troubleshooting

**Issue: "Failed to fetch" errors**
- Ensure backend is running on port 5000
- Check that token is valid in localStorage
- Verify organizationId is set in localStorage

**Issue: Low stock alerts not showing**
- Ensure product quantity is less than reorder level
- Refresh the page
- Check browser console for errors

**Issue: Payment summary not updating**
- Ensure payment status is "COMPLETED"
- Check that customerId or supplierId is set
- Refresh the page

---

## 📝 Notes

- All timestamps are in UTC
- Amounts are stored as floats (2 decimal places)
- Payment modes: CASH, CHEQUE, BANK_TRANSFER, CREDIT_CARD, DEBIT_CARD, UPI, WALLET, OTHER
- Stock movement types: PURCHASE, SALE, ADJUSTMENT, RETURN, DAMAGE, OPENING_STOCK
- All operations require valid authentication token

---

## 🚀 Next Steps

After testing Phase 2, you can:
1. Proceed to Phase 3 (Reporting & GST Reports)
2. Write unit tests for new features
3. Deploy to production
4. Gather user feedback

Let me know if you encounter any issues! 🎯

