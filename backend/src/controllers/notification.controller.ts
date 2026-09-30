import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { buildPaginatedResponse, getPagination } from "../utils/pagination";
import * as notificationService from "../services/notification.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req, 20);
  const unreadOnly = req.query.unreadOnly === "true";
  const { items, total } = await notificationService.listForUser(req.user!.userId, pagination, unreadOnly);
  res.json(buildPaginatedResponse(items, total, pagination));
});

export const unreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!.userId);
  res.json({ count });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAsRead(Number(req.params.id), req.user!.userId);
  res.status(204).send();
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead(req.user!.userId);
  res.status(204).send();
});
