# GST Invoice SaaS - Quick Reference Guide

## 🚀 Start Development in 5 Minutes

### Terminal 1: Backend
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### Terminal 3: Database (Optional)
```bash
cd backend
npx prisma studio
# Opens http://localhost:5555
```

## 📚 Documentation Map

| Document | Purpose | Read When |
|----------|---------|-----------|
| README.md | Project overview | First time |
| SETUP_GUIDE.md | Installation steps | Setting up |
| ARCHITECTURE.md | System design | Understanding structure |
| IMPLEMENTATION_GUIDE.md | Feature development | Building features |
| API_EXAMPLES.md | API usage | Testing APIs |
| PROJECT_SUMMARY.md | Progress overview | Project status |
| QUICK_REFERENCE.md | This file | Quick lookup |

## 🔑 Key Commands

### Backend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npx prisma migrate dev   # Create migration
npx prisma studio       # Open database UI
npx prisma generate     # Generate Prisma client
```

### Frontend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run linter
```

## 🗂️ File Structure Quick Guide

### Backend Routes
```
backend/routes/
├── auth.js              # Login/Register
├── organizations.js     # Business setup
├── invoices.js          # Invoice CRUD
├── customers.js         # Customer management
├── products.js          # Product catalog
├── eInvoices.js         # E-invoice generation
└── reports.js           # Reports & analytics
```

### Frontend Pages (To Build)
```
frontend/app/
├── (auth)/
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── (dashboard)/
│   ├── invoices/
│   ├── customers/
│   ├── products/
│   ├── reports/
│   └── layout.tsx
└── page.tsx             # Landing page
```

## 🔌 API Endpoints Quick Reference

### Auth
```
POST   /auth/register
POST   /auth/login
```

### Organizations
```
GET    /organizations
POST   /organizations
GET    /organizations/:id
PUT    /organizations/:id
```

### Invoices
```
GET    /invoices
POST   /invoices
GET    /invoices/:id
PUT    /invoices/:id
DELETE /invoices/:id
```

### Customers
```
GET    /customers
POST   /customers
GET    /customers/:id
PUT    /customers/:id
DELETE /customers/:id
```

### Products
```
GET    /products
POST   /products
GET    /products/:id
PUT    /products/:id
DELETE /products/:id
```

### E-Invoices
```
POST   /e-invoices/generate
GET    /e-invoices/:id
```

### Reports
```
GET    /reports/gstr-1
GET    /reports/gstr-2
GET    /reports/dashboard/stats
```

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| users | User accounts |
| organizations | Business info |
| organization_members | Team members |
| invoices | Invoice records |
| invoice_items | Line items |
| customers | Customer info |
| products | Product catalog |
| e_invoices | E-invoice records |
| audit_logs | Activity logs |

## 🔐 Authentication

### Get Token
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Use Token
```bash
curl -X GET http://localhost:5000/api/v1/invoices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Common Issues & Solutions

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Database Connection Error
```bash
# Check PostgreSQL is running
# Windows: net start postgresql-x64-15
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Check DATABASE_URL in .env
```

### Module Not Found
```bash
npm install
```

### Prisma Issues
```bash
npx prisma generate
npx prisma migrate dev
```

## 📊 GST Rates (India)

| Category | Rate |
|----------|------|
| Essential goods | 0% |
| Basic items | 5% |
| Standard goods | 12% |
| Most goods | 18% |
| Luxury items | 28% |

## 💰 Invoice Calculation Example

```
Subtotal: ₹100,000
GST Rate: 18%
GST Amount: ₹18,000
Total: ₹118,000

CGST (9%): ₹9,000
SGST (9%): ₹9,000
```

## 🎯 Development Checklist

### Setup Phase
- [ ] Clone repository
- [ ] Install Node.js & PostgreSQL
- [ ] Setup backend
- [ ] Setup frontend
- [ ] Test APIs with Postman

### Development Phase
- [ ] Build login page
- [ ] Build dashboard
- [ ] Build invoice form
- [ ] Build customer management
- [ ] Build product management

### Testing Phase
- [ ] Test all APIs
- [ ] Test authentication
- [ ] Test invoice creation
- [ ] Test GST calculations
- [ ] Test error handling

### Deployment Phase
- [ ] Build frontend
- [ ] Build backend
- [ ] Setup database
- [ ] Deploy to hosting
- [ ] Setup monitoring

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Express.js Docs](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [GST India](https://www.gst.gov.in/)

## 📞 Quick Help

### Need to...
- **Add new API endpoint?** → Check `backend/routes/`
- **Add new page?** → Check `frontend/app/`
- **Change database?** → Edit `backend/prisma/schema.prisma`
- **Add new field?** → Update schema, run migration
- **Test API?** → Use curl or Postman
- **Debug?** → Check console logs

## 🎓 Learning Path

1. **Understand Architecture** → Read ARCHITECTURE.md
2. **Setup Project** → Follow SETUP_GUIDE.md
3. **Learn API** → Check API_EXAMPLES.md
4. **Build Features** → Follow IMPLEMENTATION_GUIDE.md
5. **Deploy** → Check deployment section in README.md

## 💡 Pro Tips

- Use Postman for API testing
- Use Prisma Studio for database viewing
- Check browser console for frontend errors
- Check terminal for backend errors
- Use git for version control
- Commit frequently
- Write tests as you code
- Document your changes

## 🚀 Ready to Build?

1. Open 3 terminals
2. Run `npm run dev` in backend
3. Run `npm run dev` in frontend
4. Start building!

---

**Keep this file handy while developing!**

