import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { invalidateCache } from '../lib/redis';

export const sentinelRouter = Router();

// List all open flags
sentinelRouter.get('/flags', authenticate, async (req, res) => {
  try {
    const { status, severity } = req.query;

    const flags = await prisma.sentinelFlag.findMany({
      where: {
        status: status ? (status as any) : 'OPEN',
        severity: severity ? (severity as any) : undefined,
      },
      include: {
        payslip: {
          include: {
            employee: true,
            payrun: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: flags });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Resolve a Sentinel flag
sentinelRouter.post('/flags/:id/resolve', authenticate, requireRole('ADMIN', 'PAYROLL_OFFICER'), async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id as string;
    const flag = await prisma.sentinelFlag.findUnique({
      where: { id },
      include: { payslip: true },
    });

    if (!flag) {
      res.status(404).json({ error: 'Flag not found' });
      return;
    }

    const updatedFlag = await prisma.sentinelFlag.update({
      where: { id: flag.id },
      data: {
        status: 'RESOLVED',
        resolvedById: req.user?.id || null,
        resolvedAt: new Date(),
      },
    });

    // Create audit event
    if (req.user?.id) {
      await prisma.payrollAuditEvent.create({
        data: {
          entityType: 'SentinelFlag',
          entityId: flag.id,
          action: 'resolved',
          actorId: req.user.id,
          meta: { flagType: flag.flagType, payslipId: flag.payslipId },
        },
      });
    }

    await invalidateCache('kpi:*');
    res.json({ message: 'Sentinel flag resolved successfully', data: updatedFlag });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Override a Sentinel flag with explanation note
sentinelRouter.post('/flags/:id/override', authenticate, requireRole('ADMIN', 'PAYROLL_OFFICER'), async (req: AuthenticatedRequest, res) => {
  try {
    const { note } = req.body;
    if (!note) {
      res.status(400).json({ error: 'Override explanation note is required' });
      return;
    }

    const id = req.params.id as string;
    const updated = await prisma.sentinelFlag.update({
      where: { id },
      data: {
        status: 'OVERRIDDEN',
        overrideNote: note,
        resolvedById: req.user?.id || null,
        resolvedAt: new Date(),
      },
    });

    await invalidateCache('kpi:*');
    res.json({ message: 'Flag overridden with documented note', data: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
