# GST Invoice SaaS - Complete Setup Guide

## Step-by-Step Installation

### 1. Prerequisites Installation

#### Windows
- Download Node.js from https://nodejs.org/ (LTS version)
- Download PostgreSQL from https://www.postgresql.org/download/windows/
- Download Git from https://git-scm.com/download/win

#### macOS
```bash
# Using Homebrew
brew install node postgresql git
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install nodejs npm postgresql git
```

### 2. Database Setup

#### Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE gst_invoice_saas;

# Create user
CREATE USER invoice_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE gst_invoice_saas TO invoice_user;

# Exit
\q
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database URL
# DATABASE_URL=postgresql://invoice_user:your_secure_password@localhost:5432/gst_invoice_saas

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

The backend will run on http://localhost:5000

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1" > .env.local

# Start development server
npm run dev
```

The frontend will run on http://localhost:3000

### 5. Verify Installation

#### Check Backend
```bash
curl http://localhost:5000/health
# Should return: {"status":"OK","timestamp":"..."}
```

#### Check Frontend
Open http://localhost:3000 in your browser

## 🔧 Configuration

### Backend Configuration (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://invoice_user:password@localhost:5432/gst_invoice_saas

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# GST API (For e-invoice generation)
GST_API_URL=https://einvoice1.gst.gov.in
GST_API_KEY=your_gst_api_key
```

### Frontend Configuration (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## 📱 First Time Usage

### 1. Register Account
- Go to http://localhost:3000
- Click "Sign Up"
- Fill in your details
- Click "Register"

### 2. Create Organization
- After login, create your business/organization
- Fill in GSTIN, business name, address, etc.
- Save organization

### 3. Add Customers
- Go to Customers section
- Click "Add Customer"
- Fill in customer details
- Save

### 4. Add Products
- Go to Products section
- Click "Add Product"
- Fill in product details with HSN/SAC code and GST rate
- Save

### 5. Create Invoice
- Go to Invoices section
- Click "Create Invoice"
- Select customer
- Add line items
- System automatically calculates GST
- Save as draft or send

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Make sure PostgreSQL is running
```bash
# Windows
net start postgresql-x64-15

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change PORT in .env or kill process using port
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Module Not Found
```
Error: Cannot find module 'express'
```
**Solution**: Install dependencies
```bash
npm install
```

### Prisma Migration Error
```
Error: P1000 Authentication failed
```
**Solution**: Check DATABASE_URL in .env
```bash
# Test connection
psql postgresql://user:password@localhost:5432/gst_invoice_saas
```

## 📊 Database Management

### View Database
```bash
# Connect to database
psql -U invoice_user -d gst_invoice_saas

# List tables
\dt

# Exit
\q
```

### Prisma Studio (Visual Database Manager)
```bash
cd backend
npx prisma studio
```
Opens http://localhost:5555

### Reset Database
```bash
cd backend
npx prisma migrate reset
```

## 🚀 Development Workflow

### Making Changes

1. **Backend Changes**
   - Edit files in `backend/routes/` or `backend/middleware/`
   - Server auto-reloads with nodemon
   - Test with curl or Postman

2. **Frontend Changes**
   - Edit files in `frontend/app/`
   - Browser auto-refreshes with hot reload
   - Check console for errors

3. **Database Schema Changes**
   - Edit `backend/prisma/schema.prisma`
   - Run: `npx prisma migrate dev --name description`
   - Prisma client auto-generates

## 📦 Building for Production

### Backend Build
```bash
cd backend
npm run build
npm start
```

### Frontend Build
```bash
cd frontend
npm run build
npm start
```

## 🔐 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use strong database password
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Use environment variables for secrets
- [ ] Enable CORS only for your domain
- [ ] Set up rate limiting
- [ ] Enable database backups
- [ ] Use strong passwords for admin accounts

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review error messages carefully
3. Check logs: `npm run dev` shows detailed errors
4. Open an issue on GitHub

## 🎓 Next Steps

1. Explore the codebase
2. Read ARCHITECTURE.md for system design
3. Check API endpoints in README.md
4. Start building features!

---

**Happy coding! 🚀**

