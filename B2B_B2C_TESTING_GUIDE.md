# B2B/B2C Customer Types - Testing Guide

## Quick Start

### Frontend URL
- **Development**: http://localhost:3001 (or 3000 if available)
- **Backend API**: http://localhost:5000/api/v1

### Login Credentials
Use your existing test account or create a new one

## Test Scenarios

### Scenario 1: Create B2B Customer

**Steps:**
1. Navigate to `/dashboard/customers`
2. Click "+ Add Customer"
3. Select **B2B** radio button
4. Fill in:
   - Customer Name: "ABC Corporation"
   - GSTIN: "27AABCT1234H1Z0" (required for B2B)
   - Email: "contact@abc.com"
   - Phone: "9876543210"
   - Address: "123 Business Street"
   - City: "Mumbai"
   - State: "Maharashtra"
   - Pincode: "400001"
5. Click "Add Customer"

**Expected Result:**
- Customer created successfully
- Customer card shows B2B badge (blue)
- GSTIN displayed on customer card

---

### Scenario 2: Create B2C Customer

**Steps:**
1. Navigate to `/dashboard/customers`
2. Click "+ Add Customer"
3. Select **B2C** radio button
4. Fill in:
   - Customer Name: "John Doe"
   - Email: "john@example.com" (optional)
   - Phone: "9876543210" (optional)
   - Address: "456 Consumer Lane"
   - City: "Bangalore"
   - State: "Karnataka"
   - Pincode: "560001"
5. Notice: **GSTIN field is NOT visible** for B2C
6. Click "Add Customer"

**Expected Result:**
- Customer created successfully
- Customer card shows B2C badge (green)
- No GSTIN field visible in form
- No GSTIN displayed on customer card

---

### Scenario 3: Try Creating B2B Without GSTIN (Should Fail)

**Steps:**
1. Navigate to `/dashboard/customers`
2. Click "+ Add Customer"
3. Select **B2B** radio button
4. Fill in customer name and other details
5. Leave GSTIN empty
6. Click "Add Customer"

**Expected Result:**
- Error message: "GSTIN is required for B2B customers"
- Customer not created
- Form remains open for correction

---

### Scenario 4: Create Invoice with B2B Customer

**Steps:**
1. Navigate to `/dashboard/invoices/create`
2. In "To (Customer)" section, search and select the B2B customer created in Scenario 1
3. Verify:
   - Customer type badge shows **B2B** (blue)
   - **GSTIN field is visible** and populated
   - Customer details are auto-filled
4. Add invoice items and create invoice

**Expected Result:**
- Invoice created successfully
- Invoice type set to B2B
- GSTIN included in invoice

---

### Scenario 5: Create Invoice with B2C Customer

**Steps:**
1. Navigate to `/dashboard/invoices/create`
2. In "To (Customer)" section, search and select the B2C customer created in Scenario 2
3. Verify:
   - Customer type badge shows **B2C** (green)
   - **GSTIN field is NOT visible**
   - Customer details are auto-filled (without GSTIN)
4. Add invoice items and create invoice

**Expected Result:**
- Invoice created successfully
- Invoice type set to B2C
- No GSTIN in invoice
- Invoice can be created without GSTIN

---

### Scenario 6: Customer Dropdown Display

**Steps:**
1. Navigate to `/dashboard/invoices/create`
2. Click on customer search field
3. Observe the dropdown list

**Expected Result:**
- Each customer shows their type badge
- B2B customers show blue badge
- B2C customers show green badge
- Easy to distinguish customer types

---

## Validation Tests

### Test 1: B2B GSTIN Validation
- **Invalid GSTIN**: "12345" → Should show error
- **Valid GSTIN**: "27AABCT1234H1Z0" → Should accept
- **Empty GSTIN for B2B**: Should show error

### Test 2: B2C No GSTIN Required
- **Empty GSTIN for B2C**: Should accept
- **Optional GSTIN for B2C**: Should accept if provided

### Test 3: Customer Type Persistence
- Create B2B customer
- Create invoice with this customer
- Verify invoice type is B2B
- Create B2C customer
- Create invoice with this customer
- Verify invoice type is B2C

---

## API Testing (Using curl)

### Create B2B Customer
```bash
curl -X POST http://localhost:5000/api/v1/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "organizationId": "YOUR_ORG_ID",
    "name": "ABC Corp",
    "type": "B2B",
    "gstin": "27AABCT1234H1Z0",
    "email": "contact@abc.com",
    "phone": "9876543210",
    "address": "123 Business St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }'
```

### Create B2C Customer
```bash
curl -X POST http://localhost:5000/api/v1/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "organizationId": "YOUR_ORG_ID",
    "name": "John Doe",
    "type": "B2C",
    "email": "john@example.com",
    "phone": "9876543210",
    "address": "456 Consumer Lane",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001"
  }'
```

---

## Troubleshooting

### Issue: GSTIN field not showing for B2B
- **Solution**: Refresh the page, ensure B2B is selected

### Issue: Can't create B2C customer
- **Solution**: Make sure GSTIN field is empty or not provided

### Issue: Customer type not showing in dropdown
- **Solution**: Restart frontend server, clear browser cache

### Issue: Invoice type not set correctly
- **Solution**: Ensure customer type is set correctly before creating invoice

---

## Success Criteria

✅ B2B customers require GSTIN
✅ B2C customers don't require GSTIN
✅ GSTIN field is conditional in forms
✅ Customer type badges display correctly
✅ Invoice type is set based on customer type
✅ All validations work as expected
✅ No errors in browser console
✅ No errors in backend logs

