import { useState, useEffect, useCallback } from 'react';
import { notificationsService } from '../services/notificationsService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: 'Leave Request Approved',
      message: 'Your Casual Leave request for Sep 12 - Sep 14, 2026 was approved by Meera Krishnan.',
      timestamp: '10 minutes ago',
      type: 'leave',
      unread: true,
    },
    {
      id: 'notif_2',
      title: 'New Monthly Payslip Available',
      message: 'Your official payslip statement for August 2026 has been generated and is ready for download.',
      timestamp: '1 day ago',
      type: 'payslip',
      unread: true,
    },
  ]);
  const [unreadCount, setUnreadCount] = useState(2);
  const [loading, setLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationsService.fetchNotifications();
      if (res && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount ?? res.data.filter((n) => n.unread).length);
      }
    } catch (err) {
      console.warn('Using local notifications fallback:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 5000); // Poll every 5s for live updates
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const markRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await notificationsService.markRead(id);
      refreshNotifications();
    } catch (e) {
      console.warn('markRead error:', e);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
    try {
      await notificationsService.markAllRead();
      refreshNotifications();
    } catch (e) {
      console.warn('markAllRead error:', e);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markRead,
    markAllRead,
  };
};
