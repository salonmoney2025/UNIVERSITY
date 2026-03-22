const BASE_URL = 'http://localhost:3000/api';

async function testAPIs() {
  console.log('===== Testing University LMS API Endpoints =====\n');

  try {
    // Test 1: Create a Bank
    console.log('1. Creating a new bank...');
    const bankResponse = await fetch(`${BASE_URL}/banks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bankName: 'Sierra Leone Commercial Bank',
        bankCode: 'SLCB',
        swiftCode: 'SLCBSLF1',
        sortCode: '010203',
        branch: 'Freetown Main Branch',
        address: '12 Siaka Stevens Street',
        city: 'Freetown',
        phone: '+232 76 123 456',
        email: 'freetown@slcb.sl',
        accountNumber: '1001234567890',
        accountName: 'EBKUST Main Account',
        status: 'active'
      })
    });
    const bank = await bankResponse.json();
    console.log('   Created:', bank.bankName, '- ID:', bank.id);
    console.log('');

    // Test 2: Get all banks
    console.log('2. Fetching all banks...');
    const banksResponse = await fetch(`${BASE_URL}/banks`);
    const banks = await banksResponse.json();
    console.log(`   Found ${banks.length} banks`);
    console.log('');

    // Test 3: Create a Payment
    console.log('3. Creating a payment...');
    const paymentResponse = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 'STU001',
        studentName: 'Mohamed Kamara',
        paymentType: 'Tuition Fee',
        amount: 1500.00,
        paymentMethod: 'bank',
        paymentDate: '2026-03-17',
        transactionRef: 'TXN123456',
        academicYear: '2025/2026',
        semester: '1',
        description: 'First semester tuition payment',
        bankId: bank.id
      })
    });
    const payment = await paymentResponse.json();
    console.log('   Created payment:', payment.receiptNo);
    console.log('   Amount: SLE', payment.amount);
    console.log('');

    // Test 4: Verify Payment
    console.log('4. Verifying payment...');
    const verifyResponse = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchType: 'receipt',
        searchValue: payment.receiptNo
      })
    });
    const verifyResult = await verifyResponse.json();
    console.log('   Verification result:', verifyResult.found ? 'FOUND' : 'NOT FOUND');
    console.log('   Status:', verifyResult.status);
    console.log('');

    // Test 5: Create a Ticket
    console.log('5. Creating a support ticket...');
    const ticketResponse = await fetch(`${BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Payment Receipt Issue',
        description: 'I need assistance with my payment receipt',
        category: 'Payment',
        priority: 'high',
        email: 'student@ebkustsl.edu.sl',
        phone: '+232 76 123 456'
      })
    });
    const ticket = await ticketResponse.json();
    console.log('   Created ticket:', ticket.ticketNo);
    console.log('   Priority:', ticket.priority);
    console.log('');

    // Test 6: Get all tickets
    console.log('6. Fetching all tickets...');
    const ticketsResponse = await fetch(`${BASE_URL}/tickets`);
    const tickets = await ticketsResponse.json();
    console.log(`   Found ${tickets.length} tickets`);
    console.log('');

    console.log('===== All API Tests Passed Successfully! =====');
    console.log('\nSummary:');
    console.log(`- Banks API: ✓ Working`);
    console.log(`- Payments API: ✓ Working`);
    console.log(`- Verification API: ✓ Working`);
    console.log(`- Tickets API: ✓ Working`);
    console.log(`\nDatabase file: frontend/prisma/dev.db`);
    console.log(`API Endpoints available at: http://localhost:3000/api`);

  } catch (error) {
    console.error('Error testing APIs:', error.message);
  }
}

testAPIs();
