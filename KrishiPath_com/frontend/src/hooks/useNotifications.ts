import { useEffect, useState, useCallback } from 'react';
import type { Notification, NotificationCategory } from '../types';
import { notificationApi } from '../services/api';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export function useNotifications(initialCategory?: NotificationCategory | 'all') {
  const [state, setState] = useState<NotificationsState>({
    notifications: [],
    unreadCount: 0,
    loading: true,
    error: null,
  });

  const load = useCallback(async (category?: NotificationCategory | 'all') => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [notifications, unreadCount] = await Promise.all([
        notificationApi.getNotifications(category),
        notificationApi.getUnreadCount(),
      ]);
      setState({ notifications, unreadCount, loading: false, error: null });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load notifications',
      }));
    }
  }, []);

  useEffect(() => {
    load(initialCategory);
  }, [load, initialCategory]);

  const markAsRead = useCallback(async (id: string) => {
    await notificationApi.markAsRead(id);
    setState((s) => {
      const notifs = s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const unreadCount = notifs.filter((n) => !n.read).length;
      return { ...s, notifications: notifs, unreadCount };
    });
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationApi.markAllRead();
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  }, []);

  return {
    ...state,
    refetch: load,
    markAsRead,
    markAllRead,
  };
}
