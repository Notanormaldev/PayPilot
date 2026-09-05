import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT || 'paypilot_super_secret_jwt_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH || `${JWT_SECRET}_refresh`;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

function generateTokens(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
}

/**
 * POST /api/auth/register
 */
authRouter.post('/register', async (req, res) => {
  try {
    const { email, name, role = 'EMPLOYEE', department = 'Engineering', jobPosition = 'Specialist' } = req.body;

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

    // Create Employee record
    const employee = await prisma.employee.create({
      data: {
        name: name || email.split('@')[0],
        workEmail: email,
        department,
        jobPosition,
        orgId: org.id,
        status: 'ACTIVE',
      },
    });

    // Create User record
    const user = await prisma.user.create({
      data: {
        clerkId: `usr_${Date.now()}`,
        email,
        role: role || 'EMPLOYEE',
        employeeId: employee.id,
      },
      include: { employee: true },
    });

    const tokens = generateTokens(user);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: employee.name,
        department: employee.department,
      },
      ...tokens,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register user', details: err.message });
  }
});

/**
 * POST /api/auth/login
 */
authRouter.post('/login', async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    // If user does not exist in dev/demo mode, auto-provision
    if (!user) {
      let org = await prisma.organization.findFirst();
      if (!org) {
        org = await prisma.organization.create({
          data: { name: 'PayPilot Global Inc.', timezone: 'Asia/Kolkata' },
        });
      }

      const employee = await prisma.employee.create({
        data: {
          name: email.split('@')[0].replace('.', ' '),
          workEmail: email,
          department: 'Executive',
          jobPosition: 'Officer',
          orgId: org.id,
        },
      });

      user = await prisma.user.create({
        data: {
          clerkId: `usr_${Date.now()}`,
          email,
          role: role || 'ADMIN',
          employeeId: employee.id,
        },
        include: { employee: true },
      });
    }

    const tokens = generateTokens(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.employee ? user.employee.name : user.email.split('@')[0],
        department: user.employee?.department || 'Executive',
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
 */
authRouter.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { employee: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User is inactive or not found' });
    }

    const tokens = generateTokens(user);
    res.json(tokens);
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

/**
 * POST /api/auth/google
 */
authRouter.post('/google', async (req, res) => {
  try {
    const { credential, role = 'ADMIN' } = req.body;

    let email = 'demo.google@paypilot.internal';
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

      const employee = await prisma.employee.create({
        data: {
          name,
          workEmail: email,
          department: 'Executive',
          jobPosition: 'Director',
          orgId: org.id,
        },
      });

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
        name: user.employee ? user.employee.name : name,
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
 */
authRouter.get('/me', authenticate, async (req, res) => {
  res.json({
    user: req.user,
  });
});

export default authRouter;
