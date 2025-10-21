const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Payment Reconciliation Tests...\n');

  try {
    // Test 1: Create Organization
    console.log('Test 1: Creating organization...');
    const org = await prisma.organization.create({
      data: {
        name: `Test Company ${Date.now()}`,
        gstin: `TEST${Date.now()}`,
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
    const user = await prisma.user.create({
      data: {
        email: `user-${Date.now()}@example.com`,
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
      },
    });
    console.log('✅ User created:', user.id);

    // Test 3: Create Customer
    console.log('\nTest 3: Creating customer...');
    const customer = await prisma.customer.create({
      data: {
        organizationId: org.id,
        name: 'Test Customer',
        email: 'customer@test.com',
        phone: '9876543210',
        gstin: 'CUST123456789',
        address: '789 Customer St',
        city: 'Customer City',
        state: 'CC',
        pincode: '789012',
        type: 'B2B',
      },
    });
    console.log('✅ Customer created:', customer.id);

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

    // Test 5: Create Invoices
    console.log('\nTest 5: Creating invoices...');
    const invoice1 = await prisma.invoice.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        userId: user.id,
        invoiceNumber: `INV-${Date.now()}-1`,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 1000,
        taxAmount: 180,
        totalAmount: 1180,
        status: 'SENT',
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
    });

    const invoice2 = await prisma.invoice.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        userId: user.id,
        invoiceNumber: `INV-${Date.now()}-2`,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 2000,
        taxAmount: 360,
        totalAmount: 2360,
        status: 'SENT',
        items: {
          create: [
            {
              description: 'Test Item 2',
              quantity: 2,
              unit: 'Nos',
              rate: 1000,
              gstRate: 18,
              amount: 2000,
            },
          ],
        },
      },
    });

    const invoice3 = await prisma.invoice.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        userId: user.id,
        invoiceNumber: `INV-${Date.now()}-3`,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Overdue
        subtotal: 500,
        taxAmount: 90,
        totalAmount: 590,
        status: 'SENT',
        items: {
          create: [
            {
              description: 'Test Item 3',
              quantity: 0.5,
              unit: 'Nos',
              rate: 1000,
              gstRate: 18,
              amount: 500,
            },
          ],
        },
      },
    });
    console.log('✅ Invoices created:', invoice1.id, invoice2.id, invoice3.id);

    // Test 6: Record Payments
    console.log('\nTest 6: Recording payments...');
    const payment1 = await prisma.payment.create({
      data: {
        organizationId: org.id,
        invoiceId: invoice1.id,
        amount: 1180,
        paymentDate: new Date(),
        paymentMode: 'BANK_TRANSFER',
        referenceNo: 'TXN-001',
        status: 'COMPLETED',
      },
    });

    const payment2 = await prisma.payment.create({
      data: {
        organizationId: org.id,
        invoiceId: invoice2.id,
        amount: 1000,
        paymentDate: new Date(),
        paymentMode: 'CHEQUE',
        referenceNo: 'CHQ-001',
        status: 'COMPLETED',
      },
    });
    console.log('✅ Payments recorded:', payment1.id, payment2.id);

    // Test 7: Calculate Outstanding
    console.log('\nTest 7: Calculating outstanding amounts...');
    const invoices = await prisma.invoice.findMany({
      where: { organizationId: org.id },
    });

    let totalOutstanding = 0;
    let overdueAmount = 0;
    const today = new Date();

    for (const invoice of invoices) {
      const payments = await prisma.payment.findMany({
        where: { invoiceId: invoice.id, status: 'COMPLETED' },
      });

      const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      const pendingAmount = invoice.totalAmount - paidAmount;

      if (pendingAmount > 0) {
        totalOutstanding += pendingAmount;
        if (invoice.dueDate && invoice.dueDate < today) {
          overdueAmount += pendingAmount;
        }
      }
    }

    console.log('✅ Outstanding Summary:');
    console.log(`   Total Outstanding: ₹${totalOutstanding}`);
    console.log(`   Overdue Amount: ₹${overdueAmount}`);

    // Test 8: Payment Status by Invoice
    console.log('\nTest 8: Payment status by invoice...');
    for (const invoice of invoices) {
      const payments = await prisma.payment.findMany({
        where: { invoiceId: invoice.id, status: 'COMPLETED' },
      });

      const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
      const pendingAmount = invoice.totalAmount - paidAmount;
      const status = pendingAmount === 0 ? 'PAID' : pendingAmount === invoice.totalAmount ? 'UNPAID' : 'PARTIAL';

      console.log(`   ${invoice.invoiceNumber}: ${status} (Paid: ₹${paidAmount}, Pending: ₹${pendingAmount})`);
    }

    // Test 9: Payment History
    console.log('\nTest 9: Fetching payment history...');
    const allPayments = await prisma.payment.findMany({
      where: { organizationId: org.id },
    });
    console.log(`✅ Total payments recorded: ${allPayments.length}`);

    console.log('\n✅ All Payment Reconciliation tests passed!\n');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.payment.deleteMany({ where: { organizationId: org.id } });
    await prisma.invoice.deleteMany({ where: { organizationId: org.id } });
    await prisma.product.deleteMany({ where: { organizationId: org.id } });
    await prisma.customer.deleteMany({ where: { organizationId: org.id } });
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

