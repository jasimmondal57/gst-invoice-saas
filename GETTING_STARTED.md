# GST Invoice SaaS - Getting Started Checklist

## 🎯 Your First 24 Hours

### Hour 1: Environment Setup
- [ ] Install Node.js 18+ from https://nodejs.org/
- [ ] Install PostgreSQL from https://www.postgresql.org/download/
- [ ] Install Git from https://git-scm.com/
- [ ] Install VS Code from https://code.visualstudio.com/
- [ ] Clone the repository: `git clone <repo-url>`

### Hour 2: Database Setup
- [ ] Open PostgreSQL
- [ ] Create database: `CREATE DATABASE gst_invoice_saas;`
- [ ] Create user: `CREATE USER invoice_user WITH PASSWORD 'password';`
- [ ] Grant privileges: `GRANT ALL PRIVILEGES ON DATABASE gst_invoice_saas TO invoice_user;`
- [ ] Verify connection

### Hour 3: Backend Setup
- [ ] Navigate to backend: `cd backend`
- [ ] Install dependencies: `npm install`
- [ ] Copy .env: `cp .env.example .env`
- [ ] Edit .env with database URL
- [ ] Generate Prisma: `npx prisma generate`
- [ ] Run migrations: `npx prisma migrate dev --name init`
- [ ] Start server: `npm run dev`
- [ ] Verify: http://localhost:5000/health

### Hour 4: Frontend Setup
- [ ] Open new terminal
- [ ] Navigate to frontend: `cd frontend`
- [ ] Install dependencies: `npm install`
- [ ] Create .env.local: `echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1" > .env.local`
- [ ] Start dev server: `npm run dev`
- [ ] Verify: http://localhost:3000

---

## 📚 Your First Week

### Day 1: Understand the Project
- [ ] Read README.md (5 min)
- [ ] Read PROJECT_SUMMARY.md (10 min)
- [ ] Review ARCHITECTURE.md (15 min)
- [ ] Check QUICK_REFERENCE.md (10 min)
- [ ] Total: 40 minutes

### Day 2: Setup & Test
- [ ] Complete environment setup (see above)
- [ ] Test backend APIs with Postman
- [ ] Test frontend landing page
- [ ] Verify database connection
- [ ] Check all systems running

### Day 3: Explore Codebase
- [ ] Review backend/routes/ structure
- [ ] Review frontend/app/ structure
- [ ] Check database schema in prisma/schema.prisma
- [ ] Review API examples in API_EXAMPLES.md
- [ ] Understand authentication flow

### Day 4: Test APIs
- [ ] Register a user
- [ ] Login with credentials
- [ ] Create an organization
- [ ] Add a customer
- [ ] Add a product
- [ ] Create an invoice

### Day 5: Plan Development
- [ ] Read IMPLEMENTATION_GUIDE.md
- [ ] Read DEVELOPMENT_ROADMAP.md
- [ ] Decide which feature to build first
- [ ] Create development plan
- [ ] Setup project management tool

---

## 🛠️ Essential Commands

### Backend Commands
```bash
cd backend

# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production

# Database
npx prisma migrate dev   # Create migration
npx prisma studio       # Open database UI
npx prisma generate     # Generate client
npx prisma reset        # Reset database

# Testing
npm test                 # Run tests
npm run test:watch      # Watch mode
```

### Frontend Commands
```bash
cd frontend

# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production

# Linting
npm run lint             # Run linter
npm run lint:fix         # Fix linting issues

# Testing
npm test                 # Run tests
npm run test:watch      # Watch mode
```

---

## 🔑 Important Files to Know

### Backend
- `backend/server.js` - Main server file
- `backend/routes/` - API endpoints
- `backend/middleware/auth.js` - Authentication
- `backend/prisma/schema.prisma` - Database schema
- `backend/.env.example` - Environment template

### Frontend
- `frontend/app/page.tsx` - Landing page
- `frontend/app/layout.tsx` - Root layout
- `frontend/components/` - React components
- `frontend/lib/` - Utilities
- `frontend/.env.local` - Environment variables

### Documentation
- `README.md` - Start here
- `SETUP_GUIDE.md` - Installation
- `QUICK_REFERENCE.md` - Quick lookup
- `API_EXAMPLES.md` - API usage
- `IMPLEMENTATION_GUIDE.md` - Development

---

## 🧪 Testing Your Setup

### Test Backend
```bash
# Check server is running
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","firstName":"Test","lastName":"User","phone":"9876543210"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'
```

### Test Frontend
- Open http://localhost:3000
- See landing page
- Click "Sign Up"
- Click "Learn More"
- Verify responsive design

---

## 🚀 First Feature to Build

### Recommended: Login Page
**Why**: Foundation for all other features

**Steps**:
1. Create `frontend/app/(auth)/login/page.tsx`
2. Create login form component
3. Add form validation
4. Connect to backend API
5. Handle errors
6. Test with real user

**Time**: 2-3 hours

**Next**: Register page, then dashboard

---

## 📊 Development Workflow

### Daily Workflow
1. **Morning**: Check task list
2. **Development**: Build features
3. **Testing**: Test your changes
4. **Commit**: Commit to git
5. **Review**: Review code quality

### Feature Development
1. **Plan**: Understand requirements
2. **Design**: Sketch UI/API
3. **Implement**: Write code
4. **Test**: Test thoroughly
5. **Review**: Code review
6. **Deploy**: Deploy to staging
7. **Launch**: Deploy to production

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/login-page

# Make changes
# ... edit files ...

# Commit changes
git add .
git commit -m "Add login page"

# Push to remote
git push origin feature/login-page

# Create pull request
# ... on GitHub ...
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Database Connection Error
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
# Test connection: psql postgresql://user:pass@localhost:5432/db
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Prisma Issues
```bash
# Regenerate client
npx prisma generate

# Reset database
npx prisma migrate reset
```

---

## 📞 Getting Help

### Resources
1. **Documentation** - Check relevant .md file
2. **API Examples** - See API_EXAMPLES.md
3. **Quick Reference** - See QUICK_REFERENCE.md
4. **Implementation Guide** - See IMPLEMENTATION_GUIDE.md

### Common Issues
- Port in use → Kill process
- DB connection → Check .env
- Module not found → npm install
- Prisma error → npx prisma generate

---

## ✅ Success Checklist

### Setup Complete When:
- [ ] Node.js installed
- [ ] PostgreSQL running
- [ ] Backend running on :5000
- [ ] Frontend running on :3000
- [ ] Database connected
- [ ] Can register user
- [ ] Can login user

### Ready to Build When:
- [ ] All setup complete
- [ ] Understand project structure
- [ ] Read documentation
- [ ] Tested APIs
- [ ] Planned first feature

---

## 🎯 Your First Week Goals

### By End of Day 1
- [ ] Environment setup complete
- [ ] All systems running
- [ ] Can access frontend & backend

### By End of Day 2
- [ ] Database setup complete
- [ ] Migrations run
- [ ] Can test APIs

### By End of Day 3
- [ ] Understand codebase
- [ ] Know where files are
- [ ] Understand architecture

### By End of Day 4
- [ ] Tested all APIs
- [ ] Created test data
- [ ] Verified calculations

### By End of Day 5
- [ ] Development plan ready
- [ ] First feature identified
- [ ] Ready to start coding

---

## 🚀 Ready to Start?

1. ✅ Complete setup checklist
2. ✅ Read documentation
3. ✅ Test your environment
4. ✅ Choose first feature
5. ✅ Start coding!

---

**You've got this! Let's build something amazing! 🎉**

For detailed setup instructions, see SETUP_GUIDE.md
For quick reference, see QUICK_REFERENCE.md
For development plan, see DEVELOPMENT_ROADMAP.md

