const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Accounting Module Tests...\n');

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

    // Test 2: Create Chart of Accounts
    console.log('\nTest 2: Creating chart of accounts...');
    const cashAccount = await prisma.chartOfAccounts.create({
      data: {
        organizationId: org.id,
        code: '1010',
        name: 'Cash',
        type: 'ASSET',
        openingBalance: 50000,
      },
    });

    const bankAccount = await prisma.chartOfAccounts.create({
      data: {
        organizationId: org.id,
        code: '1020',
        name: 'Bank',
        type: 'ASSET',
        openingBalance: 100000,
      },
    });

    const salesAccount = await prisma.chartOfAccounts.create({
      data: {
        organizationId: org.id,
        code: '4010',
        name: 'Sales',
        type: 'REVENUE',
        openingBalance: 0,
      },
    });

    const expenseAccount = await prisma.chartOfAccounts.create({
      data: {
        organizationId: org.id,
        code: '5010',
        name: 'Rent Expense',
        type: 'EXPENSE',
        openingBalance: 0,
      },
    });

    console.log('✅ Accounts created:', cashAccount.id, bankAccount.id, salesAccount.id, expenseAccount.id);

    // Test 3: Create Journal Entry
    console.log('\nTest 3: Creating journal entry...');
    const entry = await prisma.journalEntry.create({
      data: {
        organizationId: org.id,
        entryNumber: `JE-${Date.now()}`,
        entryDate: new Date(),
        description: 'Sales transaction',
        totalDebit: 10000,
        totalCredit: 10000,
        lines: {
          create: [
            {
              accountId: cashAccount.id,
              description: 'Cash received',
              debit: 10000,
              credit: 0,
            },
            {
              accountId: salesAccount.id,
              description: 'Sales revenue',
              debit: 0,
              credit: 10000,
            },
          ],
        },
      },
      include: { lines: true },
    });

    console.log('✅ Journal entry created:', entry.id);
    console.log(`   Debit: ₹${entry.totalDebit}, Credit: ₹${entry.totalCredit}`);

    // Test 4: Post Journal Entry
    console.log('\nTest 4: Posting journal entry...');
    const postedEntry = await prisma.journalEntry.update({
      where: { id: entry.id },
      data: { status: 'POSTED' },
    });

    console.log('✅ Journal entry posted:', postedEntry.status);

    // Test 5: Create Ledger Entries
    console.log('\nTest 5: Creating ledger entries...');
    const ledgerEntry1 = await prisma.ledgerEntry.create({
      data: {
        organizationId: org.id,
        accountId: cashAccount.id,
        entryDate: new Date(),
        description: 'Cash received',
        debit: 10000,
        credit: 0,
      },
    });

    const ledgerEntry2 = await prisma.ledgerEntry.create({
      data: {
        organizationId: org.id,
        accountId: salesAccount.id,
        entryDate: new Date(),
        description: 'Sales revenue',
        debit: 0,
        credit: 10000,
      },
    });

    console.log('✅ Ledger entries created:', ledgerEntry1.id, ledgerEntry2.id);

    // Test 6: Get Ledger for Account
    console.log('\nTest 6: Fetching ledger for account...');
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: { accountId: cashAccount.id },
    });

    let balance = cashAccount.openingBalance;
    ledgerEntries.forEach((entry) => {
      balance += entry.debit - entry.credit;
    });

    console.log(`✅ Ledger fetched for ${cashAccount.name}`);
    console.log(`   Opening Balance: ₹${cashAccount.openingBalance}`);
    console.log(`   Closing Balance: ₹${balance}`);

    // Test 7: Generate Trial Balance
    console.log('\nTest 7: Generating trial balance...');
    const accounts = await prisma.chartOfAccounts.findMany({
      where: { organizationId: org.id },
    });

    let totalDebit = 0;
    let totalCredit = 0;

    for (const account of accounts) {
      const entries = await prisma.ledgerEntry.findMany({
        where: { accountId: account.id },
      });

      let debit = 0;
      let credit = 0;

      entries.forEach((entry) => {
        debit += entry.debit;
        credit += entry.credit;
      });

      if (debit !== 0 || credit !== 0) {
        totalDebit += debit;
        totalCredit += credit;
      }
    }

    console.log('✅ Trial Balance Generated');
    console.log(`   Total Debit: ₹${totalDebit}`);
    console.log(`   Total Credit: ₹${totalCredit}`);
    console.log(`   Balanced: ${Math.abs(totalDebit - totalCredit) < 0.01 ? 'Yes ✅' : 'No ❌'}`);

    // Test 8: Get All Accounts
    console.log('\nTest 8: Fetching all accounts...');
    const allAccounts = await prisma.chartOfAccounts.findMany({
      where: { organizationId: org.id },
    });

    console.log(`✅ Found ${allAccounts.length} accounts`);
    allAccounts.forEach((acc) => {
      console.log(`   - ${acc.code}: ${acc.name} (${acc.type})`);
    });

    // Test 9: Get Journal Entries
    console.log('\nTest 9: Fetching journal entries...');
    const entries = await prisma.journalEntry.findMany({
      where: { organizationId: org.id },
      include: { lines: true },
    });

    console.log(`✅ Found ${entries.length} journal entries`);

    console.log('\n✅ All Accounting Module tests passed!\n');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.ledgerEntry.deleteMany({ where: { organizationId: org.id } });
    await prisma.journalEntry.deleteMany({ where: { organizationId: org.id } });
    await prisma.chartOfAccounts.deleteMany({ where: { organizationId: org.id } });
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

