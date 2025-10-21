# 🚀 QUICK REFERENCE GUIDE

## **GETTING STARTED**

### **1. Start the Application**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:3000`

---

## **DASHBOARD FEATURES**

### **📄 Create Invoice**
- Auto-generated invoice numbers
- Customer auto-fill
- Item-wise GST calculation
- Discount management
- Payment terms

### **📋 View Invoices**
- List all invoices
- Filter by status
- View invoice details
- Download/print invoices

### **👥 Customers**
- Add new customers
- Manage customer details
- Track customer invoices
- View outstanding amounts

### **📦 Suppliers**
- Add new suppliers
- Manage supplier details
- Track purchase history
- View payment status

### **📊 Reports**
- Sales Report
- Purchase Report
- Profit & Loss
- Customer-wise Report
- Supplier-wise Report
- GST Reports (GSTR-1, GSTR-2, GSTR-3B, GSTR-9)

### **💳 Payments**
- Record payments
- Multiple payment modes
- Payment reconciliation
- Outstanding tracking

### **📦 Inventory**
- Track stock levels
- Low stock alerts
- Stock movements
- Reorder management

### **🏭 Manufacturing**
- Create Bill of Materials (BOM)
- Create Production Orders
- Track production status
- Production summary

### **👥 Users**
- Invite team members
- Assign roles
- Manage permissions
- Remove users

### **💾 Backup & Export**
- Create backups
- Download backups
- Export data (JSON)
- Import data

### **❓ Help & Support**
- FAQs
- Video tutorials
- Contact support

### **⚙️ Settings**
- Company profile
- Invoice settings
- Bank details

---

## **KEY WORKFLOWS**

### **Creating an Invoice**
1. Go to Dashboard → Create Invoice
2. Select customer (or add new)
3. Add items with quantities and rates
4. System auto-calculates GST
5. Click "Create Invoice"

### **Recording a Payment**
1. Go to Dashboard → Payments
2. Click "Record Payment"
3. Select invoice
4. Enter payment amount
5. Select payment mode
6. Click "Record Payment"

### **Generating GST Report**
1. Go to Dashboard → Reports
2. Select "GST Reports" tab
3. Choose month and year
4. View GSTR-1, GSTR-2, GSTR-3B, GSTR-9
5. Download report

### **Creating a Backup**
1. Go to Dashboard → Backup & Export
2. Click "Create Backup Now"
3. Backup is created automatically
4. Download backup file for safekeeping

### **Inviting a Team Member**
1. Go to Dashboard → Users
2. Click "Invite User"
3. Enter email address
4. Select role (Viewer, Accountant, Manager, Admin)
5. Click "Invite User"

---

## **GST RATES**

| Rate | Usage |
|------|-------|
| 0% | Exempt goods |
| 5% | Essential items |
| 12% | Standard goods |
| 18% | Most goods/services |
| 28% | Luxury items |

---

## **USER ROLES**

| Role | Permissions |
|------|-------------|
| **OWNER** | Full access |
| **ADMIN** | Full access except user management |
| **MANAGER** | Create/edit invoices, view reports |
| **ACCOUNTANT** | Create/edit invoices, manage payments |
| **VIEWER** | View-only access |

---

## **API ENDPOINTS QUICK REFERENCE**

### **Authentication**
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login

### **Invoices**
- `GET /api/v1/invoices` - List invoices
- `POST /api/v1/invoices` - Create invoice
- `PUT /api/v1/invoices/:id` - Update invoice
- `DELETE /api/v1/invoices/:id` - Delete invoice

### **Customers**
- `GET /api/v1/customers` - List customers
- `POST /api/v1/customers` - Create customer
- `PUT /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer

### **Reports**
- `GET /api/v1/reports/sales-report` - Sales report
- `GET /api/v1/reports/purchase-report` - Purchase report
- `GET /api/v1/reports/profit-loss` - P&L report
- `GET /api/v1/reports/gstr-1` - GSTR-1 report
- `GET /api/v1/reports/gstr-2` - GSTR-2 report
- `GET /api/v1/reports/gstr-3b` - GSTR-3B report
- `GET /api/v1/reports/gstr-9` - GSTR-9 report

### **Backup**
- `POST /api/v1/backup/create` - Create backup
- `GET /api/v1/backup/list/:organizationId` - List backups
- `GET /api/v1/backup/download/:fileName` - Download backup
- `GET /api/v1/backup/export/:type/:organizationId` - Export data

---

## **COMMON ISSUES & SOLUTIONS**

### **Issue: Port already in use**
**Solution:** Kill the process or use a different port
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### **Issue: Database migration failed**
**Solution:** Reset database and re-migrate
```bash
cd backend
npx prisma migrate reset
npx prisma migrate deploy
```

### **Issue: Frontend not connecting to backend**
**Solution:** Ensure backend is running on port 5000 and check CORS settings

### **Issue: Authentication token expired**
**Solution:** Login again to get a new token

---

## **USEFUL COMMANDS**

### **Backend**
```bash
cd backend
npm install              # Install dependencies
npm run dev             # Start development server
npx prisma studio      # Open Prisma Studio
npx prisma migrate dev # Create migration
```

### **Frontend**
```bash
cd frontend
npm install             # Install dependencies
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
```

---

## **FILE LOCATIONS**

| Component | Location |
|-----------|----------|
| Backend Routes | `backend/routes/` |
| Frontend Pages | `frontend/app/dashboard/` |
| Database Schema | `backend/prisma/schema.prisma` |
| Environment Config | `backend/.env` |
| Migrations | `backend/prisma/migrations/` |

---

## **SUPPORT**

- 📧 Email: support@invoicesaas.com
- 📞 Phone: +91 1800-INVOICE
- 💬 Live Chat: Available 9 AM - 6 PM IST
- 📚 Documentation: See help section in app

---

**Happy invoicing! 🎉**

