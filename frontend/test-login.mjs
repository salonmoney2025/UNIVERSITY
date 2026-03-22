import prisma from './lib/prisma.ts';
import { verifyPassword, generateToken } from './lib/auth.ts';

async function testLogin(email, password) {
  console.log(`\n=== Testing login for: ${email} ===`);

  try {
    // Step 1: Find user
    console.log('Step 1: Finding user...');
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log('✗ User not found');
      return;
    }
    console.log(`✓ User found: ${user.name}`);

    // Step 2: Check if active
    console.log('Step 2: Checking user status...');
    if (user.status !== 'active') {
      console.log(`✗ User is ${user.status}, not active`);
      return;
    }
    console.log('✓ User is active');

    // Step 3: Verify password
    console.log('Step 3: Verifying password...');
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      console.log('✗ Invalid password');
      return;
    }
    console.log('✓ Password is valid');

    // Step 4: Generate token
    console.log('Step 4: Generating token...');
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    console.log('✓ Token generated successfully');

    console.log('\n✅ LOGIN WOULD SUCCEED!');
    console.log(`Token (first 50 chars): ${token.substring(0, 50)}...`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  }
}

async function main() {
  console.log('Testing Login Endpoint Logic\n');

  await testLogin('admin@university.edu', 'admin123');
  await testLogin('finance@university.edu', 'finance123');
  await testLogin('student@university.edu', 'student123');

  // Test with wrong password
  await testLogin('admin@university.edu', 'wrongpassword');

  await prisma.$disconnect();
}

main();
