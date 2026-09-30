import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { AppNotification } from "../types";
import * as notificationService from "../services/notification.service";
import { useAuth } from "../hooks/useAuth";

const POLL_INTERVAL_MS = 30000;

interface NotificationContextValue {
  unreadCount: number;
  notifications: AppNotification[];
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [count, list] = await Promise.all([
        notificationService.getUnreadCount(),
        notificationService.listNotifications(),
      ]);
      setUnreadCount(count);
      setNotifications(list.data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, refresh]);

  async function markAsRead(id: number) {
    await notificationService.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllAsRead() {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  return (
    <NotificationContext.Provider value={{ unreadCount, notifications, loading, refresh, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
