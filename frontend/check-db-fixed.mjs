import prisma from './lib/prisma.ts';

async function main() {
  try {
    console.log('Checking Prisma database...\n');

    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        status: true,
      }
    });

    console.log(`Total users in Prisma database: ${users.length}\n`);

    if (users.length > 0) {
      console.log('Users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.name} (${user.role}) - Status: ${user.status}`);
      });
    } else {
      console.log('⚠️  No users found in the Prisma database!');
      console.log('This is likely why login is failing.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
