import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { computeSalaryRules, resolveContractForPeriod } from '../lib/payroll-engine';
import { runSentinelAudit } from '../lib/sentinel';
import { invalidateCache } from '../lib/redis';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const payrunsRouter = Router();

// List payruns
payrunsRouter.get('/', authenticate, async (req, res) => {
  try {
    const payruns = await prisma.payrun.findMany({
      include: {
        salaryStructure: { select: { name: true } },
        _count: {
          select: { payslips: true },
        },
      },
      orderBy: { periodStart: 'desc' },
    });

    res.json({ data: payruns });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get payrun detail with payslips and flags
payrunsRouter.get('/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id as string;
    const payrun = await prisma.payrun.findUnique({
      where: { id },
      include: {
        salaryStructure: {
          include: { rules: { orderBy: { sequence: 'asc' } } },
        },
        payslips: {
          include: {
            employee: true,
            contract: true,
            lines: { orderBy: { sequence: 'asc' } },
            flags: true,
          },
        },
      },
    });

    if (!payrun) {
      res.status(404).json({ error: 'Payrun not found' });
      return;
    }

    res.json({ data: payrun });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create draft payrun
payrunsRouter.post('/', authenticate, requireRole('ADMIN', 'PAYROLL_OFFICER'), async (req, res) => {
  try {
    const { name, salaryStructureId, periodStart, periodEnd } = req.body;

    const payrun = await prisma.payrun.create({
      data: {
        name,
        salaryStructureId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        status: 'DRAFT',
      },
    });

    await invalidateCache('kpi:*');
    res.status(201).json({ data: payrun });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Compute payrun batch
payrunsRouter.post('/:id/compute', authenticate, requireRole('ADMIN', 'PAYROLL_OFFICER'), async (req, res) => {
  try {
    const id = req.params.id as string;
    const payrun = await prisma.payrun.findUnique({
      where: { id },
      include: {
        salaryStructure: {
          include: {
            rules: {
              where: { isActive: true },
              orderBy: { sequence: 'asc' },
            },
          },
        },
      },
    });

    if (!payrun || !payrun.salaryStructure) {
      res.status(404).json({ error: 'Payrun or Salary Structure not found' });
      return;
    }

    // Find all active employees
    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE' },
    });

    let computedCount = 0;

    for (const employee of employees) {
      const contract = await resolveContractForPeriod(employee.id, payrun.periodStart, payrun.periodEnd);
      if (!contract) continue;

      // Count attendance in period
      const attendances = await prisma.attendance.findMany({
        where: {
          employeeId: employee.id,
          date: { gte: payrun.periodStart, lte: payrun.periodEnd },
        },
      });

      const presentDays = attendances.filter((a) => a.status === 'PRESENT').length;
      const workedDays = presentDays > 0 ? presentDays : 22; // Standard 22 working days fallback

      // Calculate rule lines
      const computedLines = computeSalaryRules(payrun.salaryStructure.rules, {
        wage: Number(contract.wage),
        worked_days: workedDays,
        scheduled_days: 22,
      });

      // Upsert payslip
      const existingPayslip = await prisma.payslip.findUnique({
        where: {
          payrunId_employeeId: {
            payrunId: payrun.id,
            employeeId: employee.id,
          },
        },
      });

      let payslipId = existingPayslip?.id;

      if (existingPayslip) {
        // Delete old lines
        await prisma.payslipLine.deleteMany({ where: { payslipId: existingPayslip.id } });
        await prisma.payslip.update({
          where: { id: existingPayslip.id },
          data: {
            workedDays,
            status: 'COMPUTED',
          },
        });
      } else {
        const created = await prisma.payslip.create({
          data: {
            payrunId: payrun.id,
            employeeId: employee.id,
            contractId: contract.id,
            workedDays,
            status: 'COMPUTED',
          },
        });
        payslipId = created.id;
      }

      // Create lines
      if (payslipId) {
        await prisma.payslipLine.createMany({
          data: computedLines.map((l) => ({
            payslipId,
            salaryRuleId: l.ruleId,
            code: l.code,
            name: l.name,
            category: l.category,
            sequence: l.sequence,
            amount: l.amount,
          })),
        });

        // Run Sentinel anomaly audit
        await runSentinelAudit(payslipId);
        computedCount++;
      }
    }

    // Update payrun status to COMPUTED
    await prisma.payrun.update({
      where: { id: payrun.id },
      data: { status: 'COMPUTED' },
    });

    await invalidateCache('kpi:*');
    res.json({ message: `Successfully computed ${computedCount} payslips`, computedCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Download payslip PDF
payrunsRouter.get('/payslips/:payslipId/pdf', authenticate, async (req, res) => {
  try {
    const payslipId = req.params.payslipId as string;
    const payslip = await prisma.payslip.findUnique({
      where: { id: payslipId },
      include: {
        employee: true,
        payrun: true,
        lines: { orderBy: { sequence: 'asc' } },
      },
    });

    if (!payslip || !payslip.employee || !payslip.payrun) {
      res.status(404).json({ error: 'Payslip not found' });
      return;
    }

    // Generate crisp, professional dark/light payslip PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 750]);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header Branding
    page.drawText('PAYPILOT HRMS — OFFICIAL PAYSLIP', {
      x: 50,
      y: 690,
      size: 16,
      font,
      color: rgb(0.05, 0.05, 0.08),
    });

    page.drawText(`Pay Period: ${payslip.payrun.name}`, {
      x: 50,
      y: 670,
      size: 10,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.4),
    });

    // Employee Meta Box
    page.drawRectangle({
      x: 50,
      y: 570,
      width: 500,
      height: 80,
      borderColor: rgb(0.85, 0.88, 0.92),
      borderWidth: 1,
      color: rgb(0.97, 0.98, 0.99),
    });

    page.drawText(`Employee: ${payslip.employee.name}`, { x: 70, y: 625, size: 11, font });
    page.drawText(`Email: ${payslip.employee.workEmail}`, { x: 70, y: 605, size: 9, font: fontRegular });
    page.drawText(`Department: ${payslip.employee.department}`, { x: 300, y: 625, size: 10, font });
    page.drawText(`Position: ${payslip.employee.jobPosition}`, { x: 300, y: 605, size: 9, font: fontRegular });
    page.drawText(`Worked Days: ${payslip.workedDays}`, { x: 300, y: 585, size: 9, font: fontRegular });

    // Table Header
    let currentY = 530;
    page.drawText('RULE / COMPONENT', { x: 50, y: currentY, size: 10, font });
    page.drawText('CATEGORY', { x: 300, y: currentY, size: 10, font });
    page.drawText('AMOUNT (INR)', { x: 450, y: currentY, size: 10, font });

    page.drawLine({
      start: { x: 50, y: currentY - 5 },
      end: { x: 550, y: currentY - 5 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    currentY -= 25;

    for (const line of payslip.lines) {
      page.drawText(`${line.name} (${line.code})`, { x: 50, y: currentY, size: 9, font: fontRegular });
      page.drawText(`${line.category}`, { x: 300, y: currentY, size: 9, font: fontRegular });
      page.drawText(`₹${Number(line.amount).toLocaleString('en-IN')}`, { x: 450, y: currentY, size: 9, font });
      currentY -= 20;
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Payslip_${payslip.employee.name.replace(/\s+/g, '_')}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
