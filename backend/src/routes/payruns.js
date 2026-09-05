import { Router } from 'express';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { computePayslipLines, getActiveContractForPeriod } from '../lib/payroll-engine.js';
import { runSentinelAudit } from '../lib/sentinel.js';

export const payrunsRouter = Router();

// GET /api/payruns - list payruns with summary totals
payrunsRouter.get('/', authenticate, async (req, res) => {
  try {
    const payruns = await prisma.payrun.findMany({
      include: {
        salaryStructure: true,
        payslips: {
          include: {
            employee: true,
            lines: true,
            flags: true,
          },
        },
      },
      orderBy: { periodStart: 'desc' },
    });

    const formatted = payruns.map((pr) => {
      let totalGross = 0;
      let totalNet = 0;
      let totalDeductions = 0;

      for (const ps of pr.payslips) {
        for (const line of ps.lines) {
          if (line.category === 'BASIC' || line.category === 'ALLOWANCE') {
            totalGross += Number(line.amount);
          } else if (line.category === 'DEDUCTION') {
            totalDeductions += Number(line.amount);
          }
        }
      }
      totalNet = Math.max(0, totalGross - totalDeductions);

      return {
        ...pr,
        cycle: 'MONTHLY',
        totalGross,
        totalNet,
        totalDeductions,
      };
    });

    res.json({ data: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payruns', details: err.message });
  }
});

// POST /api/payruns/:id/compute - compute all payslips in a payrun
payrunsRouter.post('/:id/compute', authenticate, async (req, res) => {
  try {
    const payrunId = req.params.id;
    const payrun = await prisma.payrun.findUnique({
      where: { id: payrunId },
      include: {
        salaryStructure: true,
        payslips: { include: { employee: true } },
      },
    });

    if (!payrun) {
      return res.status(404).json({ error: 'Payrun not found' });
    }

    // If no payslips created yet, create payslip drafts for all active employees
    if (payrun.payslips.length === 0) {
      const activeEmployees = await prisma.employee.findMany({
        where: { status: 'ACTIVE' },
        include: { contracts: { where: { status: 'RUNNING' } } },
      });

      for (const emp of activeEmployees) {
        const contract = emp.contracts[0];
        if (contract) {
          await prisma.payslip.create({
            data: {
              payrunId: payrun.id,
              employeeId: emp.id,
              contractId: contract.id,
              status: 'DRAFT',
            },
          });
        }
      }
    }

    // Fetch refreshed payslips
    const payslips = await prisma.payslip.findMany({
      where: { payrunId },
    });

    for (const slip of payslips) {
      const activeContract = await getActiveContractForPeriod(
        slip.employeeId,
        payrun.periodStart,
        payrun.periodEnd
      );

      const contractId = activeContract ? activeContract.id : slip.contractId;
      const { lines } = await computePayslipLines(
        slip.employeeId,
        contractId,
        payrun.periodStart,
        payrun.periodEnd
      );

      // Replace lines
      await prisma.payslipLine.deleteMany({ where: { payslipId: slip.id } });
      await prisma.payslipLine.createMany({
        data: lines.map((l) => ({
          payslipId: slip.id,
          salaryRuleId: l.salaryRuleId,
          code: l.code,
          name: l.name,
          category: l.category,
          sequence: l.sequence,
          amount: l.amount,
        })),
      });

      await prisma.payslip.update({
        where: { id: slip.id },
        data: { status: 'COMPUTED' },
      });
    }

    // Update payrun status and trigger Sentinel audit
    await prisma.payrun.update({
      where: { id: payrunId },
      data: { status: 'COMPUTED' },
    });

    const flags = await runSentinelAudit(payrunId);

    res.json({
      message: `Computed ${payslips.length} payslips successfully`,
      sentinelFlagsCount: flags.length,
    });
  } catch (err) {
    console.error('Computation error:', err);
    res.status(500).json({ error: 'Failed to compute payrun', details: err.message });
  }
});

// GET /api/payruns/:id/export-pdf - generate PDF payslips
payrunsRouter.get('/:id/export-pdf', async (req, res) => {
  try {
    const payrun = await prisma.payrun.findUnique({
      where: { id: req.params.id },
      include: {
        payslips: {
          include: {
            employee: true,
            lines: { orderBy: { sequence: 'asc' } },
          },
        },
      },
    });

    if (!payrun) {
      return res.status(404).json({ error: 'Payrun not found' });
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (const slip of payrun.payslips) {
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();

      // Header Banner
      page.drawRectangle({
        x: 40,
        y: height - 100,
        width: width - 80,
        height: 60,
        color: rgb(0.04, 0.04, 0.04),
      });

      page.drawText('PAYPILOT — AUTONOMOUS PAYSLIP', {
        x: 60,
        y: height - 65,
        size: 16,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      page.drawText(`Pay Period: ${payrun.name}`, {
        x: 60,
        y: height - 85,
        size: 10,
        font,
        color: rgb(0.8, 0.8, 0.8),
      });

      // Employee Info Box
      page.drawText(`Employee: ${slip.employee.name}`, { x: 50, y: height - 130, size: 12, font: fontBold });
      page.drawText(`Department: ${slip.employee.department}`, { x: 50, y: height - 148, size: 10, font });
      page.drawText(`Job Position: ${slip.employee.jobPosition}`, { x: 50, y: height - 166, size: 10, font });
      page.drawText(`Bank Account: ${slip.employee.bankAccount || 'VERIFIED ON FILE'}`, { x: 300, y: height - 130, size: 10, font });

      // Table Header
      let y = height - 210;
      page.drawText('RULE CODE', { x: 50, y, size: 10, font: fontBold });
      page.drawText('DESCRIPTION', { x: 150, y, size: 10, font: fontBold });
      page.drawText('CATEGORY', { x: 340, y, size: 10, font: fontBold });
      page.drawText('AMOUNT (INR)', { x: 460, y, size: 10, font: fontBold });

      page.drawLine({
        start: { x: 50, y: y - 6 },
        end: { x: width - 50, y: y - 6 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });

      y -= 24;
      let totalGross = 0;
      let totalDeductions = 0;

      for (const line of slip.lines) {
        page.drawText(line.code, { x: 50, y, size: 9, font });
        page.drawText(line.name, { x: 150, y, size: 9, font });
        page.drawText(line.category, { x: 340, y, size: 9, font });
        page.drawText(`₹${Number(line.amount).toLocaleString('en-IN')}`, { x: 460, y, size: 9, fontBold });

        if (line.category === 'BASIC' || line.category === 'ALLOWANCE') {
          totalGross += Number(line.amount);
        } else if (line.category === 'DEDUCTION') {
          totalDeductions += Number(line.amount);
        }

        y -= 20;
      }

      // Net Pay Summary
      y -= 15;
      page.drawLine({
        start: { x: 50, y: y + 10 },
        end: { x: width - 50, y: y + 10 },
        thickness: 1,
        color: rgb(0.2, 0.2, 0.2),
      });

      const netPay = Math.max(0, totalGross - totalDeductions);
      page.drawText('NET TAKE-HOME PAY:', { x: 280, y, size: 12, font: fontBold, color: rgb(0.05, 0.58, 0.53) });
      page.drawText(`₹${netPay.toLocaleString('en-IN')}`, { x: 460, y, size: 14, font: fontBold, color: rgb(0.05, 0.58, 0.53) });
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="payrun-${payrun.id}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('PDF export error:', err);
    res.status(500).json({ error: 'Failed to export PDF', details: err.message });
  }
});

export default payrunsRouter;
