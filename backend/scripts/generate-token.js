const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    // Get the first user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.error('No user found in database');
      process.exit(1);
    }

    console.log('User found:', user.email);

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('\n✅ Token generated:');
    console.log(token);
    
    console.log('\n📋 Use this token in API calls:');
    console.log(`Authorization: Bearer ${token}`);

    // Get organization
    const organization = await prisma.organization.findFirst();
    if (organization) {
      console.log('\n📊 Organization ID:');
      console.log(organization.id);
      
      console.log('\n🧪 Test API call:');
      console.log(`curl -X GET "http://localhost:5000/api/v1/invoices?organizationId=${organization.id}" \\`);
      console.log(`  -H "Authorization: Bearer ${token}"`);
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

