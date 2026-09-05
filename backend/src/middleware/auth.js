
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT || 'paypilot_super_secret_jwt_key_2026';

/**
 * Pure JWT Authentication Middleware
 * Validates standard Authorization: Bearer <accessToken>
 * Attaches authenticated user object to req.user
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Missing or malformed authorization header',
      code: 'TOKEN_MISSING',
    });
  }

  const token = authHeader.split(' ')[1];

  // 1. Development Persona Fast Tokens (dev-admin-token, dev-hr-token, dev-payroll-token, dev-emp-token)
  if (token && token.startsWith('dev-')) {
    let targetRole = 'ADMIN';
    if (token === 'dev-hr-token') targetRole = 'HR_MANAGER';
    if (token === 'dev-payroll-token') targetRole = 'HR_PAYROLL_MANAGER';
    if (token === 'dev-emp-token') targetRole = 'EMPLOYEE';

    try {
      const devUser = await getOrCreateDevUser(targetRole);
      req.user = devUser;
      return next();
    } catch (e) {
      console.error('Error provisioning dev user:', e);
      return res.status(500).json({ error: 'Failed to initialize session' });
    }
  }

  // 2. Standard JWT Access Token Verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized: Token payload missing user identifier',
        code: 'TOKEN_INVALID',
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!dbUser || !dbUser.isActive) {
      return res.status(401).json({
        error: 'Unauthorized: User account not found or deactivated',
        code: 'USER_INACTIVE',
      });
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      employeeId: dbUser.employeeId,
      name: dbUser.employee ? dbUser.employee.name : dbUser.email.split('@')[0],
      department: dbUser.employee?.department || 'Executive',
    };
    return next();
  } catch (jwtErr) {
    const isExpired = jwtErr.name === 'TokenExpiredError';
    return res.status(401).json({
      error: isExpired ? 'Unauthorized: Access token has expired' : 'Unauthorized: Invalid token signature',
      code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
      message: jwtErr.message,
    });
  }
}

export async function getOrCreateDevUser(role) {
  const clerkId = `usr_${String(role).toLowerCase()}_dev`;
  const email = `dev-${String(role).toLowerCase()}@paypilot.internal`;

  const user = await prisma.user.upsert({
    where: { clerkId },
    update: { role, email },
    create: {
      clerkId,
      email,
      role,
    },
    include: { employee: true },
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    name: user.employee ? user.employee.name : 'Executive Officer',
  };
}

/**
 * Role-Based Access Control (RBAC) Guard
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' lacks permission`,
        requiredRoles: allowedRoles,
      });
    }

    next();
  };
}

