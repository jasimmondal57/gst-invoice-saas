const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating test data...');

    // 1. Create or get organization
    let organization = await prisma.organization.findFirst();
    
    if (!organization) {
      console.log('Creating organization...');
      organization = await prisma.organization.create({
        data: {
          name: 'Test Company',
          gstin: '27AABCT1234H1Z0',
          pan: 'AAACT1234H',
          email: 'test@company.com',
          phone: '9876543210',
          address: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
          invoicePrefix: 'INV-',
          invoiceStartNumber: 1,
        },
      });
      console.log('Organization created:', organization.id);
    } else {
      console.log('Organization exists:', organization.id);
    }

    // 2. Create or get user
    let user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('Creating user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          phone: '9876543210',
          role: 'OWNER',
          status: 'ACTIVE',
        },
      });
      console.log('User created:', user.id);
    } else {
      console.log('User exists:', user.id);
    }

    // 3. Create organization member
    let member = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: organization.id,
      },
    });

    if (!member) {
      console.log('Creating organization member...');
      member = await prisma.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: 'OWNER',
        },
      });
      console.log('Organization member created:', member.id);
    } else {
      console.log('Organization member exists:', member.id);
    }

    // 4. Create customer
    let customer = await prisma.customer.findFirst({
      where: { organizationId: organization.id },
    });

    if (!customer) {
      console.log('Creating customer...');
      customer = await prisma.customer.create({
        data: {
          organizationId: organization.id,
          name: 'Test Customer',
          type: 'B2B',
          gstin: '27AABCT5678H1Z0',
          email: 'customer@example.com',
          phone: '9876543211',
          address: '456 Customer Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400002',
        },
      });
      console.log('Customer created:', customer.id);
    } else {
      console.log('Customer exists:', customer.id);
    }

    // 5. Create invoice
    console.log('Creating invoice...');
    const invoiceNumber = `INV-${String(1).padStart(5, '0')}`;
    
    const invoice = await prisma.invoice.create({
      data: {
        organizationId: organization.id,
        customerId: customer.id,
        userId: user.id,
        invoiceNumber: invoiceNumber,
        invoiceDate: new Date(),
        invoiceType: 'B2B',
        subtotal: 1000,
        taxAmount: 180,
        totalAmount: 1180,
        status: 'DRAFT',
        items: {
          create: [
            {
              description: 'Test Product',
              quantity: 1,
              unit: 'Nos',
              rate: 1000,
              gstRate: 18,
              amount: 1000,
            },
          ],
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    console.log('✅ Invoice created successfully!');
    console.log('Invoice ID:', invoice.id);
    console.log('Invoice Number:', invoice.invoiceNumber);
    console.log('Total Amount:', invoice.totalAmount);
    console.log('Items:', invoice.items.length);

    // 6. Verify invoice
    const verifyInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        customer: true,
        items: true,
      },
    });

    console.log('\n✅ Verification:');
    console.log('Invoice found:', verifyInvoice?.invoiceNumber);
    console.log('Customer:', verifyInvoice?.customer.name);
    console.log('Items:', verifyInvoice?.items.length);
    console.log('Total:', verifyInvoice?.totalAmount);

  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

