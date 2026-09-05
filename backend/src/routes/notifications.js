import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';

export const notificationsRouter = Router();

// In-memory store for notifications (complemented by system events)
export let notificationsStore = [
  {
    id: 'notif_1',
    userEmail: 'employee@paypilot.com',
    employeeId: 'emp_1',
    targetRole: 'EMPLOYEE',
    title: 'Leave Request Approved',
    message: 'Your Casual Leave request for Sep 12 - Sep 14, 2026 was approved by the manager.',
    timestamp: '10 minutes ago',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    type: 'leave',
    unread: true,
  },
  {
    id: 'notif_2',
    userEmail: 'employee@paypilot.com',
    employeeId: 'emp_1',
    targetRole: 'EMPLOYEE',
    title: 'New Monthly Payslip Available',
    message: 'Your official payslip statement for August 2026 has been generated and is ready for download.',
    timestamp: '1 day ago',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    type: 'payslip',
    unread: true,
  },
  {
    id: 'notif_hr_1',
    targetRole: 'HR_MANAGER',
    title: 'New Leave Request Received',
    message: 'Employee Aarav Sharma submitted a new Casual Leave request (3 days: 2026-09-12 to 2026-09-14) awaiting your approval.',
    timestamp: '15 minutes ago',
    createdAt: new Date(Date.now() - 900000).toISOString(),
    type: 'leave',
    unread: true,
  },
];

export function addNotification({ userEmail, employeeId, targetRole, title, message, type = 'leave' }) {
  const newNotif = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userEmail: userEmail || null,
    employeeId: employeeId || null,
    targetRole: targetRole || null,
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
    const userRole = req.user?.role || 'EMPLOYEE';
    const userEmail = req.user?.email;

    const userNotifs = notificationsStore.filter((n) => {
      // HR Manager & Admin see notifications targeted to HR_MANAGER/ADMIN
      if (userRole === 'HR_MANAGER' || userRole === 'ADMIN') {
        if (n.targetRole === 'HR_MANAGER' || n.targetRole === 'ADMIN') return true;
        if (!n.targetRole && (!n.userEmail || n.userEmail === userEmail)) return true;
        return false;
      }
      // Employee sees notifications targeted to EMPLOYEE or their userEmail
      if (n.targetRole === 'EMPLOYEE') return true;
      if (n.userEmail && n.userEmail === userEmail) return true;
      if (!n.targetRole && (!n.userEmail || n.userEmail === 'employee@paypilot.com')) return true;
      return false;
    });

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
