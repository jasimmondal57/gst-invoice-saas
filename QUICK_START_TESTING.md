# Quick Start Testing Guide - B2B/B2C Implementation

## Prerequisites
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:3001`
- You are logged in to the application

## Test Scenario 1: Create B2B Customer (5 minutes)

### Steps:
1. Navigate to `http://localhost:3001/dashboard/customers`
2. Click **"+ Add Customer"** button
3. Select **B2B** radio button
4. Fill in the form:
   - **Customer Name**: ABC Corporation
   - **GSTIN**: 27AABCT1234H1Z0 (required for B2B)
   - **Email**: contact@abc.com
   - **Phone**: 9876543210
   - **Address**: 123 Business Street
   - **City**: Mumbai
   - **State**: Maharashtra
   - **Pincode**: 400001
5. Click **"Add Customer"** button

### Expected Result:
✅ Customer created successfully
✅ Customer card shows **[B2B]** badge in blue
✅ GSTIN displayed on customer card
✅ Success message appears

---

## Test Scenario 2: Create B2C Customer (5 minutes)

### Steps:
1. Navigate to `http://localhost:3001/dashboard/customers`
2. Click **"+ Add Customer"** button
3. Select **B2C** radio button
4. **Notice**: GSTIN field is NOT visible
5. Fill in the form:
   - **Customer Name**: John Doe
   - **Email**: john@example.com
   - **Phone**: 9876543210
   - **Address**: 456 Consumer Lane
   - **City**: Bangalore
   - **State**: Karnataka
   - **Pincode**: 560001
6. Click **"Add Customer"** button

### Expected Result:
✅ Customer created successfully
✅ Customer card shows **[B2C]** badge in green
✅ No GSTIN field visible in form
✅ No GSTIN displayed on customer card
✅ Success message appears

---

## Test Scenario 3: Try Creating B2B Without GSTIN (3 minutes)

### Steps:
1. Navigate to `http://localhost:3001/dashboard/customers`
2. Click **"+ Add Customer"** button
3. Select **B2B** radio button
4. Fill in:
   - **Customer Name**: Test Company
   - Leave **GSTIN** empty
   - Fill other fields
5. Click **"Add Customer"** button

### Expected Result:
❌ Error message: "GSTIN is required for B2B customers"
❌ Customer NOT created
✅ Form remains open for correction

---

## Test Scenario 4: Create Invoice with B2B Customer (5 minutes)

### Steps:
1. Navigate to `http://localhost:3001/dashboard/invoices/create`
2. In **"To (Customer)"** section:
   - Click on customer search field
   - Type "ABC" to find the B2B customer
   - Select "ABC Corporation [B2B]"
3. Verify:
   - ✅ Customer type badge shows **[B2B]** in blue
   - ✅ **GSTIN field is visible** and populated
   - ✅ Customer details are auto-filled
4. Add invoice item:
   - **Description**: Laptop
   - **Qty**: 2
   - **Unit**: Select "Nos" from dropdown
   - **Rate**: 50000
   - **GST**: 18%
5. Click **"Create Invoice"** button

### Expected Result:
✅ Invoice created successfully
✅ Invoice type set to B2B
✅ GSTIN included in invoice
✅ Unit field saved correctly
✅ Redirect to invoices list

---

## Test Scenario 5: Create Invoice with B2C Customer (5 minutes)

### Steps:
1. Navigate to `http://localhost:3001/dashboard/invoices/create`
2. In **"To (Customer)"** section:
   - Click on customer search field
   - Type "John" to find the B2C customer
   - Select "John Doe [B2C]"
3. Verify:
   - ✅ Customer type badge shows **[B2C]** in green
   - ✅ **GSTIN field is NOT visible**
   - ✅ Customer details are auto-filled (without GSTIN)
4. Add invoice item:
   - **Description**: Consulting Services
   - **Qty**: 1
   - **Unit**: Select "Nos" from dropdown
   - **Rate**: 5000
   - **GST**: 18%
5. Click **"Create Invoice"** button

### Expected Result:
✅ Invoice created successfully
✅ Invoice type set to B2C
✅ No GSTIN in invoice
✅ Unit field saved correctly
✅ Redirect to invoices list

---

## Test Scenario 6: Test Different Units (3 minutes)

### Steps:
1. Navigate to `http://localhost:3001/dashboard/invoices/create`
2. Select any customer
3. Add multiple items with different units:
   - Item 1: Unit = "Nos" (Numbers)
   - Item 2: Unit = "Kg" (Kilograms)
   - Item 3: Unit = "Ltr" (Liters)
   - Item 4: Unit = "Mtr" (Meters)
   - Item 5: Unit = "Box" (Boxes)
   - Item 6: Unit = "Pcs" (Pieces)
4. Create invoice

### Expected Result:
✅ All units are available in dropdown
✅ Each item saves with correct unit
✅ Invoice created successfully

---

## Test Scenario 7: Customer Dropdown Display (2 minutes)

### Steps:
1. Navigate to `http://localhost:3001/dashboard/invoices/create`
2. Click on customer search field
3. Observe the dropdown list

### Expected Result:
✅ Each customer shows their type badge
✅ B2B customers show **[B2B]** in blue
✅ B2C customers show **[B2C]** in green
✅ Easy to distinguish customer types

---

## Troubleshooting

### Issue: GSTIN field not showing for B2B
**Solution**: Refresh the page, ensure B2B is selected

### Issue: Can't create B2C customer
**Solution**: Make sure GSTIN field is empty or not provided

### Issue: Unit dropdown not appearing
**Solution**: Refresh the page, check browser console for errors

### Issue: Invoice creation fails
**Solution**: Check browser console (F12) and backend logs for error messages

---

## Success Checklist

After completing all test scenarios, verify:

- [ ] B2B customers require GSTIN
- [ ] B2C customers don't require GSTIN
- [ ] GSTIN field is conditional in forms
- [ ] Customer type badges display correctly
- [ ] Invoice type is set based on customer type
- [ ] Unit field works for invoice items
- [ ] All validations work as expected
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] All invoices created successfully

---

## Total Testing Time: ~30 minutes

If all tests pass, the implementation is **ready for production**! 🎉

