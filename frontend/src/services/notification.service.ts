import { api } from "./api";
import { AppNotification, PaginatedResponse } from "../types";

export async function listNotifications(unreadOnly = false) {
  const { data } = await api.get<PaginatedResponse<AppNotification>>("/notifications", {
    params: { pageSize: 20, unreadOnly: unreadOnly || undefined },
  });
  return data;
}

export async function getUnreadCount() {
  const { data } = await api.get<{ count: number }>("/notifications/unread-count");
  return data.count;
}

export async function markAsRead(id: number) {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead() {
  await api.patch("/notifications/read-all");
}
