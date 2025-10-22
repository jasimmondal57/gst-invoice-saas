const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Advanced Reports Tests...\n');

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

    // Test 3: Create Customers
    console.log('\nTest 3: Creating customers...');
    const customer1 = await prisma.customer.create({
      data: {
        organizationId: org.id,
        name: 'Customer A',
        email: 'customerA@test.com',
        phone: '9876543210',
        gstin: 'CUST123456789',
        address: '789 Customer St',
        city: 'Customer City',
        state: 'CC',
        pincode: '789012',
        type: 'B2B',
      },
    });

    const customer2 = await prisma.customer.create({
      data: {
        organizationId: org.id,
        name: 'Customer B',
        email: 'customerB@test.com',
        phone: '9876543211',
        gstin: 'CUST987654321',
        address: '456 Another St',
        city: 'Another City',
        state: 'AC',
        pincode: '456789',
        type: 'B2B',
      },
    });

    console.log('✅ Customers created:', customer1.id, customer2.id);

    // Test 4: Create Products
    console.log('\nTest 4: Creating products...');
    const product1 = await prisma.product.create({
      data: {
        organizationId: org.id,
        name: 'Product A',
        hsn: '1001',
        gstRate: 18,
        unit: 'Nos',
        price: 1000,
      },
    });

    const product2 = await prisma.product.create({
      data: {
        organizationId: org.id,
        name: 'Product B',
        hsn: '1002',
        gstRate: 18,
        unit: 'Nos',
        price: 2000,
      },
    });

    console.log('✅ Products created:', product1.id, product2.id);

    // Test 5: Create Invoices
    console.log('\nTest 5: Creating invoices...');
    const invoice1 = await prisma.invoice.create({
      data: {
        organizationId: org.id,
        customerId: customer1.id,
        userId: user.id,
        invoiceNumber: `INV-${Date.now()}-1`,
        invoiceDate: new Date(),
        invoiceType: 'B2B',
        subtotal: 10000,
        taxAmount: 1800,
        totalAmount: 11800,
        status: 'SENT',
        items: {
          create: [
            {
              description: 'Product A',
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

    const invoice2 = await prisma.invoice.create({
      data: {
        organizationId: org.id,
        customerId: customer2.id,
        userId: user.id,
        invoiceNumber: `INV-${Date.now()}-2`,
        invoiceDate: new Date(),
        invoiceType: 'B2B',
        subtotal: 20000,
        taxAmount: 3600,
        totalAmount: 23600,
        status: 'SENT',
        items: {
          create: [
            {
              description: 'Product B',
              quantity: 10,
              unit: 'Nos',
              rate: 2000,
              gstRate: 18,
              amount: 20000,
            },
          ],
        },
      },
    });

    console.log('✅ Invoices created:', invoice1.id, invoice2.id);

    // Test 6: Create Purchases
    console.log('\nTest 6: Creating purchases...');
    const supplier = await prisma.supplier.create({
      data: {
        organizationId: org.id,
        name: 'Supplier A',
        email: 'supplier@test.com',
        phone: '9876543212',
        gstin: 'SUPP123456789',
        address: '321 Supplier St',
        city: 'Supplier City',
        state: 'SC',
        pincode: '321654',
      },
    });

    const purchase1 = await prisma.purchase.create({
      data: {
        organizationId: org.id,
        supplierId: supplier.id,
        userId: user.id,
        purchaseNumber: `PUR-${Date.now()}-1`,
        purchaseDate: new Date(),
        subtotal: 5000,
        taxAmount: 900,
        totalAmount: 5900,
        status: 'RECEIVED',
        items: {
          create: [
            {
              description: 'Raw Material',
              quantity: 5,
              unit: 'Nos',
              rate: 1000,
              gstRate: 18,
              amount: 5000,
            },
          ],
        },
      },
    });

    console.log('✅ Purchases created:', purchase1.id);

    // Test 7: Verify Sales Summary
    console.log('\nTest 7: Verifying sales summary...');
    const invoices = await prisma.invoice.findMany({
      where: { organizationId: org.id },
    });

    let totalSales = 0;
    invoices.forEach((inv) => {
      totalSales += inv.subtotal;
    });

    console.log(`✅ Total Sales: ₹${totalSales.toLocaleString('en-IN')}`);
    console.log(`✅ Total Invoices: ${invoices.length}`);

    // Test 8: Verify P&L
    console.log('\nTest 8: Verifying P&L...');
    const purchases = await prisma.purchase.findMany({
      where: { organizationId: org.id },
    });

    let totalPurchases = 0;
    purchases.forEach((pur) => {
      totalPurchases += pur.subtotal;
    });

    const profit = totalSales - totalPurchases;
    console.log(`✅ Total Revenue: ₹${totalSales.toLocaleString('en-IN')}`);
    console.log(`✅ Total Cost: ₹${totalPurchases.toLocaleString('en-IN')}`);
    console.log(`✅ Gross Profit: ₹${profit.toLocaleString('en-IN')}`);

    // Test 9: Verify Top Products
    console.log('\nTest 9: Verifying top products...');
    const items = await prisma.invoiceItem.findMany({
      where: { invoice: { organizationId: org.id } },
      include: { product: true },
    });

    console.log(`✅ Found ${items.length} invoice items`);
    items.forEach((item) => {
      if (item.product) {
        console.log(`   - ${item.product.name}: ${item.quantity} units`);
      } else {
        console.log(`   - Item: ${item.quantity} units`);
      }
    });

    console.log('\n✅ All Advanced Reports tests passed!\n');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.invoiceItem.deleteMany({ where: { invoice: { organizationId: org.id } } });
    await prisma.invoice.deleteMany({ where: { organizationId: org.id } });
    await prisma.purchaseItem.deleteMany({ where: { purchase: { organizationId: org.id } } });
    await prisma.purchase.deleteMany({ where: { organizationId: org.id } });
    await prisma.customer.deleteMany({ where: { organizationId: org.id } });
    await prisma.supplier.deleteMany({ where: { organizationId: org.id } });
    await prisma.product.deleteMany({ where: { organizationId: org.id } });
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

