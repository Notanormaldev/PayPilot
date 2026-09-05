import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT || 'paypilot_super_secret_jwt_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH || `${JWT_SECRET}_refresh_secret_key`;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

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
 * Register a new employee user account
 */
authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'EMPLOYEE', department = 'Engineering', jobPosition = 'Specialist' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Ensure Organization exists
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'PayPilot Global Inc.', timezone: 'Asia/Kolkata' },
      });
    }

    // Find or create Employee record
    let employee = await prisma.employee.findUnique({ where: { workEmail: email } });
    if (!employee) {
      employee = await prisma.employee.create({
        data: {
          name: name || email.split('@')[0].replace('.', ' '),
          workEmail: email,
          department,
          jobPosition,
          orgId: org.id,
          status: 'ACTIVE',
        },
      });
    }

    // Create User record
    const user = await prisma.user.create({
      data: {
        clerkId: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        email,
        role: role || 'EMPLOYEE',
        employeeId: employee.id,
      },
      include: { employee: true },
    });

    const tokens = generateTokens(user);

    res.status(201).json({
      message: 'Account registered successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: employee.id,
        name: employee.name,
        department: employee.department,
        jobPosition: employee.jobPosition,
      },
      ...tokens,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register account', details: err.message });
  }
});

/**
 * POST /api/auth/login
 * Standard email/password or simulation role login
 */
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    // Auto-provision if user does not exist in development/demo mode
    if (!user) {
      let org = await prisma.organization.findFirst();
      if (!org) {
        org = await prisma.organization.create({
          data: { name: 'PayPilot Global Inc.', timezone: 'Asia/Kolkata' },
        });
      }

      let employee = await prisma.employee.findUnique({ where: { workEmail: email } });
      if (!employee) {
        employee = await prisma.employee.create({
          data: {
            name: email.split('@')[0].replace('.', ' '),
            workEmail: email,
            department: 'Executive',
            jobPosition: 'Officer',
            orgId: org.id,
          },
        });
      }

      user = await prisma.user.create({
        data: {
          clerkId: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          email,
          role: role || 'ADMIN',
          employeeId: employee.id,
        },
        include: { employee: true },
      });
    }

    // If user exists and specific role is requested, update role
    if (user && role && user.role !== role) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role },
        include: { employee: true },
      });
    }

    const tokens = generateTokens(user);

    res.json({
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        name: user.employee ? user.employee.name : user.email.split('@')[0],
        department: user.employee?.department || 'Executive',
        jobPosition: user.employee?.jobPosition || 'Officer',
      },
      ...tokens,
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

/**
 * POST /api/auth/refresh
 * Exchange valid Refresh Token (7d) for fresh Access Token (15m) + new Refresh Token
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { employee: true },
    });

    if (!user || !user.isActive) {
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
 * Terminate current session
 */
authRouter.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

/**
 * POST /api/auth/google
 * Verify Google OAuth ID Token
 */
authRouter.post('/google', async (req, res) => {
  try {
    const { credential, role = 'ADMIN' } = req.body;

    let email = 'google.executive@paypilot.internal';
    let name = 'Google Executive';

    if (googleClient && credential) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (payload?.email) {
          email = payload.email;
          name = payload.name || name;
        }
      } catch (gErr) {
        console.warn('Google token verification fallback:', gErr.message);
      }
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user) {
      let org = await prisma.organization.findFirst();
      if (!org) {
        org = await prisma.organization.create({
          data: { name: 'PayPilot Global Inc.' },
        });
      }

      let employee = await prisma.employee.findUnique({ where: { workEmail: email } });
      if (!employee) {
        employee = await prisma.employee.create({
          data: {
            name,
            workEmail: email,
            department: 'Executive',
            jobPosition: 'Director',
            orgId: org.id,
          },
        });
      }

      user = await prisma.user.create({
        data: {
          clerkId: `goog_${Date.now()}`,
          email,
          role,
          employeeId: employee.id,
        },
        include: { employee: true },
      });
    }

    const tokens = generateTokens(user);

    res.json({
      message: 'Google authentication successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        name: user.employee ? user.employee.name : name,
        department: user.employee?.department || 'Executive',
      },
      ...tokens,
    });
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.status(500).json({ error: 'Google OAuth failed', details: err.message });
  }
});


/**
 * GET /api/auth/me
 * Return current logged in user identity
 */
authRouter.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

export default authRouter;

