import { useState, useEffect, useCallback } from 'react';
import { notificationService, type Notification } from '@/lib/api/services/notificationService';

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

/**
 * Hook that fetches notifications for a citizen.
 * Used by HomeScreen (unread count) and NotificationsScreen (full list).
 */
export function useNotifications(citizenId: string): NotificationState {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!citizenId) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await notificationService.getNotifications(citizenId);
      setNotifications(data.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [citizenId]);

  useEffect(() => {
    Promise.resolve().then(() => {
      refetch();
    });
  }, [refetch]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, isLoading, refetch };
}
