# Phase 1 User Guide - Inventory & Payment Management

## 🎯 What's New in Phase 1

Your GST Invoice SaaS platform now includes complete **Inventory Management** and **Payment Tracking** systems, bringing you closer to Vyapaar's functionality.

---

## 📦 Inventory Management

### Creating Products

1. Go to **Dashboard → Products**
2. Click **"+ Add Product"** button
3. Fill in the product details:
   - **Product Name** (required)
   - **Description** (optional)
   - **HSN Code** (for goods)
   - **SAC Code** (for services)
   - **Unit** (Nos, Kg, Ltr, Mtr, Box, Pcs)
   - **Price** (required)
   - **GST Rate** (default 18%)
   - **Barcode** (optional)
   - **Low Stock Alert** (default 10)
   - **Opening Stock** (initial quantity)

4. Click **"Create Product"**

### Managing Stock

1. Go to **Dashboard → Products**
2. Click **"View"** on any product
3. In the **"Stock Information"** section, you'll see:
   - Current stock quantity
   - Reorder level
   - Reorder quantity
   - Last restocked date

4. To adjust stock, scroll to **"Adjust Stock"** section:
   - Select adjustment type:
     - **Add Stock**: Increase inventory
     - **Remove Stock**: Decrease inventory
     - **Set Stock**: Set exact quantity
   - Enter quantity
   - Add notes (optional)
   - Click **"Update Stock"**

### Stock Movement History

Every stock change is logged automatically:
- **OPENING_STOCK**: Initial stock when product created
- **PURCHASE**: Stock received from supplier
- **SALE**: Stock sold to customer
- **ADJUSTMENT**: Manual stock adjustment
- **RETURN**: Stock returned by customer
- **DAMAGE**: Stock damaged/lost

View history in the **"Stock Movement History"** table on product detail page.

### Low Stock Alerts

- Products with stock ≤ low stock alert level show **red badge**
- Alert banner appears on products list
- Helps you reorder before running out

---

## 💳 Payment Tracking

### Recording Payments

1. Go to **Dashboard → Payments**
2. Click **"+ Record Payment"** button
3. Fill in payment details:
   - **Invoice ID** or **Purchase ID** (at least one required)
   - **Amount** (required)
   - **Payment Date** (required)
   - **Payment Mode** (required):
     - Cash
     - Cheque
     - Bank Transfer
     - Credit Card
     - Debit Card
     - UPI
     - Wallet
   - **Reference No** (cheque number, transaction ID, etc.)
   - **Notes** (optional)

4. Click **"Record Payment"**

### Payment Dashboard

The payments page shows:
- **Total Payments**: Number of payments recorded
- **Total Amount**: Sum of all payments
- **Completed**: Number of completed payments
- **Pending**: Number of pending payments

### Filtering Payments

Use the status filter to view:
- **All Statuses**: All payments
- **Completed**: Successfully processed
- **Pending**: Awaiting confirmation
- **Failed**: Failed transactions
- **Cancelled**: Cancelled payments

### Payment Modes

Supported payment methods:
- **Cash**: Direct cash payment
- **Cheque**: Cheque payment (store cheque number in Reference)
- **Bank Transfer**: Online transfer (store transaction ID)
- **Credit Card**: Credit card payment
- **Debit Card**: Debit card payment
- **UPI**: UPI payment
- **Wallet**: Digital wallet payment

---

## 📊 Key Features

### Inventory Features
✅ Real-time stock tracking
✅ Multiple units support
✅ HSN/SAC code integration
✅ Barcode support
✅ Low stock alerts
✅ Stock movement history
✅ Reorder level management
✅ Opening stock support

### Payment Features
✅ Multiple payment modes
✅ Payment status tracking
✅ Outstanding payment calculation
✅ Payment summary dashboard
✅ Payment history
✅ Reference number tracking
✅ Payment notes
✅ Customer/Supplier payment tracking

---

## 🔗 Integration with Invoices

### Automatic Stock Updates
When you create an invoice:
1. Select products from your catalog
2. Stock is automatically tracked
3. Stock movements are logged

### Payment Linking
When you record a payment:
1. Link it to an invoice or purchase
2. Outstanding amount is calculated
3. Payment history is maintained

---

## 📈 Reports & Analytics

### Stock Reports
- View current stock levels
- Track stock movements
- Identify slow-moving items
- Monitor reorder levels

### Payment Reports
- Payment summary by mode
- Payment status breakdown
- Outstanding payments
- Payment history

---

## ⚙️ Best Practices

### Inventory Management
1. **Set accurate opening stock** when creating products
2. **Update low stock alerts** based on your reorder frequency
3. **Add notes** to stock adjustments for audit trail
4. **Review stock movements** regularly
5. **Monitor low stock alerts** to avoid stockouts

### Payment Management
1. **Record payments promptly** after receiving/making them
2. **Use reference numbers** for traceability
3. **Add notes** for complex transactions
4. **Review payment summary** regularly
5. **Match payments** with invoices/purchases

---

## 🆘 Troubleshooting

### Stock Issues
- **Cannot reduce stock below 0**: System prevents negative stock
- **Stock not updating**: Refresh page or check network
- **Missing stock movements**: Check product detail page

### Payment Issues
- **Cannot record payment**: Ensure invoice/purchase ID is valid
- **Payment not appearing**: Check filters and date range
- **Outstanding amount wrong**: Verify all payments are recorded

---

## 📞 Support

For issues or questions:
1. Check the product detail page for stock information
2. Review payment history for transaction details
3. Contact support with specific product/payment IDs

---

**Version**: 1.0
**Last Updated**: October 21, 2025
**Status**: ✅ Production Ready

