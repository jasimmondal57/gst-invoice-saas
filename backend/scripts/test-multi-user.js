const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Multi-User Management Tests...\n');

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

    // Test 2: Create Users
    console.log('\nTest 2: Creating users...');
    const user1 = await prisma.user.create({
      data: {
        email: `owner-${Date.now()}@example.com`,
        password: 'hashed_password',
        firstName: 'Owner',
        lastName: 'User',
        role: 'OWNER',
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: `admin-${Date.now()}@example.com`,
        password: 'hashed_password',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    });

    const user3 = await prisma.user.create({
      data: {
        email: `accountant-${Date.now()}@example.com`,
        password: 'hashed_password',
        firstName: 'Accountant',
        lastName: 'User',
        role: 'ACCOUNTANT',
      },
    });

    console.log('✅ Users created:', user1.id, user2.id, user3.id);

    // Test 3: Add users to organization
    console.log('\nTest 3: Adding users to organization...');
    await prisma.organizationMember.create({
      data: { organizationId: org.id, userId: user1.id },
    });

    await prisma.organizationMember.create({
      data: { organizationId: org.id, userId: user2.id },
    });

    await prisma.organizationMember.create({
      data: { organizationId: org.id, userId: user3.id },
    });

    console.log('✅ Users added to organization');

    // Test 4: Create custom roles
    console.log('\nTest 4: Creating custom roles...');
    const role1 = await prisma.customRole.create({
      data: {
        organizationId: org.id,
        name: 'Finance Manager',
        description: 'Manages financial operations',
        permissions: JSON.stringify(['VIEW_INVOICES', 'CREATE_INVOICES', 'VIEW_REPORTS']),
      },
    });

    const role2 = await prisma.customRole.create({
      data: {
        organizationId: org.id,
        name: 'Sales Executive',
        description: 'Manages sales operations',
        permissions: JSON.stringify(['VIEW_INVOICES', 'CREATE_INVOICES', 'VIEW_CUSTOMERS']),
      },
    });

    console.log('✅ Custom roles created:', role1.id, role2.id);

    // Test 5: Create audit trail entries
    console.log('\nTest 5: Creating audit trail entries...');
    const audit1 = await prisma.auditTrail.create({
      data: {
        organizationId: org.id,
        userId: user1.id,
        action: 'CREATE_INVOICE',
        entity: 'Invoice',
        entityId: 'inv-123',
        changes: JSON.stringify({ invoiceNumber: 'INV-001' }),
      },
    });

    const audit2 = await prisma.auditTrail.create({
      data: {
        organizationId: org.id,
        userId: user2.id,
        action: 'UPDATE_USER_ROLE',
        entity: 'User',
        entityId: user3.id,
        changes: JSON.stringify({ role: 'ACCOUNTANT' }),
      },
    });

    const audit3 = await prisma.auditTrail.create({
      data: {
        organizationId: org.id,
        userId: user1.id,
        action: 'DELETE_INVOICE',
        entity: 'Invoice',
        entityId: 'inv-124',
      },
    });

    console.log('✅ Audit trail entries created:', audit1.id, audit2.id, audit3.id);

    // Test 6: Get all users
    console.log('\nTest 6: Fetching all users...');
    const members = await prisma.organizationMember.findMany({
      where: { organizationId: org.id },
      include: { user: true },
    });

    console.log(`✅ Found ${members.length} users in organization`);
    members.forEach((member) => {
      console.log(`   - ${member.user.email} (${member.user.role})`);
    });

    // Test 7: Get all roles
    console.log('\nTest 7: Fetching all roles...');
    const allRoles = await prisma.customRole.findMany({
      where: { organizationId: org.id },
    });

    console.log(`✅ Found ${allRoles.length} custom roles`);
    allRoles.forEach((role) => {
      console.log(`   - ${role.name}: ${role.description}`);
    });

    // Test 8: Get audit trail
    console.log('\nTest 8: Fetching audit trail...');
    const trails = await prisma.auditTrail.findMany({
      where: { organizationId: org.id },
    });

    console.log(`✅ Found ${trails.length} audit trail entries`);
    trails.forEach((trail) => {
      console.log(`   - ${trail.action} on ${trail.entity} by user ${trail.userId}`);
    });

    // Test 9: Update user role
    console.log('\nTest 9: Updating user role...');
    const updated = await prisma.user.update({
      where: { id: user3.id },
      data: { role: 'MANAGER' },
    });

    console.log(`✅ User role updated to ${updated.role}`);

    console.log('\n✅ All Multi-User Management tests passed!\n');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.auditTrail.deleteMany({ where: { organizationId: org.id } });
    await prisma.customRole.deleteMany({ where: { organizationId: org.id } });
    await prisma.organizationMember.deleteMany({ where: { organizationId: org.id } });
    await prisma.organization.delete({ where: { id: org.id } });
    await prisma.user.delete({ where: { id: user1.id } });
    await prisma.user.delete({ where: { id: user2.id } });
    await prisma.user.delete({ where: { id: user3.id } });
    console.log('✅ Cleanup complete\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();

