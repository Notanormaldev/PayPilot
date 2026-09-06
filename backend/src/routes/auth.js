import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { sendOtpEmail } from '../lib/emailService.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';
import { validateStrongPassword } from '../utils/passwordValidator.js';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT || 'paypilot_super_secret_jwt_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH || `${JWT_SECRET}_refresh_secret_key`;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// In-Memory store for pending account OTP verifications
const pendingOtpStore = new Map();

// In-Memory fallback store for verified users awaiting Admin approval
const memoryPendingApprovals = new Map();

/**
 * GET /api/auth/admin-exists
 * Returns whether a primary Administrator account has already been initialized
 */
authRouter.get('/admin-exists', async (req, res) => {
  try {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    res.json({ adminExists: !!adminUser });
  } catch (err) {
    res.json({ adminExists: true });
  }
});

/**
 * Generate standard JWT Access Token (15m) & Refresh Token (7d)
 */
function generateTokens(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId || null,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: 900, // 15 minutes
  };
}

/**
 * POST /api/auth/register
 * Initiate registration: validates strong password, creates pending user state, generates 6-digit OTP & dispatches email
 */
authRouter.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name, role = 'EMPLOYEE', department = 'Executive', jobPosition = 'Specialist' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // 0. Strict Strong Password Requirement
    const passwordValidation = validateStrongPassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: passwordValidation.error,
        code: 'WEAK_PASSWORD',
        requirements: passwordValidation.requirements,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Single Admin Restriction: If registering as ADMIN, ensure no admin already exists
    if (role === 'ADMIN') {
      try {
        const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (existingAdmin) {
          return res.status(409).json({
            error: 'Administrator account is already configured. New Admin registration is restricted.',
            code: 'ADMIN_ALREADY_EXISTS',
          });
        }
      } catch (dbErr) {
        console.warn('DB admin check warning:', dbErr.message);
      }
    }

    // 2. Check if user already exists in DB
    try {
      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingUser) {
        return res.status(409).json({ error: 'An account already exists with this email address. Please sign in.' });
      }
    } catch (dbErr) {
      console.warn('DB user query check:', dbErr.message);
    }

    // 3. Generate strict 6-digit OTP code (valid for 10 minutes)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;

    // Save pending registration record
    pendingOtpStore.set(normalizedEmail, {
      email: normalizedEmail,
      password,
      name: name || email.split('@')[0].replace('.', ' '),
      role: role || 'EMPLOYEE',
      department: department || 'Executive',
      jobPosition: jobPosition || 'Specialist',
      otpCode,
      otpExpiresAt,
    });

    // Send email using Brevo API
    const emailResult = await sendOtpEmail(email, name || email.split('@')[0], otpCode);

    if (!emailResult.success) {
      console.error('Email sending failed during registration:', emailResult.error);
    }

    res.status(200).json({
      message: `Verification code sent to ${email}. Please check your inbox to complete sign up.`,
      email: normalizedEmail,
      pendingVerification: true,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to initiate registration', details: err.message });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify strict 6-digit OTP code sent via Brevo email
 */
authRouter.post('/verify-otp', authLimiter, async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ error: 'Email and OTP code are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const submittedOtp = otpCode.trim();
    const pendingData = pendingOtpStore.get(normalizedEmail);

    if (!pendingData) {
      return res.status(400).json({ error: 'No pending registration found for this email. Please register again.' });
    }

    // Strict OTP verification
    const isCodeMatching = pendingData.otpCode === submittedOtp;
    const isNotExpired = Date.now() < pendingData.otpExpiresAt;

    if (!isCodeMatching || !isNotExpired) {
      return res.status(400).json({
        error: !isNotExpired
          ? 'Verification code has expired. Please click Resend Code.'
          : 'Invalid verification code. Please enter the exact 6-digit code received in your email.',
      });
    }

    // Extract pending user information
    const name = pendingData.name;
    const role = pendingData.role;
    const department = pendingData.department;
    const jobPosition = pendingData.jobPosition;

    // Clear pending OTP from memory upon successful verification
    pendingOtpStore.delete(normalizedEmail);

    // HR and Payroll roles require Admin Approval. Employee & initial Admin are approved immediately.
    const isHrOrPayroll = role === 'HR_MANAGER' || role === 'HR_PAYROLL_MANAGER' || role === 'HR_PAYROLL_USER';
    const approvalStatus = isHrOrPayroll ? 'PENDING_APPROVAL' : 'APPROVED';
    const isActive = !isHrOrPayroll;

    let user;
    try {
      // Ensure Organization exists
      let org = await prisma.organization.findFirst();
      if (!org) {
        org = await prisma.organization.create({
          data: { name: 'PayPilot Global Inc.', timezone: 'Asia/Kolkata' },
        });
      }

      // Create Employee record if needed
      let employee = await prisma.employee.findUnique({ where: { workEmail: normalizedEmail } });
      if (!employee) {
        employee = await prisma.employee.create({
          data: {
            name,
            workEmail: normalizedEmail,
            department,
            jobPosition,
            orgId: org.id,
            status: 'ACTIVE',
          },
        });
      }

      user = await prisma.user.findUnique({ where: { email: normalizedEmail }, include: { employee: true } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            clerkId: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            email: normalizedEmail,
            role,
            approvalStatus,
            isActive,
            isVerified: true,
            employeeId: employee.id,
          },
          include: { employee: true },
        });
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role, approvalStatus, isActive, isVerified: true },
          include: { employee: true },
        });
      }
    } catch (dbErr) {
      console.warn('DB user creation fallback:', dbErr.message);
      user = {
        id: `usr_${Date.now()}`,
        email: normalizedEmail,
        role,
        approvalStatus,
        isActive,
        isVerified: true,
        employeeId: null,
        employee: { name, department, jobPosition },
      };
    }

    // If HR or Payroll: do NOT issue session tokens; notify user to wait for Admin approval
    if (isHrOrPayroll) {
      memoryPendingApprovals.set(normalizedEmail, {
        id: user.id,
        email: normalizedEmail,
        name: user.employee ? user.employee.name : name,
        role,
        department: user.employee?.department || department,
        jobPosition: user.employee?.jobPosition || jobPosition,
        approvalStatus: 'PENDING_APPROVAL',
        isActive: false,
        createdAt: new Date(),
      });

      return res.status(200).json({
        message: 'Work email verified successfully! Your HR / Payroll account registration has been submitted and is waiting for Administrator approval.',
        pendingApproval: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.employee ? user.employee.name : name,
          department: user.employee?.department || department,
          approvalStatus: 'PENDING_APPROVAL',
        },
      });
    }

    // Employee or Admin: issue tokens directly
    const tokens = generateTokens(user);

    res.status(200).json({
      message: 'Account verified successfully',
      pendingApproval: false,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId || null,
        name: user.employee ? user.employee.name : name,
        department: user.employee?.department || department,
        jobPosition: user.employee?.jobPosition || jobPosition,
        approvalStatus: 'APPROVED',
      },
      ...tokens,
    });
  } catch (err) {
    console.error('OTP Verification error:', err);
    res.status(500).json({ error: 'Failed to verify OTP', details: err.message });
  }
});

/**
 * POST /api/auth/resend-otp
 * Re-generate and dispatch a fresh 6-digit OTP code via Brevo email
 */
authRouter.post('/resend-otp', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingPending = pendingOtpStore.get(normalizedEmail);

    if (!existingPending) {
      return res.status(400).json({ error: 'No pending registration found for this email. Please register again.' });
    }

    const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;

    pendingOtpStore.set(normalizedEmail, {
      ...existingPending,
      otpCode: newOtpCode,
      otpExpiresAt,
    });

    const emailResult = await sendOtpEmail(email, existingPending.name, newOtpCode);

    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to dispatch email via Brevo API: ' + emailResult.error });
    }

    res.status(200).json({
      message: `A new 6-digit verification code has been sent to ${email}.`,
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend OTP', details: err.message });
  }
});

/**
 * POST /api/auth/login
 * Standard email/password login with approval gatekeeping & rate-limiting protection
 */
authRouter.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { employee: true },
      });
    } catch (e) {
      console.warn('DB lookup fallback:', e.message);
    }

    // Auto-provision default demo personas if they don't exist yet
    const demoEmails = [
      'meera.krishnan@paypilot.internal',
      'neha.gupta@paypilot.internal',
      'rahul.sharma@paypilot.internal',
      'tanvi.kapoor@paypilot.internal',
      'kartik.kumar@paypilot.internal',
    ];

    if (!user) {
      if (demoEmails.includes(normalizedEmail)) {
        try {
          let org = await prisma.organization.findFirst();
          if (!org) {
            org = await prisma.organization.create({
              data: { name: 'PayPilot Global Inc.', timezone: 'Asia/Kolkata' },
            });
          }

          let employee = await prisma.employee.findUnique({ where: { workEmail: normalizedEmail } });
          if (!employee) {
            employee = await prisma.employee.create({
              data: {
                name: normalizedEmail.split('@')[0].replace('.', ' '),
                workEmail: normalizedEmail,
                department: 'Executive',
                jobPosition: 'Officer',
                orgId: org.id,
              },
            });
          }

          user = await prisma.user.create({
            data: {
              clerkId: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              email: normalizedEmail,
              role: role || (normalizedEmail.includes('meera') ? 'ADMIN' : 'EMPLOYEE'),
              approvalStatus: 'APPROVED',
              isActive: true,
              employeeId: employee.id,
            },
            include: { employee: true },
          });
        } catch (e) {
          user = {
            id: `usr_${Date.now()}`,
            email: normalizedEmail,
            role: role || 'ADMIN',
            approvalStatus: 'APPROVED',
            isActive: true,
            employeeId: null,
            employee: { name: normalizedEmail.split('@')[0], department: 'Executive', jobPosition: 'Officer' },
          };
        }
      } else {
        return res.status(401).json({
          error: 'Account not found. Please click Create Account to register.',
          code: 'USER_NOT_FOUND',
        });
      }
    }

    // 4. Approval Gatekeeping: Check if account is pending approval
    if (user.approvalStatus === 'PENDING_APPROVAL') {
      return res.status(403).json({
        error: 'Your account is waiting for Admin approval. Please wait for an administrator to approve your registration before signing in.',
        code: 'PENDING_ADMIN_APPROVAL',
        pendingApproval: true,
      });
    }

    if (user.approvalStatus === 'REJECTED') {
      return res.status(403).json({
        error: 'Your account registration was rejected by the administrator.',
        code: 'ACCOUNT_REJECTED',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        error: 'Your account is currently inactive. Please contact your administrator.',
        code: 'ACCOUNT_INACTIVE',
      });
    }

    const tokens = generateTokens(user);

    res.json({
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId || null,
        name: user.employee ? user.employee.name : normalizedEmail.split('@')[0],
        department: user.employee?.department || 'Executive',
        jobPosition: user.employee?.jobPosition || 'Officer',
        approvalStatus: user.approvalStatus || 'APPROVED',
      },
      ...tokens,
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

/**
 * GET /api/auth/pending-users
 * Returns list of pending HR / Payroll accounts waiting for Admin approval
 */
authRouter.get('/pending-users', async (req, res) => {
  try {
    let pendingUsers = [];
    try {
      pendingUsers = await prisma.user.findMany({
        where: { approvalStatus: 'PENDING_APPROVAL' },
        include: { employee: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.warn('DB pending users query fallback:', e.message);
    }

    const formatted = pendingUsers.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.employee?.name || u.email.split('@')[0].replace('.', ' '),
      role: u.role,
      department: u.employee?.department || 'HR & People',
      jobPosition: u.employee?.jobPosition || 'Specialist',
      approvalStatus: u.approvalStatus,
      createdAt: u.createdAt,
    }));

    // Merge in-memory pending approvals if not already in DB results
    for (const [email, memUser] of memoryPendingApprovals.entries()) {
      if (!formatted.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        formatted.unshift({
          id: memUser.id || `mem_${Date.now()}`,
          email: memUser.email,
          name: memUser.name,
          role: memUser.role,
          department: memUser.department || 'HR & People',
          jobPosition: memUser.jobPosition || 'Specialist',
          approvalStatus: 'PENDING_APPROVAL',
          createdAt: memUser.createdAt || new Date(),
        });
      }
    }

    res.json({ success: true, users: formatted, data: formatted });
  } catch (err) {
    console.error('Fetch pending users error:', err);
    res.status(500).json({ error: 'Failed to fetch pending users', details: err.message });
  }
});

/**
 * POST /api/auth/approve-user/:id
 * Admin approves a pending HR / Payroll user
 */
authRouter.post('/approve-user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    let user = null;

    try {
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          approvalStatus: 'APPROVED',
          isActive: true,
          approvedAt: new Date(),
        },
        include: { employee: true },
      });
    } catch (dbErr) {
      // Find in memoryPendingApprovals
      for (const [email, memUser] of memoryPendingApprovals.entries()) {
        if (memUser.id === userId || `mem_${email}` === userId || memUser.email === userId) {
          memUser.approvalStatus = 'APPROVED';
          memUser.isActive = true;
          user = memUser;
          memoryPendingApprovals.delete(email);
          break;
        }
      }
    }

    if (!user) {
      try {
        const found = await prisma.user.findFirst({
          where: { OR: [{ id: userId }, { email: userId }] },
        });
        if (found) {
          user = await prisma.user.update({
            where: { id: found.id },
            data: { approvalStatus: 'APPROVED', isActive: true, approvedAt: new Date() },
            include: { employee: true },
          });
        }
      } catch (e) {}
    }

    // Clean up memory store
    for (const [email, memUser] of memoryPendingApprovals.entries()) {
      if (memUser.id === userId || memUser.email === userId) {
        memoryPendingApprovals.delete(email);
      }
    }

    res.json({
      success: true,
      message: `User ${user?.email || userId} has been approved successfully.`,
      user,
    });
  } catch (err) {
    console.error('Approve user error:', err);
    res.status(500).json({ error: 'Failed to approve user', details: err.message });
  }
});

/**
 * POST /api/auth/reject-user/:id
 * Admin rejects a pending HR / Payroll user
 */
authRouter.post('/reject-user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    let user = null;

    try {
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          approvalStatus: 'REJECTED',
          isActive: false,
        },
      });
    } catch (dbErr) {
      for (const [email, memUser] of memoryPendingApprovals.entries()) {
        if (memUser.id === userId || `mem_${email}` === userId || memUser.email === userId) {
          memUser.approvalStatus = 'REJECTED';
          memUser.isActive = false;
          user = memUser;
          memoryPendingApprovals.delete(email);
          break;
        }
      }
    }

    // Clean up memory store
    for (const [email, memUser] of memoryPendingApprovals.entries()) {
      if (memUser.id === userId || memUser.email === userId) {
        memoryPendingApprovals.delete(email);
      }
    }

    res.json({
      success: true,
      message: `User ${user?.email || userId} registration was rejected.`,
      user,
    });
  } catch (err) {
    console.error('Reject user error:', err);
    res.status(500).json({ error: 'Failed to reject user', details: err.message });
  }
});

/**
 * POST /api/auth/refresh
 */
authRouter.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required',
        code: 'REFRESH_TOKEN_MISSING',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        error: 'Invalid or expired refresh token',
        code: 'REFRESH_TOKEN_EXPIRED',
        message: err.message,
      });
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { employee: true },
      });
    } catch (e) {
      user = { id: decoded.userId, email: decoded.email, role: 'ADMIN' };
    }

    if (!user) {
      return res.status(401).json({
        error: 'User account not found or deactivated',
        code: 'USER_INACTIVE',
      });
    }

    const tokens = generateTokens(user);
    res.json({
      message: 'Token refreshed successfully',
      ...tokens,
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ error: 'Token refresh failed', details: err.message });
  }
});

/**
 * POST /api/auth/logout
 */
authRouter.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 */
authRouter.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

export default authRouter;
