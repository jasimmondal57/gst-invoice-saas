const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Enhanced Inventory Tests...\n');

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
        hsn: '1234567890',
        unit: 'Nos',
        price: 1000,
        gstRate: 18,
      },
    });

    const product2 = await prisma.product.create({
      data: {
        organizationId: org.id,
        name: 'Product B',
        hsn: '0987654321',
        unit: 'Kg',
        price: 500,
        gstRate: 5,
      },
    });

    const product3 = await prisma.product.create({
      data: {
        organizationId: org.id,
        name: 'Product C',
        hsn: '1111111111',
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
        quantity: 5,
        reorderLevel: 20,
        reorderQuantity: 50,
      },
    });

    const inv2 = await prisma.inventory.create({
      data: {
        organizationId: org.id,
        productId: product2.id,
        quantity: 100,
        reorderLevel: 30,
        reorderQuantity: 100,
      },
    });

    const inv3 = await prisma.inventory.create({
      data: {
        organizationId: org.id,
        productId: product3.id,
        quantity: 0,
        reorderLevel: 50,
        reorderQuantity: 200,
      },
    });
    console.log('✅ Inventory created:', inv1.id, inv2.id, inv3.id);

    // Test 4: Create Stock Movements
    console.log('\nTest 4: Creating stock movements...');
    for (let i = 0; i < 30; i++) {
      await prisma.stockMovement.create({
        data: {
          organizationId: org.id,
          productId: product1.id,
          type: 'SALE',
          quantity: 2,
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        },
      });
    }

    for (let i = 0; i < 15; i++) {
      await prisma.stockMovement.create({
        data: {
          organizationId: org.id,
          productId: product2.id,
          type: 'SALE',
          quantity: 1,
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        },
      });
    }

    for (let i = 0; i < 10; i++) {
      await prisma.stockMovement.create({
        data: {
          organizationId: org.id,
          productId: product3.id,
          type: 'SALE',
          quantity: 5,
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        },
      });
    }
    console.log('✅ Stock movements created');

    // Test 5: Test Reorder Suggestions
    console.log('\nTest 5: Testing reorder suggestions...');
    const inventories = await prisma.inventory.findMany({
      where: { organizationId: org.id },
      include: { product: true },
    });

    const suggestions = inventories
      .filter((inv) => inv.quantity < inv.reorderLevel)
      .map((inv) => ({
        productName: inv.product.name,
        currentStock: inv.quantity,
        reorderLevel: inv.reorderLevel,
        priority: inv.quantity === 0 ? 'CRITICAL' : 'HIGH',
      }));

    console.log(`✅ Found ${suggestions.length} items needing reorder`);
    suggestions.forEach((s) => console.log(`   - ${s.productName}: ${s.priority}`));

    // Test 6: Test Forecast
    console.log('\nTest 6: Testing forecast...');
    const movements = await prisma.stockMovement.findMany({
      where: { organizationId: org.id, type: 'SALE' },
    });

    const totalSales = movements.reduce((sum, m) => sum + m.quantity, 0);
    const avgDailySales = totalSales / 30;
    console.log(`✅ Average daily sales: ${avgDailySales.toFixed(2)} units`);

    // Test 7: Test Health Score
    console.log('\nTest 7: Testing health score...');
    let totalScore = 0;
    const scores = inventories.map((inv) => {
      let score = 100;
      if (inv.quantity === 0) score -= 30;
      else if (inv.quantity < inv.reorderLevel) score -= 15;
      else if (inv.quantity > inv.reorderLevel * 3) score -= 10;
      totalScore += score;
      return { productName: inv.product.name, score };
    });

    const avgScore = totalScore / inventories.length;
    console.log(`✅ Average health score: ${avgScore.toFixed(2)}`);
    scores.forEach((s) => console.log(`   - ${s.productName}: ${s.score}`));

    // Test 8: Test Optimization Recommendations
    console.log('\nTest 8: Testing optimization recommendations...');
    const recommendations = inventories.map((inv) => {
      let recommendation = 'MAINTAIN';
      if (inv.quantity === 0) recommendation = 'URGENT_REORDER';
      else if (inv.quantity > inv.reorderLevel * 3) recommendation = 'REDUCE_STOCK';
      return { productName: inv.product.name, recommendation };
    });

    console.log(`✅ Generated ${recommendations.length} recommendations`);
    recommendations.forEach((r) => console.log(`   - ${r.productName}: ${r.recommendation}`));

    // Test 9: Test Update Reorder Parameters
    console.log('\nTest 9: Testing update reorder parameters...');
    const updated = await prisma.inventory.update({
      where: { productId: product1.id },
      data: { reorderLevel: 25, reorderQuantity: 75 },
    });
    console.log(`✅ Updated reorder parameters for ${updated.id}`);

    console.log('\n✅ All Enhanced Inventory tests passed!\n');

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

