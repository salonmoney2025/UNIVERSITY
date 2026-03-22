import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const superuserData = {
    email: 'superadmin@university.edu',
    password: 'Super@Admin123',
    name: 'Super Administrator',
    role: 'SUPER_ADMIN',
  };

  const hashed = await bcrypt.hash(superuserData.password, 10);

  const user = await prisma.user.upsert({
    where: { email: superuserData.email },
    update: {
      password: hashed,
      name: superuserData.name,
      role: superuserData.role,
      status: 'active',
    },
    create: {
      email: superuserData.email,
      password: hashed,
      name: superuserData.name,
      role: superuserData.role,
      status: 'active',
    },
  });

  console.log('✅ Superuser created/updated in frontend database');
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Role: ${user.role}`);
  console.log('');
  console.log('🔐 Login Credentials:');
  console.log('   Email: superadmin@university.edu');
  console.log('   Password: Super@Admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
