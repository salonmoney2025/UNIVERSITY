import nodemailer from 'nodemailer';

// Email configuration - these should be set in environment variables
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@ebkust.edu.sl';
const FROM_NAME = process.env.FROM_NAME || 'EBKUST University';

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Skip sending if SMTP is not configured
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP not configured. Email not sent:', options.subject);
    return false;
  }

  try {
    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('Email sent successfully to:', options.to);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Payment receipt email template
 */
export function paymentReceiptEmail(data: {
  studentName: string;
  receiptNo: string;
  amount: number;
  paymentType: string;
  paymentDate: Date;
  paymentMethod: string;
  transactionRef?: string;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SL', {
      style: 'currency',
      currency: 'NSL',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
    .receipt-details { background-color: white; padding: 15px; border-radius: 5px; margin-top: 15px; }
    .detail-row { display: flex; justify-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { font-weight: bold; color: #6b7280; }
    .detail-value { color: #111827; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
    .amount { font-size: 24px; font-weight: bold; color: #10b981; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>EBKUST University</h1>
      <p>Payment Receipt</p>
    </div>

    <div class="content">
      <p>Dear ${data.studentName},</p>
      <p>Thank you for your payment. Your transaction has been successfully processed.</p>

      <div class="receipt-details">
        <div class="detail-row">
          <span class="detail-label">Receipt Number:</span>
          <span class="detail-value">${data.receiptNo}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Type:</span>
          <span class="detail-value">${data.paymentType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">${data.paymentMethod}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Date:</span>
          <span class="detail-value">${data.paymentDate.toLocaleDateString()}</span>
        </div>
        ${data.transactionRef ? `
        <div class="detail-row">
          <span class="detail-label">Transaction Reference:</span>
          <span class="detail-value">${data.transactionRef}</span>
        </div>
        ` : ''}
        <div class="detail-row" style="border-bottom: none; margin-top: 10px;">
          <span class="detail-label">Amount Paid:</span>
          <span class="amount">${formatCurrency(data.amount)}</span>
        </div>
      </div>

      <p style="margin-top: 20px;">If you have any questions about this payment, please contact the Finance Office.</p>
    </div>

    <div class="footer">
      <p>Ernest Bai Koroma University of Science and Technology</p>
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
EBKUST University - Payment Receipt

Dear ${data.studentName},

Thank you for your payment. Your transaction has been successfully processed.

Receipt Number: ${data.receiptNo}
Payment Type: ${data.paymentType}
Payment Method: ${data.paymentMethod}
Payment Date: ${data.paymentDate.toLocaleDateString()}
${data.transactionRef ? `Transaction Reference: ${data.transactionRef}` : ''}
Amount Paid: ${formatCurrency(data.amount)}

If you have any questions about this payment, please contact the Finance Office.

Ernest Bai Koroma University of Science and Technology
  `;

  return { html, text };
}

/**
 * Ticket response email template
 */
export function ticketResponseEmail(data: {
  ticketNo: string;
  subject: string;
  message: string;
  respondBy: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #8b5cf6; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
    .message-box { background-color: white; padding: 15px; border-radius: 5px; margin-top: 15px; border-left: 4px solid #8b5cf6; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>EBKUST Support</h1>
      <p>Ticket Update</p>
    </div>

    <div class="content">
      <p><strong>Ticket #${data.ticketNo}</strong> has a new response.</p>
      <p><strong>Subject:</strong> ${data.subject}</p>

      <div class="message-box">
        <p><strong>Response from ${data.respondBy}:</strong></p>
        <p>${data.message}</p>
      </div>

      <p style="margin-top: 20px;">You can view and respond to this ticket by logging into your account.</p>
    </div>

    <div class="footer">
      <p>Ernest Bai Koroma University of Science and Technology</p>
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
EBKUST Support - Ticket Update

Ticket #${data.ticketNo} has a new response.

Subject: ${data.subject}

Response from ${data.respondBy}:
${data.message}

You can view and respond to this ticket by logging into your account.

Ernest Bai Koroma University of Science and Technology
  `;

  return { html, text };
}

/**
 * Welcome email template
 */
export function welcomeEmail(data: {
  name: string;
  email: string;
  role: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
    .button { background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to EBKUST University!</h1>
    </div>

    <div class="content">
      <p>Dear ${data.name},</p>
      <p>Welcome to Ernest Bai Koroma University of Science and Technology Learning Management System!</p>
      <p>Your account has been successfully created with the following details:</p>

      <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Role:</strong> ${data.role}</p>
      </div>

      <p>You can now log in to access your account and explore all the features available to you.</p>

      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="button">Log In Now</a>

      <p style="margin-top: 20px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
    </div>

    <div class="footer">
      <p>Ernest Bai Koroma University of Science and Technology</p>
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Welcome to EBKUST University!

Dear ${data.name},

Welcome to Ernest Bai Koroma University of Science and Technology Learning Management System!

Your account has been successfully created with the following details:

Email: ${data.email}
Role: ${data.role}

You can now log in to access your account and explore all the features available to you.

If you have any questions or need assistance, please don't hesitate to contact our support team.

Ernest Bai Koroma University of Science and Technology
  `;

  return { html, text };
}
