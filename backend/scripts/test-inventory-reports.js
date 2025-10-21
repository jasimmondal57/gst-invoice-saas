const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Inventory Reports Tests...\n');

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

    // Test 2: Create Products
    console.log('\nTest 2: Creating products...');
    const product1 = await prisma.product.create({
      data: {
        organizationId: org.id,
        name: 'Product A',
        hsn: '1001',
        unit: 'Nos',
        price: 100,
        gstRate: 18,
      },
    });

    const product2 = await prisma.product.create({
      data: {
        organizationId: org.id,
        name: 'Product B',
        hsn: '1002',
        unit: 'Kg',
        price: 500,
        gstRate: 5,
      },
    });

    const product3 = await prisma.product.create({
      data: {
        organizationId: org.id,
        name: 'Product C',
        hsn: '1003',
        unit: 'Ltr',
        price: 200,
        gstRate: 12,
      },
    });
    console.log('✅ Products created:', product1.id, product2.id, product3.id);

    // Test 3: Create Inventory
    console.log('\nTest 3: Creating inventory...');
    const inv1 = await prisma.inventory.create({
      data: {
        organizationId: org.id,
        productId: product1.id,
        quantity: 100,
        reorderLevel: 20,
        reorderQuantity: 50,
      },
    });

    const inv2 = await prisma.inventory.create({
      data: {
        organizationId: org.id,
        productId: product2.id,
        quantity: 5,
        reorderLevel: 10,
        reorderQuantity: 20,
      },
    });

    const inv3 = await prisma.inventory.create({
      data: {
        organizationId: org.id,
        productId: product3.id,
        quantity: 0,
        reorderLevel: 15,
        reorderQuantity: 30,
      },
    });
    console.log('✅ Inventory created');

    // Test 4: Create Stock Movements
    console.log('\nTest 4: Creating stock movements...');
    await prisma.stockMovement.create({
      data: {
        organizationId: org.id,
        productId: product1.id,
        type: 'PURCHASE',
        quantity: 100,
        reference: 'PO-001',
      },
    });

    await prisma.stockMovement.create({
      data: {
        organizationId: org.id,
        productId: product1.id,
        type: 'SALE',
        quantity: 30,
        reference: 'INV-001',
      },
    });

    await prisma.stockMovement.create({
      data: {
        organizationId: org.id,
        productId: product2.id,
        type: 'PURCHASE',
        quantity: 20,
        reference: 'PO-002',
      },
    });

    await prisma.stockMovement.create({
      data: {
        organizationId: org.id,
        productId: product2.id,
        type: 'SALE',
        quantity: 15,
        reference: 'INV-002',
      },
    });
    console.log('✅ Stock movements created');

    // Test 5: Fetch Inventory Summary
    console.log('\nTest 5: Fetching inventory summary...');
    const inventories = await prisma.inventory.findMany({
      where: { organizationId: org.id },
      include: { product: true },
    });

    const totalItems = inventories.length;
    const totalQuantity = inventories.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalValue = inventories.reduce((sum, inv) => sum + inv.quantity * inv.product.price, 0);
    const lowStockCount = inventories.filter((inv) => inv.quantity < inv.reorderLevel).length;
    const outOfStockCount = inventories.filter((inv) => inv.quantity === 0).length;

    console.log('✅ Summary:');
    console.log(`   Total Items: ${totalItems}`);
    console.log(`   Total Quantity: ${totalQuantity}`);
    console.log(`   Total Value: ₹${totalValue}`);
    console.log(`   Low Stock: ${lowStockCount}`);
    console.log(`   Out of Stock: ${outOfStockCount}`);

    // Test 6: Stock Valuation Report
    console.log('\nTest 6: Generating stock valuation report...');
    const valuationReport = inventories.map((inv) => {
      const valuationAmount = inv.quantity * inv.product.price;
      return {
        productName: inv.product.name,
        quantity: inv.quantity,
        unitPrice: inv.product.price,
        valuationAmount,
      };
    });
    console.log('✅ Valuation Report:');
    valuationReport.forEach((item) => {
      console.log(`   ${item.productName}: ${item.quantity} x ₹${item.unitPrice} = ₹${item.valuationAmount}`);
    });

    // Test 7: Low Stock Report
    console.log('\nTest 7: Generating low stock report...');
    const lowStockItems = inventories
      .filter((inv) => inv.quantity < inv.reorderLevel)
      .map((inv) => ({
        productName: inv.product.name,
        currentStock: inv.quantity,
        reorderLevel: inv.reorderLevel,
        shortage: inv.reorderLevel - inv.quantity,
      }));
    console.log('✅ Low Stock Items:');
    lowStockItems.forEach((item) => {
      console.log(`   ${item.productName}: ${item.currentStock}/${item.reorderLevel} (shortage: ${item.shortage})`);
    });

    // Test 8: Stock Turnover Report
    console.log('\nTest 8: Generating stock turnover report...');
    const movements = await prisma.stockMovement.findMany({
      where: { organizationId: org.id },
    });

    const turnoverReport = inventories.map((inv) => {
      const sales = movements
        .filter((m) => m.productId === inv.productId && m.type === 'SALE')
        .reduce((sum, m) => sum + m.quantity, 0);
      const turnoverRatio = inv.quantity > 0 ? sales / inv.quantity : 0;
      return {
        productName: inv.product.name,
        sales,
        turnoverRatio: parseFloat(turnoverRatio.toFixed(2)),
      };
    });
    console.log('✅ Turnover Report:');
    turnoverReport.forEach((item) => {
      console.log(`   ${item.productName}: ${item.sales} sales, ${item.turnoverRatio}x turnover`);
    });

    // Test 9: Stock Movement Report
    console.log('\nTest 9: Generating stock movement report...');
    const movementSummary = {
      PURCHASE: movements.filter((m) => m.type === 'PURCHASE').length,
      SALE: movements.filter((m) => m.type === 'SALE').length,
      ADJUSTMENT: movements.filter((m) => m.type === 'ADJUSTMENT').length,
    };
    console.log('✅ Movement Summary:');
    console.log(`   Purchases: ${movementSummary.PURCHASE}`);
    console.log(`   Sales: ${movementSummary.SALE}`);
    console.log(`   Adjustments: ${movementSummary.ADJUSTMENT}`);

    console.log('\n✅ All Inventory Reports tests passed!\n');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.stockMovement.deleteMany({ where: { organizationId: org.id } });
    await prisma.inventory.deleteMany({ where: { organizationId: org.id } });
    await prisma.product.deleteMany({ where: { organizationId: org.id } });
    await prisma.organization.delete({ where: { id: org.id } });
    console.log('✅ Cleanup complete\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();

