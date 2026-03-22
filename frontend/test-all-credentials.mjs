import prisma from './lib/prisma.ts';
import bcrypt from 'bcrypt';

async function testAllUsers() {
  console.log('=== Testing All User Credentials ===\n');

  const users = await prisma.user.findMany({
    select: {
      email: true,
      password: true,
      name: true,
      role: true,
      status: true,
    }
  });

  const testCredentials = {
    'admin@university.edu': 'admin123',
    'finance@university.edu': 'finance123',
    'student@university.edu': 'student123'
  };

  for (const user of users) {
    console.log(`\nUser: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Status: ${user.status}`);

    const expectedPassword = testCredentials[user.email];
    if (expectedPassword) {
      const isValid = await bcrypt.compare(expectedPassword, user.password);
      console.log(`Password (${expectedPassword}): ${isValid ? '✅ VALID' : '❌ INVALID'}`);

      if (!isValid) {
        console.log('⚠️  This user needs password reset!');
      }
    }
  }

  await prisma.$disconnect();
}

testAllUsers();
