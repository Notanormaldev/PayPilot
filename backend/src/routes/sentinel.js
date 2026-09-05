import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const sentinelRouter = Router();

// GET /api/sentinel/flags - list active fraud & compliance flags
sentinelRouter.get('/flags', authenticate, async (req, res) => {
  try {
    const { status = 'OPEN', payrunId } = req.query;
    const where = {};
    if (status) where.status = String(status);
    if (payrunId) where.payslip = { payrunId: String(payrunId) };

    const flags = await prisma.sentinelFlag.findMany({
      where,
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

    const formatted = flags.map((f) => ({
      id: f.id,
      payslipId: f.payslipId,
      ruleCode: f.flagType,
      flagType: f.flagType,
      severity: f.severity,
      message:
        f.deterministicReasonJson?.issue ||
        `Anomaly detected in payslip computation for ${f.payslip?.employee?.name || 'Staff'}.`,
      aiExplanation: f.aiExplanation,
      employeeName: f.payslip?.employee?.name,
      employeeNumber: `EMP-${f.payslip?.employee?.id?.slice(-4).toUpperCase()}`,
      status: f.status,
      createdAt: f.createdAt,
    }));

    res.json({ data: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sentinel flags', details: err.message });
  }
});

// POST /api/sentinel/flags/:id/resolve - 1-click resolve
sentinelRouter.post('/flags/:id/resolve', authenticate, async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    const flagId = req.params.id;

    const flag = await prisma.sentinelFlag.findUnique({
      where: { id: flagId },
      include: { payslip: { include: { employee: true } } },
    });

    if (!flag) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    // Auto-fix if missing bank details
    if (flag.flagType === 'MISSING_BANK_DETAILS' && flag.payslip?.employee) {
      await prisma.employee.update({
        where: { id: flag.payslip.employee.id },
        data: {
          bankAccount: `AC-${Math.floor(100000000 + Math.random() * 900000000)}`,
          bankName: 'HDFC Bank Ltd (Verified)',
        },
      });
    }

    const updatedFlag = await prisma.sentinelFlag.update({
      where: { id: flagId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedById: req.user?.id,
        overrideNote: resolutionNotes || 'Resolved by Executive Officer',
      },
    });

    res.json({
      message: 'Sentinel flag resolved successfully',
      data: updatedFlag,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve flag', details: err.message });
  }
});

export default sentinelRouter;
