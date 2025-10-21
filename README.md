# GST Invoice SaaS Platform - InvoiceHub

A comprehensive web-based GST invoice management and billing SaaS platform built with modern technologies. Similar to Vyapaar, this platform helps Indian businesses create GST-compliant invoices, manage inventory, track expenses, and generate GST reports.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd invoice
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL and other configurations
npx prisma migrate dev
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api/v1

## 📁 Project Structure

```
invoice/
├── frontend/                 # Next.js React application
│   ├── app/                 # App router pages
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utility functions
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                 # Express.js API server
│   ├── routes/              # API route handlers
│   ├── middleware/          # Custom middleware
│   ├── prisma/              # Database schema
│   ├── server.js            # Main server file
│   ├── .env.example         # Environment variables template
│   └── package.json
│
├── ARCHITECTURE.md          # System architecture documentation
└── README.md               # This file
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **jsPDF** - PDF generation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Prisma** - ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Joi** - Data validation

## 📋 Features

### Phase 1 - Critical Features ✅ COMPLETE
- [x] Company Setup Module (3 tabs)
- [x] Invoice Management with auto-numbering
- [x] Purchase Module with supplier management
- [x] Enhanced Sales Invoice with discounts

### Phase 2 - Inventory & Party Management ✅ COMPLETE
- [x] Inventory Management with stock tracking
- [x] Party Management with grouping
- [x] Payment Management with multiple modes

### Phase 3 - Advanced Features ✅ COMPLETE
- [x] Comprehensive Reporting (9 report types)
- [x] GST Compliance (GSTR-1, 2, 3B, 9)
- [x] Manufacturing Module (BOM, Production Orders)
- [x] E-Invoice & E-Waybill

### Phase 4 - Enterprise Features ✅ COMPLETE
- [x] User Management with role-based access
- [x] Audit Trail with comprehensive logging
- [x] Data Backup & Export/Import
- [x] Help & Support system

## 🔐 Authentication

The platform uses JWT-based authentication:

1. **Register** - Create a new account
2. **Login** - Get JWT token
3. **Protected Routes** - Use token in Authorization header
4. **Token Refresh** - Automatic token refresh

### Example API Call
```bash
curl -X GET http://localhost:5000/api/v1/invoices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Database Schema

### Core Tables
- **users** - User accounts
- **organizations** - Business information
- **invoices** - Invoice records
- **invoice_items** - Line items
- **customers** - Customer information
- **products** - Product catalog
- **e_invoices** - E-invoice records
- **audit_logs** - Activity tracking

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Organizations
- `GET /api/v1/organizations` - List organizations
- `POST /api/v1/organizations` - Create organization
- `GET /api/v1/organizations/:id` - Get organization
- `PUT /api/v1/organizations/:id` - Update organization

### Invoices
- `GET /api/v1/invoices` - List invoices
- `POST /api/v1/invoices` - Create invoice
- `GET /api/v1/invoices/:id` - Get invoice
- `PUT /api/v1/invoices/:id` - Update invoice
- `DELETE /api/v1/invoices/:id` - Delete invoice

### Customers
- `GET /api/v1/customers` - List customers
- `POST /api/v1/customers` - Create customer
- `GET /api/v1/customers/:id` - Get customer
- `PUT /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer

### Products
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/:id` - Get product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Reports
- `GET /api/v1/reports/gstr-1` - Generate GSTR-1 report
- `GET /api/v1/reports/gstr-2` - Generate GSTR-2 report
- `GET /api/v1/reports/dashboard/stats` - Dashboard statistics

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel deploy
```

### Backend (Railway/Render)
```bash
cd backend
npm run build
# Deploy to Railway or Render
```

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/gst_invoice_saas
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📚 Documentation

- [COMPLETE_PROJECT_SUMMARY.md](./COMPLETE_PROJECT_SUMMARY.md) - Complete project overview
- [QUICK_REFERENCE_GUIDE.md](./QUICK_REFERENCE_GUIDE.md) - Quick start guide
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing procedures
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production deployment
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [Database Schema](./backend/prisma/schema.prisma)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@invoicehub.com or open an issue on GitHub.

## 🎯 Roadmap

- Q1 2025: MVP launch with core invoicing features
- Q2 2025: E-invoice integration and GST reports
- Q3 2025: Mobile app and advanced analytics
- Q4 2025: Payment integration and API marketplace

---

**Built with ❤️ for Indian businesses**

