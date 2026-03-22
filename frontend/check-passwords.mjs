import prisma from './lib/prisma.ts';
import bcrypt from 'bcrypt';

async function main() {
  try {
    console.log('Checking user passwords...\n');

    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        password: true,
        role: true,
      }
    });

    const testPasswords = {
      'admin@university.edu': 'admin123',
      'finance@university.edu': 'finance123',
      'student@university.edu': 'student123'
    };

    for (const user of users) {
      console.log(`\nUser: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Password hash: ${user.password.substring(0, 20)}...`);

      const expectedPassword = testPasswords[user.email];
      if (expectedPassword) {
        try {
          const isValid = await bcrypt.compare(expectedPassword, user.password);
          console.log(`Password check (${expectedPassword}): ${isValid ? '✓ VALID' : '✗ INVALID'}`);
        } catch (error) {
          console.log(`Password check failed: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
