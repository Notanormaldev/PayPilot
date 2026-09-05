import { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { prisma } from '../lib/prisma';
import { RoleType } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    clerkId: string;
    email: string;
    role: RoleType;
    employeeId?: string | null;
  };
}

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerk = clerkSecretKey ? createClerkClient({ secretKey: clerkSecretKey }) : null;

/**
 * Enterprise Authentication Middleware
 * Supports:
 * 1. Clerk Session Tokens (Production)
 * 2. Development Bearer Tokens ("dev-admin-token", "dev-hr-token", "dev-emp-token") for seamless local testing
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Check if dev bypass query or header is allowed in non-production
    if (process.env.NODE_ENV !== 'production') {
      const devUser = await getOrCreateDevUser('ADMIN');
      req.user = devUser;
      return next();
    }
    res.status(401).json({ error: 'Unauthorized: Missing or malformed authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Development bypass tokens
  if (process.env.NODE_ENV !== 'production' && token.startsWith('dev-')) {
    let targetRole: RoleType = 'ADMIN';
    if (token === 'dev-hr-token') targetRole = 'HR_OFFICER';
    if (token === 'dev-payroll-token') targetRole = 'PAYROLL_OFFICER';
    if (token === 'dev-emp-token') targetRole = 'EMPLOYEE';

    const devUser = await getOrCreateDevUser(targetRole);
    req.user = devUser;
    return next();
  }

  // Live Clerk Token Verification
  if (!clerk) {
    // If Clerk secret is not yet set, fall back to dev admin user with notice
    const devUser = await getOrCreateDevUser('ADMIN');
    req.user = devUser;
    return next();
  }

  try {
    const verified = await verifyToken(token, { secretKey: clerkSecretKey! });
    const clerkId = verified.sub;

    let dbUser = await prisma.user.findUnique({
      where: { clerkId },
      include: { employee: true },
    });

    if (!dbUser) {
      // Sync user from Clerk on first login
      const clerkUser = await clerk.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || `${clerkId}@example.com`;

      dbUser = await prisma.user.create({
        data: {
          clerkId,
          email,
          role: 'ADMIN', // Default first user or from metadata
        },
        include: { employee: true },
      });
    }

    req.user = {
      id: dbUser.id,
      clerkId: dbUser.clerkId,
      email: dbUser.email,
      role: dbUser.role as RoleType,
      employeeId: dbUser.employeeId,
    };

    next();
  } catch (err: any) {
    console.warn('⚠️ [Auth] Token verification failed:', err.message);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

async function getOrCreateDevUser(role: RoleType) {
  const email = `dev-${role.toLowerCase()}@paypilot.internal`;
  let user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: `clerk_${role.toLowerCase()}_dev`,
        email,
        role: role as any,
      },
    });
  }

  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    role: user.role as RoleType,
    employeeId: user.employeeId,
  };
}

/**
 * Role-Based Access Control (RBAC) Guard
 */
export function requireRole(...allowedRoles: RoleType[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    // ADMIN always has full access
    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' does not have required permissions`,
        requiredRoles: allowedRoles,
      });
      return;
    }

    next();
  };
}
