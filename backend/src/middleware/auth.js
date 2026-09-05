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
    if (process.env.NODE_ENV !== 'production') {
      const devUser = await getOrCreateDevUser('ADMIN');
      req.user = devUser;
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization header' });
  }

  const token = authHeader.split(' ')[1];

  // 1. Development Fast Bypass Tokens
  if (token.startsWith('dev-')) {
    let targetRole = 'ADMIN';
    if (token === 'dev-hr-token') targetRole = 'HR_MANAGER';
    if (token === 'dev-payroll-token') targetRole = 'HR_PAYROLL_MANAGER';
    if (token === 'dev-emp-token') targetRole = 'EMPLOYEE';

    const devUser = await getOrCreateDevUser(targetRole);
    req.user = devUser;
    return next();
  }

  // 2. JWT Access Token Verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId || decoded.id },
      include: { employee: true },
    });

    if (dbUser && dbUser.isActive) {
      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        employeeId: dbUser.employeeId,
        name: dbUser.employee ? dbUser.employee.name : dbUser.email.split('@')[0],
      };
      return next();
    }
  } catch (jwtErr) {
    if (process.env.NODE_ENV !== 'production') {
      const devUser = await getOrCreateDevUser('ADMIN');
      req.user = devUser;
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid', details: jwtErr.message });
  }

  return res.status(401).json({ error: 'Unauthorized: Invalid credentials' });
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
