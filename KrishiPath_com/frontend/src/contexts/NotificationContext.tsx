import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { notificationApi } from '../services/api';

interface NotificationContextValue {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread notifications count', err);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
  }, []);

  const value: NotificationContextValue = {
    unreadCount,
    refreshUnreadCount,
    markAllRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
