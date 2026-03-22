import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';

// Use correct database path
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Adding Super Admins to frontend database...\n');

  const superAdmins = [
    {
      email: 'superadmin1@university.edu',
      password: '12345',
      name: 'Super Admin 1',
      role: 'SUPER_ADMIN',
    },
    {
      email: 'superadmin2@university.edu',
      password: '12345',
      name: 'Super Admin 2',
      role: 'SUPER_ADMIN',
    },
  ];

  for (const admin of superAdmins) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);

    try {
      await prisma.user.upsert({
        where: { email: admin.email },
        update: {
          password: hashedPassword,
          name: admin.name,
          role: admin.role,
          status: 'active',
        },
        create: {
          email: admin.email,
          password: hashedPassword,
          name: admin.name,
          role: admin.role,
          status: 'active',
        },
      });

      console.log(`✓ ${admin.role}: ${admin.email} (password: ${admin.password})`);
    } catch (error) {
      console.error(`Error creating ${admin.email}:`, error);
    }
  }

  console.log('\nSuper Admins added successfully!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
