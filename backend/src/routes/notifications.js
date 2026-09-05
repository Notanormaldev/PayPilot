import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';

export const notificationsRouter = Router();

// In-memory store for notifications (complemented by Prisma/system events)
export let notificationsStore = [
  {
    id: 'notif_1',
    userEmail: 'employee@paypilot.com',
    employeeId: 'emp_1',
    title: 'Leave Request Approved',
    message: 'Your Casual Leave request for Sep 12 - Sep 14, 2026 was approved by Meera Krishnan.',
    timestamp: '10 minutes ago',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    type: 'leave',
    unread: true,
  },
  {
    id: 'notif_2',
    userEmail: 'employee@paypilot.com',
    employeeId: 'emp_1',
    title: 'New Monthly Payslip Available',
    message: 'Your official payslip statement for August 2026 has been generated and is ready for download.',
    timestamp: '1 day ago',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    type: 'payslip',
    unread: true,
  },
];

export function addNotification({ userEmail, employeeId, title, message, type = 'leave' }) {
  const newNotif = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userEmail: userEmail || 'employee@paypilot.com',
    employeeId: employeeId || 'emp_1',
    title,
    message,
    timestamp: 'Just now',
    createdAt: new Date().toISOString(),
    type,
    unread: true,
  };
  notificationsStore.unshift(newNotif);
  return newNotif;
}

// GET /api/notifications
notificationsRouter.get('/', authenticate, async (req, res) => {
  try {
    const userEmail = req.user?.email;
    // Filter for current user if email exists, else return store
    const userNotifs = userEmail
      ? notificationsStore.filter((n) => !n.userEmail || n.userEmail === userEmail)
      : notificationsStore;

    const unreadCount = userNotifs.filter((n) => n.unread).length;

    res.json({
      data: userNotifs,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

// POST /api/notifications/mark-read
notificationsRouter.post('/mark-read', authenticate, async (req, res) => {
  try {
    const { id, all } = req.body;

    if (all) {
      notificationsStore.forEach((n) => {
        n.unread = false;
      });
    } else if (id) {
      const target = notificationsStore.find((n) => n.id === id);
      if (target) {
        target.unread = false;
      }
    }

    const unreadCount = notificationsStore.filter((n) => n.unread).length;
    res.json({
      message: 'Notifications updated',
      data: notificationsStore,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications', details: err.message });
  }
});
