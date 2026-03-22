import prisma from './lib/prisma.ts';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
      return false;
    }
    console.log(`✓ User found: ${user.name}`);

    // Step 2: Check if active
    console.log('Step 2: Checking user status...');
    if (user.status !== 'active') {
      console.log(`✗ User is ${user.status}, not active`);
      return false;
    }
    console.log('✓ User is active');

    // Step 3: Verify password
    console.log('Step 3: Verifying password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('✗ Invalid password');
      return false;
    }
    console.log('✓ Password is valid');

    // Step 4: Generate token
    console.log('Step 4: Generating token...');
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    }, JWT_SECRET, { expiresIn: '7d' });
    console.log('✓ Token generated successfully');

    console.log('\n✅ LOGIN SUCCESSFUL!');
    console.log(`   User: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    return true;

  } catch (error) {
    console.error('\n❌ LOGIN FAILED:', error.message);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('Testing Login Functionality');
  console.log('========================================\n');

  const results = {
    passed: 0,
    failed: 0
  };

  // Test valid credentials
  if (await testLogin('admin@university.edu', 'admin123')) results.passed++;
  else results.failed++;

  if (await testLogin('finance@university.edu', 'finance123')) results.passed++;
  else results.failed++;

  if (await testLogin('student@university.edu', 'student123')) results.passed++;
  else results.failed++;

  // Test invalid credentials
  console.log('\n=== Testing invalid credentials ===');
  if (!await testLogin('admin@university.edu', 'wrongpassword')) {
    console.log('✓ Correctly rejected wrong password');
    results.passed++;
  } else {
    console.log('✗ Should have rejected wrong password');
    results.failed++;
  }

  console.log('\n========================================');
  console.log(`Results: ${results.passed} passed, ${results.failed} failed`);
  console.log('========================================');

  await prisma.$disconnect();
}

main();
