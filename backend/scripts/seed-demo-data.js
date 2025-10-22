const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDemoData() {
  try {
    console.log('🌱 Starting demo data seeding...\n');

    // 1. Create Organization (or get existing)
    let org = await prisma.organization.findUnique({
      where: { gstin: '27AABCT1234H1Z0' },
    });

    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: 'Demo Company Ltd',
          email: 'demo@company.com',
          phone: '9876543210',
          address: '123 Business Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          gstin: '27AABCT1234H1Z0',
          pan: 'AABCT1234H',
        },
      });
      console.log('✅ Organization created:', org.name);
    } else {
      console.log('✅ Organization already exists:', org.name);
    }

    // 2. Create User (or get existing)
    let user = await prisma.user.findUnique({
      where: { email: 'demo@company.com' },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash('demo123', 10);
      user = await prisma.user.create({
        data: {
          email: 'demo@company.com',
          password: hashedPassword,
          firstName: 'Demo',
          lastName: 'User',
        },
      });
      console.log('✅ User created:', user.email);
    } else {
      console.log('✅ User already exists:', user.email);
    }

    // 3. Add user to organization (if not already added)
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: org.id,
        },
      },
    });

    if (!existingMember) {
      await prisma.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: 'ADMIN',
        },
      });
      console.log('✅ User added to organization as ADMIN\n');
    } else {
      console.log('✅ User already member of organization\n');
    }

    // 4. Create Customers
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          organizationId: org.id,
          name: 'Acme Corporation',
          email: 'contact@acme.com',
          phone: '9876543210',
          address: '456 Corporate Ave, Delhi, India',
          gstin: '07AABCT1234H1Z0',
          type: 'B2B',
        },
      }),
      prisma.customer.create({
        data: {
          organizationId: org.id,
          name: 'Tech Solutions Pvt Ltd',
          email: 'sales@techsol.com',
          phone: '9876543211',
          address: '789 Tech Park, Bangalore, India',
          gstin: '29AABCT1234H1Z0',
          type: 'B2B',
        },
      }),
      prisma.customer.create({
        data: {
          organizationId: org.id,
          name: 'Retail Store XYZ',
          email: 'retail@xyz.com',
          phone: '9876543212',
          address: '321 Market Street, Chennai, India',
          type: 'B2C',
        },
      }),
      prisma.customer.create({
        data: {
          organizationId: org.id,
          name: 'Global Enterprises',
          email: 'global@enterprises.com',
          phone: '9876543213',
          address: '654 Business Hub, Pune, India',
          gstin: '18AABCT1234H1Z0',
          type: 'B2B',
        },
      }),
    ]);
    console.log('✅ Created 4 customers\n');

    // 5. Create Products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          organizationId: org.id,
          name: 'Laptop Pro',
          description: 'High-performance laptop',
          hsn: '8471',
          price: 85000,
          gstRate: 18,
          unit: 'Nos',
          inventory: {
            create: {
              organizationId: org.id,
              quantity: 50,
              reorderLevel: 5,
            },
          },
        },
      }),
      prisma.product.create({
        data: {
          organizationId: org.id,
          name: 'Wireless Mouse',
          description: 'Ergonomic wireless mouse',
          hsn: '8517',
          price: 1500,
          gstRate: 18,
          unit: 'Nos',
          inventory: {
            create: {
              organizationId: org.id,
              quantity: 200,
              reorderLevel: 20,
            },
          },
        },
      }),
      prisma.product.create({
        data: {
          organizationId: org.id,
          name: 'USB-C Cable',
          description: 'High-speed USB-C cable',
          hsn: '8544',
          price: 500,
          gstRate: 18,
          unit: 'Nos',
          inventory: {
            create: {
              organizationId: org.id,
              quantity: 500,
              reorderLevel: 50,
            },
          },
        },
      }),
      prisma.product.create({
        data: {
          organizationId: org.id,
          name: 'Monitor 27 inch',
          description: '4K UHD Monitor',
          hsn: '8528',
          price: 25000,
          gstRate: 18,
          unit: 'Nos',
          inventory: {
            create: {
              organizationId: org.id,
              quantity: 30,
              reorderLevel: 3,
            },
          },
        },
      }),
    ]);
    console.log('✅ Created 4 products\n');

    // 6. Create Sales Invoices (skip if already exist)
    const existingInvoices = await prisma.invoice.findMany({
      where: { organizationId: org.id },
    });

    let invoices = [];
    if (existingInvoices.length === 0) {
      invoices = await Promise.all([
      prisma.invoice.create({
        data: {
          organizationId: org.id,
          customerId: customers[0].id,
          userId: user.id,
          invoiceNumber: 'INV-001',
          invoiceDate: new Date('2025-10-15'),
          dueDate: new Date('2025-11-15'),
          status: 'PAID',
          subtotal: 180000,
          taxAmount: 32400,
          totalAmount: 212400,
          items: {
            create: [
              {
                productId: products[0].id,
                description: 'Laptop Pro',
                quantity: 2,
                unit: 'Nos',
                rate: 85000,
                gstRate: 18,
                amount: 170000,
              },
              {
                productId: products[1].id,
                description: 'Wireless Mouse',
                quantity: 5,
                unit: 'Nos',
                rate: 1500,
                gstRate: 18,
                amount: 7500,
              },
            ],
          },
        },
      }),
      prisma.invoice.create({
        data: {
          organizationId: org.id,
          customerId: customers[1].id,
          userId: user.id,
          invoiceNumber: 'INV-002',
          invoiceDate: new Date('2025-10-18'),
          dueDate: new Date('2025-11-18'),
          status: 'SENT',
          subtotal: 75000,
          taxAmount: 13500,
          totalAmount: 88500,
          items: {
            create: [
              {
                productId: products[2].id,
                description: 'USB-C Cable',
                quantity: 100,
                unit: 'Nos',
                rate: 500,
                gstRate: 18,
                amount: 50000,
              },
              {
                productId: products[3].id,
                description: 'Monitor 27 inch',
                quantity: 1,
                unit: 'Nos',
                rate: 25000,
                gstRate: 18,
                amount: 25000,
              },
            ],
          },
        },
      }),
      prisma.invoice.create({
        data: {
          organizationId: org.id,
          customerId: customers[2].id,
          userId: user.id,
          invoiceNumber: 'INV-003',
          invoiceDate: new Date('2025-10-20'),
          dueDate: new Date('2025-11-20'),
          status: 'SENT',
          subtotal: 85000,
          taxAmount: 15300,
          totalAmount: 100300,
          items: {
            create: [
              {
                productId: products[0].id,
                description: 'Laptop Pro',
                quantity: 1,
                unit: 'Nos',
                rate: 85000,
                gstRate: 18,
                amount: 85000,
              },
            ],
          },
        },
      }),
      ]);
      console.log('✅ Created 3 sales invoices\n');
    } else {
      invoices = existingInvoices;
      console.log('✅ Invoices already exist\n');
    }

    // 7. Create Payments
    await Promise.all([
      prisma.payment.create({
        data: {
          organizationId: org.id,
          invoiceId: invoices[0].id,
          amount: 200000,
          paymentDate: new Date('2025-10-20'),
          paymentMode: 'BANK_TRANSFER',
          referenceNo: 'TXN-001',
          status: 'COMPLETED',
        },
      }),
      prisma.payment.create({
        data: {
          organizationId: org.id,
          invoiceId: invoices[1].id,
          amount: 75000,
          paymentDate: new Date('2025-10-21'),
          paymentMode: 'CHEQUE',
          referenceNo: 'CHQ-001',
          status: 'PENDING',
        },
      }),
    ]);
    console.log('✅ Created 2 payments\n');

    console.log('🎉 Demo data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Organization: Demo Company Ltd');
    console.log('   - User: demo@company.com (Password: demo123)');
    console.log('   - Customers: 4');
    console.log('   - Products: 4');
    console.log('   - Invoices: 3');
    console.log('   - Payments: 2');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoData();

