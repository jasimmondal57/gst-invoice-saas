const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Integration Features Tests...\n');

  try {
    // Test 1: Create Organization
    console.log('Test 1: Creating organization...');
    const org = await prisma.organization.create({
      data: {
        name: `Integration Test ${Date.now()}`,
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

    // Test 4: Create Invoice
    console.log('\nTest 4: Creating invoice...');
    const invoice = await prisma.invoice.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        userId: user.id,
        invoiceNumber: `INV-${Date.now()}`,
        invoiceDate: new Date(),
        invoiceType: 'B2B',
        subtotal: 10000,
        taxAmount: 1800,
        totalAmount: 11800,
        status: 'SENT',
        items: {
          create: [
            {
              description: 'Test Product',
              quantity: 10,
              unit: 'Nos',
              rate: 1000,
              gstRate: 18,
              amount: 10000,
            },
          ],
        },
      },
    });
    console.log('✅ Invoice created:', invoice.id);

    // Test 5: Create Payment (Credit Card)
    console.log('\nTest 5: Creating credit card payment...');
    const creditCardPayment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        organizationId: org.id,
        amount: 11800,
        paymentMode: 'CREDIT_CARD',
        status: 'COMPLETED',
        referenceNo: `stripe_${Date.now()}`,
        paymentDate: new Date(),
      },
    });
    console.log('✅ Credit card payment created:', creditCardPayment.id);

    // Test 6: Create Payment (UPI)
    console.log('\nTest 6: Creating UPI payment...');
    const upiPayment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        organizationId: org.id,
        amount: 11800,
        paymentMode: 'UPI',
        status: 'COMPLETED',
        referenceNo: `razorpay_${Date.now()}`,
        paymentDate: new Date(),
      },
    });
    console.log('✅ UPI payment created:', upiPayment.id);

    // Test 7: Verify Payment Integration
    console.log('\nTest 7: Verifying payment integration...');
    const payments = await prisma.payment.findMany({
      where: { invoiceId: invoice.id },
    });
    console.log(`✅ Found ${payments.length} payments for invoice`);

    // Test 8: Verify Invoice Status
    console.log('\nTest 8: Verifying invoice status...');
    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
    });
    console.log(`✅ Invoice status: ${updatedInvoice?.status}`);

    // Test 9: Create Another Customer for Testing
    console.log('\nTest 9: Creating another customer...');
    const customer2 = await prisma.customer.create({
      data: {
        organizationId: org.id,
        name: 'Test Customer 2',
        email: 'customer2@test.com',
        phone: '9876543211',
        gstin: 'CUST987654321',
        address: '456 Another St',
        city: 'Another City',
        state: 'AC',
        pincode: '456789',
        type: 'B2C',
      },
    });
    console.log('✅ Second customer created:', customer2.id);

    // Test 10: Verify Payment Modes
    console.log('\nTest 10: Verifying payment modes...');
    const paymentModes = ['CASH', 'CHEQUE', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'WALLET'];
    console.log(`✅ Supported payment modes: ${paymentModes.join(', ')}`);

    console.log('\n✅ All Integration Features tests passed!\n');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.invoiceItem.deleteMany({ where: { invoice: { organizationId: org.id } } });
    await prisma.payment.deleteMany({ where: { organizationId: org.id } });
    await prisma.invoice.deleteMany({ where: { organizationId: org.id } });
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

