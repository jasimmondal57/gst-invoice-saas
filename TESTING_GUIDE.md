# 🧪 COMPREHENSIVE TESTING GUIDE

## **OVERVIEW**

This guide covers all testing procedures for the GST Invoice Management SaaS platform, including unit tests, integration tests, and end-to-end tests.

---

## **BACKEND TESTING**

### **Setup**

1. **Install Testing Dependencies**
   ```bash
   cd backend
   npm install --save-dev jest supertest
   ```

2. **Run All Backend Tests**
   ```bash
   npm test
   ```

3. **Run Tests in Watch Mode**
   ```bash
   npm test -- --watch
   ```

4. **Generate Coverage Report**
   ```bash
   npm test -- --coverage
   ```

### **Test Files**

#### **Manufacturing Module Tests** (`backend/tests/manufacturing.test.js`)
- ✅ Create BOM
- ✅ Get all BOMs
- ✅ Get BOM details
- ✅ Update BOM
- ✅ Create Production Order
- ✅ Get all Production Orders
- ✅ Update Production Order status
- ✅ Get Production Summary
- ✅ Delete Production Order
- ✅ Delete BOM

**Run Manufacturing Tests:**
```bash
npm test -- manufacturing.test.js
```

#### **User Management Tests** (`backend/tests/users.test.js`)
- ✅ Get all users in organization
- ✅ Invite user to organization
- ✅ Update user role
- ✅ Get user details
- ✅ Create custom role
- ✅ Get all custom roles
- ✅ Update custom role
- ✅ Delete custom role
- ✅ Get audit trail
- ✅ Remove user from organization

**Run User Tests:**
```bash
npm test -- users.test.js
```

#### **Backup Module Tests** (`backend/tests/backup.test.js`)
- ✅ Create backup
- ✅ List backups
- ✅ Download backup
- ✅ Export invoices
- ✅ Export customers
- ✅ Export suppliers
- ✅ Export purchases
- ✅ Import data
- ✅ Restore from backup

**Run Backup Tests:**
```bash
npm test -- backup.test.js
```

#### **Reports Module Tests** (`backend/tests/reports.test.js`)
- ✅ Get sales report
- ✅ Get sales report with date range
- ✅ Get purchase report
- ✅ Get profit and loss report
- ✅ Get customer-wise report
- ✅ Get supplier-wise report
- ✅ Get GSTR-1 report
- ✅ Get GSTR-2 report
- ✅ Get GSTR-3B report
- ✅ Get GSTR-9 report

**Run Reports Tests:**
```bash
npm test -- reports.test.js
```

---

## **FRONTEND TESTING**

### **Setup**

1. **Install Testing Dependencies**
   ```bash
   cd frontend
   npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
   ```

2. **Run All Frontend Tests**
   ```bash
   npm test
   ```

3. **Run Tests in Watch Mode**
   ```bash
   npm test -- --watch
   ```

4. **Generate Coverage Report**
   ```bash
   npm test -- --coverage
   ```

### **Test Files**

#### **Manufacturing Page Tests** (`frontend/__tests__/manufacturing.test.tsx`)
- ✅ Renders manufacturing page
- ✅ Displays BOM tab
- ✅ Displays Production Orders tab
- ✅ Can create a new BOM
- ✅ Displays BOM list
- ✅ Displays Production Orders list
- ✅ Handles API errors gracefully
- ✅ Redirects to login if no token

**Run Manufacturing Tests:**
```bash
npm test -- manufacturing.test.tsx
```

#### **Users Page Tests** (`frontend/__tests__/users.test.tsx`)
- ✅ Renders users page
- ✅ Displays invite user form
- ✅ Displays user list
- ✅ Can invite a new user
- ✅ Displays role options
- ✅ Can update user role
- ✅ Displays audit trail
- ✅ Handles API errors gracefully
- ✅ Redirects to login if no token

**Run Users Tests:**
```bash
npm test -- users.test.tsx
```

#### **Backup Page Tests** (`frontend/__tests__/backup.test.tsx`)
- ✅ Renders backup page
- ✅ Displays Backups tab
- ✅ Displays Export tab
- ✅ Displays Import tab
- ✅ Can create a backup
- ✅ Displays backup list
- ✅ Can export data
- ✅ Can import data
- ✅ Handles API errors gracefully
- ✅ Redirects to login if no token

**Run Backup Tests:**
```bash
npm test -- backup.test.tsx
```

---

## **MANUAL TESTING CHECKLIST**

### **Manufacturing Module**
- [ ] Create a new BOM
- [ ] Add items to BOM
- [ ] Edit BOM details
- [ ] Delete BOM
- [ ] Create Production Order
- [ ] Update Production Order status
- [ ] View Production Summary
- [ ] Filter Production Orders by status

### **User Management**
- [ ] Invite new user
- [ ] Update user role
- [ ] View user list
- [ ] Remove user from organization
- [ ] Create custom role
- [ ] Update custom role
- [ ] View audit trail
- [ ] Filter audit trail by action

### **Backup & Export**
- [ ] Create backup
- [ ] Download backup
- [ ] Export invoices
- [ ] Export customers
- [ ] Export suppliers
- [ ] Export purchases
- [ ] Import data
- [ ] Restore from backup

### **Reports**
- [ ] Generate Sales Report
- [ ] Generate Purchase Report
- [ ] Generate P&L Report
- [ ] Generate Customer-wise Report
- [ ] Generate Supplier-wise Report
- [ ] Generate GSTR-1 Report
- [ ] Generate GSTR-2 Report
- [ ] Generate GSTR-3B Report
- [ ] Generate GSTR-9 Report
- [ ] Filter reports by date range

---

## **PERFORMANCE TESTING**

### **Backend Performance**
```bash
# Test API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/api/v1/reports/sales-report
```

### **Frontend Performance**
```bash
# Build and analyze bundle size
npm run build
npm run analyze
```

---

## **COVERAGE TARGETS**

| Component | Target | Current |
|-----------|--------|---------|
| Backend Routes | 80% | TBD |
| Frontend Components | 75% | TBD |
| Overall | 75% | TBD |

---

## **CONTINUOUS INTEGRATION**

### **GitHub Actions Workflow**

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install backend dependencies
        run: cd backend && npm install
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Install frontend dependencies
        run: cd frontend && npm install
      
      - name: Run frontend tests
        run: cd frontend && npm test
```

---

## **TROUBLESHOOTING**

### **Issue: Tests timeout**
**Solution:** Increase timeout in jest.config.js
```javascript
testTimeout: 30000
```

### **Issue: Database connection errors**
**Solution:** Ensure database is running and migrations are applied
```bash
cd backend && npx prisma migrate deploy
```

### **Issue: Module not found errors**
**Solution:** Clear node_modules and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## **BEST PRACTICES**

1. **Write tests for new features** before implementation
2. **Maintain test coverage** above 75%
3. **Run tests before committing** code
4. **Use descriptive test names** for clarity
5. **Mock external dependencies** (APIs, databases)
6. **Test error scenarios** not just happy paths
7. **Keep tests isolated** and independent
8. **Update tests** when requirements change

---

## **NEXT STEPS**

1. Run all tests to ensure everything works
2. Fix any failing tests
3. Generate coverage reports
4. Set up CI/CD pipeline
5. Monitor test performance

---

**Happy Testing! 🧪**

