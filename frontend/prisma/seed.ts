import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';

// Use correct database path
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = [
    {
      email: 'admin@university.edu',
      password: 'admin123',
      name: 'Admin User',
      role: 'ADMIN',
    },
    {
      email: 'finance@university.edu',
      password: 'finance123',
      name: 'Finance Officer',
      role: 'FINANCE',
    },
    {
      email: 'student@university.edu',
      password: 'student123',
      name: 'Test Student',
      role: 'STUDENT',
      studentId: 'STU-2024-001',
    },
  ];

  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        password: hashed,
        name: user.name,
        role: user.role,
        studentId: user.studentId,
        status: 'active',
      },
    });
    console.log(`Seeded user: ${user.email}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
