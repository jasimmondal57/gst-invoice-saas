const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Phase 1 Complete Tests...\n');

  try {
    // Test 1: Create Organization
    console.log('Test 1: Creating organization...');
    const uniqueGstin = `TEST${Date.now()}`;
    const org = await prisma.organization.create({
      data: {
        name: `Test Company ${Date.now()}`,
        gstin: uniqueGstin,
        email: `test-${Date.now()}@company.com`,
        phone: '9876543210',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        pincode: '123456',
      },
    });
    console.log('✅ Organization created:', org.id);

    // Test 2: Create User
    console.log('\nTest 2: Creating user...');
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const user = await prisma.user.create({
      data: {
        email: uniqueEmail,
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
      },
    });
    console.log('✅ User created:', user.id);

    // Test 3: Create Supplier
    console.log('\nTest 3: Creating supplier...');
    const supplier = await prisma.supplier.create({
      data: {
        organizationId: org.id,
        name: 'Test Supplier',
        email: 'supplier@test.com',
        phone: '9876543210',
        gstin: 'SUPP123456789',
        address: '456 Supplier St',
        city: 'Supplier City',
        state: 'SC',
        pincode: '654321',
      },
    });
    console.log('✅ Supplier created:', supplier.id);

    // Test 4: Create Product
    console.log('\nTest 4: Creating product...');
    const product = await prisma.product.create({
      data: {
        organizationId: org.id,
        name: 'Test Product',
        hsn: '1234567890',
        unit: 'Nos',
        price: 1000,
        gstRate: 18,
      },
    });
    console.log('✅ Product created:', product.id);

    // Test 5: Create Purchase Order
    console.log('\nTest 5: Creating purchase order...');
    const po = await prisma.purchaseOrder.create({
      data: {
        organizationId: org.id,
        supplierId: supplier.id,
        userId: user.id,
        poNumber: 'PO-001',
        poDate: new Date(),
        subtotal: 1000,
        taxAmount: 180,
        totalAmount: 1180,
        items: {
          create: [
            {
              description: 'Test Item',
              quantity: 1,
              unit: 'Nos',
              rate: 1000,
              gstRate: 18,
              amount: 1000,
            },
          ],
        },
      },
      include: { items: true },
    });
    console.log('✅ Purchase Order created:', po.id);

    // Test 6: Create Bank Reconciliation
    console.log('\nTest 6: Creating bank reconciliation...');
    const reconciliation = await prisma.bankReconciliation.create({
      data: {
        organizationId: org.id,
        bankAccount: '1234567890',
        statementDate: new Date(),
        openingBalance: 10000,
        closingBalance: 11180,
      },
    });
    console.log('✅ Bank Reconciliation created:', reconciliation.id);

    // Test 7: Add Bank Transaction
    console.log('\nTest 7: Adding bank transaction...');
    const transaction = await prisma.bankTransaction.create({
      data: {
        reconciliationId: reconciliation.id,
        transactionDate: new Date(),
        description: 'PO Payment',
        amount: 1180,
        type: 'WITHDRAWAL',
        referenceNo: po.poNumber,
      },
    });
    console.log('✅ Bank Transaction created:', transaction.id);

    // Test 8: Create Cheque
    console.log('\nTest 8: Creating cheque...');
    const cheque = await prisma.cheque.create({
      data: {
        organizationId: org.id,
        chequeNumber: 'CHQ-001',
        chequeDate: new Date(),
        amount: 1180,
        bankName: 'Test Bank',
        status: 'ISSUED',
      },
    });
    console.log('✅ Cheque created:', cheque.id);

    // Test 9: Fetch Purchase Orders
    console.log('\nTest 9: Fetching purchase orders...');
    const pos = await prisma.purchaseOrder.findMany({
      where: { organizationId: org.id },
      include: { supplier: true, items: true },
    });
    console.log(`✅ Found ${pos.length} purchase order(s)`);

    // Test 10: Update Purchase Order Status
    console.log('\nTest 10: Updating purchase order status...');
    const updatedPO = await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: { status: 'CONFIRMED' },
    });
    console.log('✅ Purchase Order status updated to:', updatedPO.status);

    // Test 11: Fetch Cheques Summary
    console.log('\nTest 11: Fetching cheques summary...');
    const cheques = await prisma.cheque.findMany({
      where: { organizationId: org.id },
    });
    const summary = {
      totalCheques: cheques.length,
      totalAmount: cheques.reduce((sum, c) => sum + c.amount, 0),
      issuedCount: cheques.filter((c) => c.status === 'ISSUED').length,
    };
    console.log('✅ Cheques Summary:', summary);

    // Test 12: Fetch Bank Reconciliation with Transactions
    console.log('\nTest 12: Fetching bank reconciliation with transactions...');
    const reconciliationWithTransactions = await prisma.bankReconciliation.findUnique({
      where: { id: reconciliation.id },
      include: { transactions: true },
    });
    console.log(`✅ Reconciliation has ${reconciliationWithTransactions?.transactions.length} transaction(s)`);

    console.log('\n✅ All Phase 1 Complete tests passed!\n');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.purchaseOrder.deleteMany({ where: { organizationId: org.id } });
    await prisma.bankReconciliation.deleteMany({ where: { organizationId: org.id } });
    await prisma.cheque.deleteMany({ where: { organizationId: org.id } });
    await prisma.product.deleteMany({ where: { organizationId: org.id } });
    await prisma.supplier.deleteMany({ where: { organizationId: org.id } });
    await prisma.organization.delete({ where: { id: org.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('✅ Cleanup complete\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();

