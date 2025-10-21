# 🧪 Quick Testing Guide

## ✅ Servers Status

Both servers should be running:
- **Backend**: http://localhost:5000 ✅
- **Frontend**: http://localhost:3000 ✅

---

## 🧪 Test Scenarios

### **Test 1: Create a Product**

**Steps**:
1. Open http://localhost:3000/dashboard/products
2. Click "+ Add Product" button
3. Fill in the form:
   - **Name**: "Laptop"
   - **HSN**: "8471.30"
   - **SAC**: (leave empty)
   - **Unit**: "Nos"
   - **Price**: "50000"
   - **GST Rate**: "18"
   - **Barcode**: "LAPTOP001"
   - **Low Stock Alert**: "5"
   - **Description**: "Dell Laptop"
4. Click "Create Product"
5. **Expected**: Success message, product appears in list

---

### **Test 2: Create a B2B Supplier**

**Steps**:
1. Open http://localhost:3000/dashboard/suppliers
2. Click "+ Add Supplier" button
3. Fill in the form:
   - **Name**: "ABC Traders"
   - **Type**: Select "B2B"
   - **GSTIN**: "27AABCT1234H1Z0" (15 digits)
   - **Email**: "abc@traders.com"
   - **Phone**: "9876543210"
   - **Address**: "123 Business Street"
   - **City**: "Mumbai"
   - **State**: "Maharashtra"
   - **Pincode**: "400001"
4. Click "Create Supplier"
5. **Expected**: Success message, supplier appears with B2B badge

---

### **Test 3: Create a B2C Supplier**

**Steps**:
1. Open http://localhost:3000/dashboard/suppliers
2. Click "+ Add Supplier" button
3. Fill in the form:
   - **Name**: "Local Shop"
   - **Type**: Select "B2C"
   - **GSTIN**: (should NOT appear - this is the key test!)
   - **Email**: "shop@local.com"
   - **Phone**: "9876543211"
   - **Address**: "456 Market Street"
   - **City**: "Delhi"
   - **State**: "Delhi"
   - **Pincode**: "110001"
4. Click "Create Supplier"
5. **Expected**: Success message, supplier appears with B2C badge (green)

---

### **Test 4: Create a Purchase Invoice**

**Steps**:
1. Open http://localhost:3000/dashboard/purchases/create
2. Fill in the form:
   - **Supplier**: Select "ABC Traders" (from Test 2)
   - **Purchase Date**: Today's date
3. Add items:
   - Click "Add Item"
   - **Description**: "Laptop Purchase"
   - **Quantity**: "2"
   - **Unit**: "Nos"
   - **Rate**: "50000"
   - **GST Rate**: "18"
4. Verify totals auto-calculate:
   - **Subtotal**: 100,000
   - **Tax**: 18,000
   - **Total**: 118,000
5. Click "Create Purchase"
6. **Expected**: Success message, redirect to purchases list

---

### **Test 5: View Purchase Invoices**

**Steps**:
1. Open http://localhost:3000/dashboard/purchases
2. Verify the purchase from Test 4 appears in the list
3. Test search: Type "ABC" in search box
4. **Expected**: Purchase filtered by supplier name
5. Test filter: Select "DRAFT" status
6. **Expected**: Only draft purchases shown

---

### **Test 6: View Inventory**

**Steps**:
1. Open http://localhost:3000/dashboard/inventory
2. Verify dashboard stats:
   - **Total Products**: Should show count
   - **Low Stock**: Should show count
   - **Out of Stock**: Should show count
   - **Total Value**: Should show calculated value
3. Search for "Laptop"
4. **Expected**: Laptop product appears in inventory table
5. Filter by "Low Stock"
6. **Expected**: Only low stock items shown

---

### **Test 7: Edit a Product**

**Steps**:
1. Open http://localhost:3000/dashboard/products
2. Find the "Laptop" product
3. Click "Edit" button
4. Change price to "55000"
5. Click "Update Product"
6. **Expected**: Success message, price updated in list

---

### **Test 8: Delete a Product**

**Steps**:
1. Open http://localhost:3000/dashboard/products
2. Find a product
3. Click "Delete" button
4. Confirm deletion
5. **Expected**: Product removed from list

---

### **Test 9: Search Functionality**

**Steps**:
1. Open http://localhost:3000/dashboard/suppliers
2. Type "ABC" in search box
3. **Expected**: Only "ABC Traders" supplier shown
4. Clear search
5. **Expected**: All suppliers shown again

---

### **Test 10: Form Validation**

**Steps**:
1. Open http://localhost:3000/dashboard/products
2. Click "+ Add Product"
3. Leave "Name" empty
4. Click "Create Product"
5. **Expected**: Error message "Product name is required"
6. Fill in Name: "Test Product"
7. Leave "Price" empty
8. Click "Create Product"
9. **Expected**: Error message "Price is required"

---

## 🔍 What to Check

### **Browser Console (F12)**
- ✅ No red errors
- ✅ API calls successful (200 status)
- ✅ Data loading correctly

### **Backend Terminal**
- ✅ No error messages
- ✅ API requests logged
- ✅ Database operations successful

### **UI/UX**
- ✅ Forms responsive on mobile
- ✅ Buttons clickable
- ✅ Loading spinners appear
- ✅ Success messages show
- ✅ Error messages clear

---

## ✅ Success Criteria

All tests pass if:
- ✅ All CRUD operations work
- ✅ Search and filter work
- ✅ Form validation works
- ✅ Auto-calculations work
- ✅ B2B/B2C conditional fields work
- ✅ No console errors
- ✅ No backend errors
- ✅ Responsive design works
- ✅ Navigation works
- ✅ Authentication works

---

## 🐛 If Tests Fail

### **Check 1: Browser Console**
```
F12 → Console tab → Look for red errors
```

### **Check 2: Backend Logs**
```
Check terminal where backend is running
Look for error messages
```

### **Check 3: Network Tab**
```
F12 → Network tab → Check API responses
Look for 500 errors or empty responses
```

### **Check 4: localStorage**
```
F12 → Application → localStorage
Verify token and organizationId are set
```

---

## 📊 Test Results Template

```
Test 1 - Create Product: ✅ PASS / ❌ FAIL
Test 2 - Create B2B Supplier: ✅ PASS / ❌ FAIL
Test 3 - Create B2C Supplier: ✅ PASS / ❌ FAIL
Test 4 - Create Purchase: ✅ PASS / ❌ FAIL
Test 5 - View Purchases: ✅ PASS / ❌ FAIL
Test 6 - View Inventory: ✅ PASS / ❌ FAIL
Test 7 - Edit Product: ✅ PASS / ❌ FAIL
Test 8 - Delete Product: ✅ PASS / ❌ FAIL
Test 9 - Search: ✅ PASS / ❌ FAIL
Test 10 - Form Validation: ✅ PASS / ❌ FAIL

Overall: ✅ ALL PASS / ⚠️ SOME FAILURES
```

---

## 🎯 Next Steps After Testing

1. **If all tests pass**: 
   - ✅ System is ready for production
   - ✅ Can start adding more features
   - ✅ Can deploy to server

2. **If some tests fail**:
   - ❌ Check error messages
   - ❌ Review browser console
   - ❌ Check backend logs
   - ❌ Fix issues and retest

---

**Estimated Testing Time**: 30-45 minutes
**Difficulty**: Easy - Just follow the steps
**Success Rate**: Should be 100% if all code is correct

Good luck! 🚀

