import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/payments/verify - Verify a payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchType, searchValue } = body;

    let payment = null;

    switch (searchType) {
      case 'receipt':
        payment = await prisma.payment.findUnique({
          where: { receiptNo: searchValue },
          include: { bank: true },
        });
        break;

      case 'transaction':
        payment = await prisma.payment.findFirst({
          where: { transactionRef: searchValue },
          include: { bank: true },
        });
        break;

      case 'student':
        payment = await prisma.payment.findFirst({
          where: { studentId: searchValue },
          include: { bank: true },
          orderBy: { paymentDate: 'desc' },
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid search type' },
          { status: 400 }
        );
    }

    if (!payment) {
      return NextResponse.json({
        found: false,
        message: `${searchType === 'receipt' ? 'Receipt' : searchType === 'transaction' ? 'Transaction' : 'Student payment'} not found in our records`,
      });
    }

    // Update verification status if not already verified
    if (payment.status === 'pending' || !payment.verifiedDate) {
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          verifiedBy: 'System',
          verifiedDate: new Date(),
        },
        include: { bank: true },
      });
    }

    return NextResponse.json({
      found: true,
      ...payment,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
