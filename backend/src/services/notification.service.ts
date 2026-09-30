import { NotificationType } from "@prisma/client";
import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";
import { PaginationParams } from "../utils/pagination";

export async function createNotification(userId: number, type: NotificationType, title: string, message: string, link?: string) {
  return prisma.notification.create({ data: { userId, type, title, message, link } });
}

export async function createNotificationForMany(userIds: number[], type: NotificationType, title: string, message: string, link?: string) {
  if (userIds.length === 0) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, type, title, message, link })),
  });
}

export async function listForUser(userId: number, pagination: PaginationParams, unreadOnly?: boolean) {
  const where = { userId, ...(unreadOnly ? { isRead: false } : {}) };
  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
  ]);
  return { items, total };
}

export function getUnreadCount(userId: number) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markAsRead(id: number, userId: number) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) throw ApiError.notFound("Notification introuvable");
  await prisma.notification.update({ where: { id }, data: { isRead: true } });
}

export async function markAllAsRead(userId: number) {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}
