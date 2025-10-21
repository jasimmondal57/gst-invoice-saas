const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPhase1() {
  console.log('🧪 Testing Phase 1 Implementation...\n');

  try {
    // Get organization
    const org = await prisma.organization.findFirst();
    if (!org) {
      console.error('❌ No organization found. Please create one first.');
      process.exit(1);
    }
    console.log(`✅ Using organization: ${org.name}`);

    // Test 1: Create Product with Inventory
    console.log('\n📦 Test 1: Creating product with inventory...');
    const product = await prisma.product.create({
      data: {
        organizationId: org.id,
        name: 'Test Product - Laptop',
        description: 'High-performance laptop',
        hsn: '8471.30',
        unit: 'Nos',
        price: 50000,
        gstRate: 18,
        barcode: 'PROD-001',
        lowStockAlert: 5,
        inventory: {
          create: {
            organizationId: org.id,
            quantity: 10,
            reorderLevel: 5,
            reorderQuantity: 20
          }
        }
      },
      include: { inventory: true }
    });
    console.log(`✅ Product created: ${product.name} (ID: ${product.id})`);
    console.log(`   Stock: ${product.inventory?.quantity} units`);

    // Test 2: Log Stock Movement
    console.log('\n📊 Test 2: Logging stock movement...');
    const movement = await prisma.stockMovement.create({
      data: {
        organizationId: org.id,
        productId: product.id,
        type: 'OPENING_STOCK',
        quantity: 10,
        notes: 'Initial stock'
      }
    });
    console.log(`✅ Stock movement logged: ${movement.type} - ${movement.quantity} units`);

    // Test 3: Update Stock
    console.log('\n📈 Test 3: Updating stock (ADD 5 units)...');
    const updatedInventory = await prisma.inventory.update({
      where: { productId: product.id },
      data: { quantity: 15 }
    });
    console.log(`✅ Stock updated: ${updatedInventory.quantity} units`);

    // Test 4: Log Sale Movement
    console.log('\n📉 Test 4: Logging sale movement...');
    const saleMovement = await prisma.stockMovement.create({
      data: {
        organizationId: org.id,
        productId: product.id,
        type: 'SALE',
        quantity: 3,
        reference: 'INV-001',
        notes: 'Sold to customer'
      }
    });
    console.log(`✅ Sale logged: ${saleMovement.quantity} units`);

    // Test 5: Create Payment
    console.log('\n💳 Test 5: Creating payment...');
    const customer = await prisma.customer.findFirst({
      where: { organizationId: org.id }
    });

    if (!customer) {
      console.log('⚠️  No customer found. Skipping payment test.');
    } else {
      const payment = await prisma.payment.create({
        data: {
          organizationId: org.id,
          customerId: customer.id,
          amount: 50000,
          paymentDate: new Date(),
          paymentMode: 'BANK_TRANSFER',
          referenceNo: 'TXN-12345',
          notes: 'Payment for invoice INV-001',
          status: 'COMPLETED'
        }
      });
      console.log(`✅ Payment created: ₹${payment.amount} (${payment.paymentMode})`);
      console.log(`   Reference: ${payment.referenceNo}`);
    }

    // Test 6: Get Stock Movement History
    console.log('\n📋 Test 6: Retrieving stock movement history...');
    const movements = await prisma.stockMovement.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Found ${movements.length} stock movements:`);
    movements.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.type}: ${m.quantity} units (${m.notes})`);
    });

    // Test 7: Get Payment Summary
    console.log('\n💰 Test 7: Retrieving payment summary...');
    const payments = await prisma.payment.findMany({
      where: { organizationId: org.id }
    });
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    console.log(`✅ Total payments: ${payments.length}`);
    console.log(`   Total amount: ₹${totalAmount}`);
    console.log(`   By status:`);
    const byStatus = {};
    payments.forEach(p => {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    });
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`     - ${status}: ${count}`);
    });

    // Test 8: Check Low Stock Alert
    console.log('\n⚠️  Test 8: Checking low stock alert...');
    const inventory = await prisma.inventory.findUnique({
      where: { productId: product.id },
      include: { product: true }
    });
    if (inventory && inventory.quantity <= inventory.product.lowStockAlert) {
      console.log(`✅ Low stock alert triggered: ${inventory.quantity} <= ${inventory.product.lowStockAlert}`);
    } else {
      console.log(`✅ Stock is above alert level: ${inventory?.quantity} > ${inventory?.product.lowStockAlert}`);
    }

    console.log('\n✅ All Phase 1 tests completed successfully!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testPhase1();

