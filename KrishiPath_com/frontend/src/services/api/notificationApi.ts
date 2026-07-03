import type { Notification, NotificationCategory } from '../../types';
import { notifications as mockNotifications } from '../../mock/notificationData';
import { delay } from '../../utils/formatters';
import { MOCK_DELAY_MIN_MS, MOCK_DELAY_MAX_MS } from '../../utils/constants';

let _notifications = [...mockNotifications];

const d = () => delay(MOCK_DELAY_MIN_MS + Math.random() * (MOCK_DELAY_MAX_MS - MOCK_DELAY_MIN_MS));

/**
 * Fetches notifications, optionally filtered by category.
 *
 * BACKEND SWAP: GET /notifications?category=campaign
 */
export const getNotifications = async (
  category?: NotificationCategory | 'all'
): Promise<Notification[]> => {
  await d();
  if (!category || category === 'all') return [..._notifications];
  return _notifications.filter((n) => n.category === category);
};

/**
 * Marks a single notification as read.
 *
 * BACKEND SWAP: PATCH /notifications/:id/read
 */
export const markAsRead = async (id: string): Promise<void> => {
  await delay(100);
  const idx = _notifications.findIndex((n) => n.id === id);
  if (idx !== -1) _notifications[idx] = { ..._notifications[idx], read: true };
};

/**
 * Marks all notifications as read.
 *
 * BACKEND SWAP: POST /notifications/mark-all-read
 */
export const markAllRead = async (): Promise<void> => {
  await delay(200);
  _notifications = _notifications.map((n) => ({ ...n, read: true }));
};

/**
 * Returns the count of unread notifications.
 *
 * BACKEND SWAP: GET /notifications/unread-count
 */
export const getUnreadCount = async (): Promise<number> => {
  await delay(50);
  return _notifications.filter((n) => !n.read).length;
};

export const notificationApi = { getNotifications, markAsRead, markAllRead, getUnreadCount };
