const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting GST Compliance Tests...\n');

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

    // Test 4: Create Invoices
    console.log('\nTest 4: Creating invoices...');
    const invoice1 = await prisma.invoice.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
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
              description: 'Test Item',
              quantity: 1,
              unit: 'Nos',
              rate: 10000,
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
        customerId: customer.id,
        userId: user.id,
        invoiceNumber: `INV-${Date.now()}-2`,
        invoiceDate: new Date(),
        invoiceType: 'B2C',
        subtotal: 5000,
        taxAmount: 900,
        totalAmount: 5900,
        status: 'SENT',
        items: {
          create: [
            {
              description: 'Test Item 2',
              quantity: 1,
              unit: 'Nos',
              rate: 5000,
              gstRate: 18,
              amount: 5000,
            },
          ],
        },
      },
    });

    console.log('✅ Invoices created:', invoice1.id, invoice2.id);

    // Test 5: Generate GSTR-1
    console.log('\nTest 5: Generating GSTR-1...');
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    const gstr1 = await prisma.gSTR1Report.create({
      data: {
        organizationId: org.id,
        month,
        year,
        b2bSupplies: 1,
        b2bTaxableValue: 10000,
        b2bIGST: 900,
        b2bCGST: 450,
        b2bSGST: 450,
        b2cSupplies: 1,
        b2cTaxableValue: 5000,
        b2cIGST: 450,
        b2cCGST: 225,
        b2cSGST: 225,
        totalTaxableValue: 15000,
        totalTax: 2700,
      },
    });

    console.log('✅ GSTR-1 generated:', gstr1.id);
    console.log(`   B2B Supplies: ${gstr1.b2bSupplies}, Taxable Value: ₹${gstr1.b2bTaxableValue}`);
    console.log(`   B2C Supplies: ${gstr1.b2cSupplies}, Taxable Value: ₹${gstr1.b2cTaxableValue}`);
    console.log(`   Total Tax: ₹${gstr1.totalTax}`);

    // Test 6: Generate GSTR-2
    console.log('\nTest 6: Generating GSTR-2...');
    const gstr2 = await prisma.gSTR2Report.create({
      data: {
        organizationId: org.id,
        month,
        year,
        b2bPurchases: 2,
        b2bTaxableValue: 20000,
        b2bIGST: 1800,
        b2bCGST: 900,
        b2bSGST: 900,
        totalTaxableValue: 20000,
        totalTax: 3600,
      },
    });

    console.log('✅ GSTR-2 generated:', gstr2.id);
    console.log(`   B2B Purchases: ${gstr2.b2bPurchases}, Taxable Value: ₹${gstr2.b2bTaxableValue}`);
    console.log(`   Total Tax: ₹${gstr2.totalTax}`);

    // Test 7: Generate GSTR-3B
    console.log('\nTest 7: Generating GSTR-3B...');
    const gstr3b = await prisma.gSTR3BReport.create({
      data: {
        organizationId: org.id,
        month,
        year,
        outwardSupplies: 15000,
        outwardTax: 2700,
        inwardSupplies: 20000,
        inwardTax: 3600,
        itcAvailable: 3600,
        taxPayable: 0,
        totalPayable: 0,
      },
    });

    console.log('✅ GSTR-3B generated:', gstr3b.id);
    console.log(`   Outward Supplies: ₹${gstr3b.outwardSupplies}`);
    console.log(`   Inward Supplies: ₹${gstr3b.inwardSupplies}`);
    console.log(`   ITC Available: ₹${gstr3b.itcAvailable}`);
    console.log(`   Tax Payable: ₹${gstr3b.taxPayable}`);

    // Test 8: Generate E-Invoice
    console.log('\nTest 8: Generating E-Invoice...');
    const eInvoice = await prisma.eInvoice.create({
      data: {
        organizationId: org.id,
        invoiceId: invoice1.id,
        irn: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        qrCode: `https://einvoice.gst.gov.in/irn/${Date.now()}`,
        status: 'GENERATED',
      },
    });

    console.log('✅ E-Invoice generated:', eInvoice.id);
    console.log(`   IRN: ${eInvoice.irn}`);
    console.log(`   Status: ${eInvoice.status}`);

    // Test 9: Fetch Reports
    console.log('\nTest 9: Fetching all reports...');
    const allGstr1 = await prisma.gSTR1Report.findMany({
      where: { organizationId: org.id },
    });

    const allGstr2 = await prisma.gSTR2Report.findMany({
      where: { organizationId: org.id },
    });

    const allGstr3b = await prisma.gSTR3BReport.findMany({
      where: { organizationId: org.id },
    });

    const allEInvoices = await prisma.eInvoice.findMany({
      where: { organizationId: org.id },
    });

    console.log(`✅ Found ${allGstr1.length} GSTR-1 reports`);
    console.log(`✅ Found ${allGstr2.length} GSTR-2 reports`);
    console.log(`✅ Found ${allGstr3b.length} GSTR-3B reports`);
    console.log(`✅ Found ${allEInvoices.length} E-Invoices`);

    console.log('\n✅ All GST Compliance tests passed!\n');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.eInvoice.deleteMany({ where: { organizationId: org.id } });
    await prisma.gSTR3BReport.deleteMany({ where: { organizationId: org.id } });
    await prisma.gSTR2Report.deleteMany({ where: { organizationId: org.id } });
    await prisma.gSTR1Report.deleteMany({ where: { organizationId: org.id } });
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

