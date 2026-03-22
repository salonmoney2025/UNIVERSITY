import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'alert' | 'payment' | 'ticket';
  link?: string;
  metadata?: string;
}

/**
 * Create a new notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || 'info',
        link: params.link,
        metadata: params.metadata,
      },
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * Create notifications for multiple users at once
 */
export async function createBulkNotifications(
  userIds: string[],
  params: Omit<CreateNotificationParams, 'userId'>
) {
  try {
    const notifications = await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title: params.title,
        message: params.message,
        type: params.type || 'info',
        link: params.link,
        metadata: params.metadata,
      })),
    });

    return notifications;
  } catch (error) {
    console.error('Failed to create bulk notifications:', error);
    throw error;
  }
}

/**
 * Create a payment notification
 */
export async function notifyPaymentReceived(userId: string, amount: number, receiptNo: string) {
  return createNotification({
    userId,
    title: 'Payment Received',
    message: `Your payment of SLE ${amount.toFixed(2)} has been recorded. Receipt: ${receiptNo}`,
    type: 'payment',
    link: `/receipt/verify?receipt=${receiptNo}`,
  });
}

/**
 * Create a ticket response notification
 */
export async function notifyTicketResponse(userId: string, ticketNo: string, subject: string) {
  return createNotification({
    userId,
    title: 'New Ticket Response',
    message: `You have a new response on your ticket: ${subject}`,
    type: 'ticket',
    link: `/helpdesk/tickets/${ticketNo}`,
  });
}

/**
 * Create a system alert notification
 */
export async function notifySystemAlert(userId: string, title: string, message: string) {
  return createNotification({
    userId,
    title,
    message,
    type: 'alert',
  });
}

/**
 * Notify all users with a specific role
 */
export async function notifyUsersByRole(
  role: string,
  params: Omit<CreateNotificationParams, 'userId'>
) {
  try {
    // Get all users with the specified role
    const users = await prisma.user.findMany({
      where: { role },
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);

    return createBulkNotifications(userIds, params);
  } catch (error) {
    console.error('Failed to notify users by role:', error);
    throw error;
  }
}
