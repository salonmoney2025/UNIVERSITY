#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "===== Testing University LMS API Endpoints ====="
echo ""

# Test 1: Create a Bank
echo "1. Creating a new bank..."
BANK_RESPONSE=$(curl -s -X POST "$BASE_URL/banks" \
  -H "Content-Type: application/json" \
  -d '{
    "bankName": "Test Commercial Bank",
    "bankCode": "TCB001",
    "swiftCode": "TCBSL001",
    "sortCode": "123456",
    "branch": "Freetown Main Branch",
    "address": "123 Test Street",
    "city": "Freetown",
    "phone": "+232 76 000 000",
    "email": "test@tcb.sl",
    "accountNumber": "1234567890",
    "accountName": "University Test Account",
    "status": "active"
  }')

BANK_ID=$(echo $BANK_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Created bank with ID: $BANK_ID"
echo ""

# Test 2: Get all banks
echo "2. Fetching all banks..."
curl -s "$BASE_URL/banks" | head -c 200
echo "..."
echo ""

# Test 3: Get single bank
echo "3. Fetching single bank..."
if [ ! -z "$BANK_ID" ]; then
  curl -s "$BASE_URL/banks/$BANK_ID" | head -c 200
  echo "..."
fi
echo ""

# Test 4: Create a payment
echo "4. Creating a payment..."
PAYMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STU001",
    "studentName": "John Doe",
    "paymentType": "Tuition Fee",
    "amount": 1500.00,
    "paymentMethod": "bank",
    "paymentDate": "2026-03-17",
    "transactionRef": "TXN123456",
    "academicYear": "2025/2026",
    "semester": "1",
    "description": "First semester tuition payment",
    "bankId": "'$BANK_ID'"
  }')

RECEIPT_NO=$(echo $PAYMENT_RESPONSE | grep -o '"receiptNo":"[^"]*"' | cut -d'"' -f4)
echo "Created payment with receipt: $RECEIPT_NO"
echo ""

# Test 5: Get all payments
echo "5. Fetching all payments..."
curl -s "$BASE_URL/payments" | head -c 200
echo "..."
echo ""

# Test 6: Verify payment
echo "6. Verifying payment by receipt..."
curl -s -X POST "$BASE_URL/payments/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "searchType": "receipt",
    "searchValue": "'$RECEIPT_NO'"
  }' | head -c 200
echo "..."
echo ""

# Test 7: Create a ticket
echo "7. Creating a support ticket..."
TICKET_RESPONSE=$(curl -s -X POST "$BASE_URL/tickets" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Ticket",
    "description": "This is a test ticket",
    "category": "Technical",
    "priority": "medium",
    "email": "test@example.com",
    "phone": "+232 76 000 000"
  }')

TICKET_NO=$(echo $TICKET_RESPONSE | grep -o '"ticketNo":"[^"]*"' | cut -d'"' -f4)
echo "Created ticket: $TICKET_NO"
echo ""

# Test 8: Get all tickets
echo "8. Fetching all tickets..."
curl -s "$BASE_URL/tickets" | head -c 200
echo "..."
echo ""

echo "===== API Testing Complete ====="
echo "Summary:"
echo "- Bank ID: $BANK_ID"
echo "- Receipt No: $RECEIPT_NO"
echo "- Ticket No: $TICKET_NO"
