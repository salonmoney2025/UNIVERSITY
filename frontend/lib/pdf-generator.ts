import jsPDF from 'jspdf';

interface PaymentData {
  receiptNo: string;
  studentId: string;
  studentName: string;
  paymentType: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionRef?: string;
  academicYear: string;
  semester: string;
  bankName?: string;
  status: string;
}

export const generateReceiptPDF = (payment: PaymentData) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('EBKUST UNIVERSITY', 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Ernest Bai Koroma University of Science and Technology', 105, 28, { align: 'center' });
  doc.text('Sierra Leone', 105, 35, { align: 'center' });

  // Receipt Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', 105, 50, { align: 'center' });

  // Receipt Number
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt No: ${payment.receiptNo}`, 20, 65);
  doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`, 150, 65);

  // Horizontal line
  doc.line(20, 70, 190, 70);

  // Student Information
  let yPos = 80;
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT INFORMATION', 20, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.text(`Student ID:`, 20, yPos);
  doc.text(payment.studentId, 70, yPos);
  yPos += 6;

  doc.text(`Student Name:`, 20, yPos);
  doc.text(payment.studentName, 70, yPos);
  yPos += 6;

  doc.text(`Academic Year:`, 20, yPos);
  doc.text(payment.academicYear, 70, yPos);
  yPos += 6;

  doc.text(`Semester:`, 20, yPos);
  doc.text(payment.semester, 70, yPos);
  yPos += 15;

  // Payment Information
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT INFORMATION', 20, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Type:`, 20, yPos);
  doc.text(payment.paymentType, 70, yPos);
  yPos += 6;

  doc.text(`Amount Paid:`, 20, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(`SLE ${payment.amount.toLocaleString('en-SL', { minimumFractionDigits: 2 })}`, 70, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 6;

  doc.text(`Payment Method:`, 20, yPos);
  doc.text(payment.paymentMethod, 70, yPos);
  yPos += 6;

  if (payment.bankName) {
    doc.text(`Bank:`, 20, yPos);
    doc.text(payment.bankName, 70, yPos);
    yPos += 6;
  }

  if (payment.transactionRef) {
    doc.text(`Transaction Ref:`, 20, yPos);
    doc.text(payment.transactionRef, 70, yPos);
    yPos += 6;
  }

  doc.text(`Status:`, 20, yPos);
  doc.setTextColor(payment.status === 'completed' ? 0 : 255, payment.status === 'completed' ? 128 : 0, 0);
  doc.text(payment.status.toUpperCase(), 70, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 15;

  // Horizontal line
  doc.line(20, yPos, 190, yPos);
  yPos += 10;

  // Signature
  doc.setFontSize(8);
  doc.text('Authorized Signature: _________________________', 20, yPos);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos + 6);

  // Footer
  yPos = 270;
  doc.setFontSize(8);
  doc.text('This is a computer-generated receipt. No signature required.', 105, yPos, { align: 'center' });
  doc.text('For any queries, please contact finance@ebkustsl.edu.sl', 105, yPos + 5, { align: 'center' });

  // Save the PDF
  doc.save(`Receipt_${payment.receiptNo}.pdf`);
};
