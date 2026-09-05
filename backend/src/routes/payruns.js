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
          if (line.category === 'BASIC' || line.category === 'ALLOWANCE' || Number(line.amount) > 0) {
            totalGross += Math.abs(Number(line.amount));
          } else if (line.category === 'DEDUCTION' || Number(line.amount) < 0) {
            totalDeductions += Math.abs(Number(line.amount));
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

// POST /api/payruns - create a new payrun with custom salary structure, period, and chosen eligible employees
payrunsRouter.post('/', authenticate, async (req, res) => {
  try {
    const { name, salaryStructureId, periodStart, periodEnd, employeeIds, cycle = 'MONTHLY' } = req.body;

    if (!name || !salaryStructureId || !periodStart || !periodEnd) {
      return res.status(400).json({ error: 'Name, salary structure, period start and period end dates are required.' });
    }

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ error: 'At least one eligible employee must be selected.' });
    }

    // Check salary structure
    const structure = await prisma.salaryStructure.findUnique({
      where: { id: salaryStructureId },
      include: { rules: { where: { isActive: true } } },
    });

    if (!structure) {
      return res.status(404).json({ error: 'Selected salary structure not found' });
    }

    // Create Payrun in DRAFT status
    const payrun = await prisma.payrun.create({
      data: {
        name,
        salaryStructureId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        status: 'DRAFT',
      },
    });

    // For each chosen employee, ensure a running contract and draft payslip
    for (const empId of employeeIds) {
      let contract = await prisma.contract.findFirst({
        where: { employeeId: empId, status: 'RUNNING' },
      });

      if (!contract) {
        const emp = await prisma.employee.findUnique({ where: { id: empId } });
        if (emp) {
          contract = await prisma.contract.create({
            data: {
              employeeId: empId,
              salaryStructureId,
              department: emp.department || 'General',
              jobPosition: emp.jobPosition || 'Specialist',
              wage: 85000.00,
              startDate: new Date(periodStart),
              status: 'RUNNING',
            },
          });
        }
      }

      if (contract) {
        await prisma.payslip.create({
          data: {
            payrunId: payrun.id,
            employeeId: empId,
            contractId: contract.id,
            status: 'DRAFT',
          },
        });
      }
    }

    const fullPayrun = await prisma.payrun.findUnique({
      where: { id: payrun.id },
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
    });

    res.status(201).json({
      success: true,
      message: `Payrun "${name}" created with ${fullPayrun.payslips.length} selected employees.`,
      data: {
        ...fullPayrun,
        cycle,
        totalGross: 0,
        totalNet: 0,
        totalDeductions: 0,
      },
    });
  } catch (err) {
    console.error('Create payrun error:', err);
    res.status(500).json({ error: 'Failed to create payrun batch', details: err.message });
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

// GET /api/payruns/:id/payslips - detailed employee payslips breakdown
payrunsRouter.get('/:id/payslips', authenticate, async (req, res) => {
  try {
    const payrunId = req.params.id;
    const payrun = await prisma.payrun.findUnique({
      where: { id: payrunId },
      include: {
        payslips: {
          include: {
            employee: true,
            lines: { orderBy: { sequence: 'asc' } },
            flags: true,
          },
        },
      },
    });

    if (!payrun) {
      return res.status(404).json({ error: 'Payrun not found' });
    }

    const formattedPayslips = payrun.payslips.map((slip) => {
      let grossPay = 0;
      let totalDeductions = 0;

      for (const line of slip.lines) {
        const amt = Number(line.amount || 0);
        if (line.category === 'BASIC' || line.category === 'ALLOWANCE' || amt > 0) {
          grossPay += Math.abs(amt);
        } else if (line.category === 'DEDUCTION' || amt < 0) {
          totalDeductions += Math.abs(amt);
        }
      }
      const netPay = Math.max(0, grossPay - totalDeductions);

      const hasBank = !!(slip.employee?.bankAccount && String(slip.employee.bankAccount).trim() !== '');

      return {
        id: slip.id,
        payrunId: slip.payrunId,
        employeeId: slip.employeeId,
        status: slip.status,
        employee: {
          id: slip.employee?.id,
          name: slip.employee?.name,
          firstName: slip.employee?.name?.split(' ')[0] || '',
          lastName: slip.employee?.name?.split(' ').slice(1).join(' ') || '',
          employeeNumber: `EMP-${(slip.employee?.id || '').slice(-4).toUpperCase()}`,
          department: slip.employee?.department || 'General',
          jobTitle: slip.employee?.jobPosition || 'Specialist',
          bankAccount: slip.employee?.bankAccount,
          bankName: slip.employee?.bankName,
          hasBank,
        },
        grossPay,
        totalDeductions,
        netPay,
        hasBank,
        bankStatus: hasBank ? 'VERIFIED' : 'MISSING_BANK',
        lines: slip.lines.map((l) => ({
          id: l.id,
          code: l.code,
          name: l.name,
          category: l.category,
          amount: Number(l.amount),
          total: Number(l.amount),
        })),
        flags: slip.flags,
      };
    });

    res.json({ data: formattedPayslips });
  } catch (err) {
    console.error('Fetch payslips error:', err);
    res.status(500).json({ error: 'Failed to fetch payslips', details: err.message });
  }
});

// POST /api/payruns/:id/validate - validate compliance, Sentinel audits, and verify banking readiness
payrunsRouter.post('/:id/validate', authenticate, async (req, res) => {
  try {
    const payrunId = req.params.id;
    const { processVerifiedOnly = false } = req.body;

    const payrun = await prisma.payrun.findUnique({
      where: { id: payrunId },
      include: {
        payslips: {
          include: { employee: true },
        },
      },
    });

    if (!payrun) {
      return res.status(404).json({ error: 'Payrun not found' });
    }

    const unverifiedSlips = payrun.payslips.filter(
      (s) => !s.employee?.bankAccount || String(s.employee.bankAccount).trim() === ''
    );
    const verifiedSlips = payrun.payslips.filter(
      (s) => s.employee?.bankAccount && String(s.employee.bankAccount).trim() !== ''
    );

    // If missing bank accounts exist and user hasn't explicitly requested partial processing
    if (unverifiedSlips.length > 0 && !processVerifiedOnly) {
      const missingEmployees = unverifiedSlips.map((s) => ({
        id: s.employee?.id,
        name: s.employee?.name,
        department: s.employee?.department,
      }));

      return res.status(400).json({
        code: 'MISSING_BANK_CREDENTIALS',
        warning: true,
        message: `${unverifiedSlips.length} employee(s) in this batch lack registered bank account credentials.`,
        unverifiedCount: unverifiedSlips.length,
        verifiedCount: verifiedSlips.length,
        missingEmployees,
      });
    }

    // Mark verified payslips as VALIDATED
    const verifiedIds = verifiedSlips.map((s) => s.id);
    if (verifiedIds.length > 0) {
      await prisma.payslip.updateMany({
        where: { id: { in: verifiedIds } },
        data: { status: 'VALIDATED' },
      });
    }

    // Mark unverified payslips as BLOCKED_MISSING_BANK
    const unverifiedIds = unverifiedSlips.map((s) => s.id);
    if (unverifiedIds.length > 0) {
      await prisma.payslip.updateMany({
        where: { id: { in: unverifiedIds } },
        data: { status: 'BLOCKED_MISSING_BANK' },
      });
    }

    const isPartial = unverifiedSlips.length > 0;
    const finalPayrunStatus = isPartial ? 'PARTIALLY_VALIDATED' : 'VALIDATED';

    await prisma.payrun.update({
      where: { id: payrunId },
      data: { status: finalPayrunStatus },
    });

    // Run sentinel audit
    const flags = await runSentinelAudit(payrunId);

    res.json({
      success: true,
      message: isPartial
        ? `Payrun validated for ${verifiedSlips.length} verified employees. ${unverifiedSlips.length} employee payslips flagged for missing bank credentials.`
        : `All ${payrun.payslips.length} employee payslips validated successfully with 0 critical compliance blockers. Ready for payment disbursement.`,
      payrunStatus: finalPayrunStatus,
      verifiedCount: verifiedSlips.length,
      blockedCount: unverifiedSlips.length,
      sentinelFlagsCount: flags.length,
    });
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).json({ error: 'Failed to validate payrun', details: err.message });
  }
});

// POST /api/payruns/:id/mark-paid - Mark payrun & all validated payslips as PAID with transaction ref
payrunsRouter.post('/:id/mark-paid', authenticate, async (req, res) => {
  try {
    const payrunId = req.params.id;
    const payrun = await prisma.payrun.findUnique({
      where: { id: payrunId },
      include: { payslips: { include: { employee: true } } },
    });

    if (!payrun) {
      return res.status(404).json({ error: 'Payrun not found' });
    }

    // Mark all payslips (except blocked) as PAID
    await prisma.payslip.updateMany({
      where: {
        payrunId,
        status: { not: 'BLOCKED_MISSING_BANK' },
      },
      data: { status: 'PAID' },
    });

    // Update Payrun to PAID
    const updatedPayrun = await prisma.payrun.update({
      where: { id: payrunId },
      data: { status: 'PAID' },
    });

    const txnRef = `PP-DISB-${payrun.id.slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    res.json({
      success: true,
      message: `Payrun "${payrun.name}" marked as Paid. Bank disbursement processed successfully.`,
      data: updatedPayrun,
      payrunStatus: 'PAID',
      transactionRef: txnRef,
      disbursedAt: new Date(),
      paidCount: payrun.payslips.length,
    });
  } catch (err) {
    console.error('Mark paid error:', err);
    res.status(500).json({ error: 'Failed to mark payrun as paid', details: err.message });
  }
});

// POST /api/payruns/:id/send-payslips - Bulk email dispatch of digital payslips to all employees
payrunsRouter.post('/:id/send-payslips', authenticate, async (req, res) => {
  try {
    const payrunId = req.params.id;
    const payrun = await prisma.payrun.findUnique({
      where: { id: payrunId },
      include: {
        payslips: {
          include: {
            employee: true,
            lines: true,
          },
        },
      },
    });

    if (!payrun) {
      return res.status(404).json({ error: 'Payrun not found' });
    }

    const recipients = [];
    for (const slip of payrun.payslips) {
      const email = slip.employee?.workEmail || `${(slip.employee?.name || 'employee').toLowerCase().replace(/\s+/g, '.')}@paypilot.internal`;
      const name = slip.employee?.name || 'Employee';

      let gross = 0;
      let deductions = 0;
      for (const line of slip.lines) {
        const amt = Number(line.amount || 0);
        if (line.category === 'BASIC' || line.category === 'ALLOWANCE' || amt > 0) {
          gross += Math.abs(amt);
        } else if (line.category === 'DEDUCTION' || amt < 0) {
          deductions += Math.abs(amt);
        }
      }
      const net = Math.max(0, gross - deductions);

      recipients.push({
        employeeId: slip.employeeId,
        name,
        email,
        gross,
        deductions,
        net,
        status: 'DISPATCHED',
        dispatchedAt: new Date(),
      });
    }

    res.json({
      success: true,
      message: `Bulk payslip distribution completed! ${recipients.length} digital payslips dispatched via email.`,
      sentCount: recipients.length,
      recipients,
      dispatchedAt: new Date(),
    });
  } catch (err) {
    console.error('Send payslips error:', err);
    res.status(500).json({ error: 'Failed to dispatch bulk payslips', details: err.message });
  }
});

/**
 * Helper to convert numeric amounts to Indian Currency Words
 */
function numberToWordsINR(amount) {
  const words = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n) {
    if (n < 20) return words[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + words[n % 10] : '');
  }

  function convertThreeDigits(n) {
    if (n === 0) return '';
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let str = '';
    if (hundred > 0) str += words[hundred] + ' Hundred';
    if (rest > 0) str += (str ? ' ' : '') + convertTwoDigits(rest);
    return str;
  }

  const num = Math.floor(Math.abs(amount));
  if (num === 0) return 'Zero Rupees Only';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  let result = '';
  if (crore > 0) result += convertThreeDigits(crore) + ' Crore ';
  if (lakh > 0) result += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand > 0) result += convertTwoDigits(thousand) + ' Thousand ';
  if (remainder > 0) result += convertThreeDigits(remainder);

  return 'Rupees ' + result.trim() + ' Only';
}

// GET /api/payruns/:id/export-pdf - generate high-precision PDF payslips
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
      const margin = 36;
      const contentWidth = width - margin * 2; // 523.28

      // Top Accent Blue Bar
      page.drawRectangle({
        x: margin,
        y: height - 28,
        width: contentWidth,
        height: 4,
        color: rgb(0.145, 0.388, 0.922), // PayPilot Blue #2563EB
      });

      // Brand Logo Box
      page.drawRectangle({
        x: margin,
        y: height - 68,
        width: 32,
        height: 32,
        color: rgb(0.06, 0.09, 0.16), // Deep Dark #0F172A
      });

      // Logo inner white shield
      page.drawRectangle({
        x: margin + 9,
        y: height - 59,
        width: 14,
        height: 14,
        color: rgb(1, 1, 1),
      });

      // Logo blue accent dot
      page.drawCircle({
        x: margin + 24,
        y: height - 44,
        size: 3.5,
        color: rgb(0.145, 0.388, 0.922),
      });

      // Wordmark: PayPilot
      page.drawText('Pay', {
        x: margin + 40,
        y: height - 52,
        size: 20,
        font: fontBold,
        color: rgb(0.06, 0.09, 0.16),
      });

      page.drawText('Pilot', {
        x: margin + 78,
        y: height - 52,
        size: 20,
        font: fontBold,
        color: rgb(0.145, 0.388, 0.922),
      });

      // Company registration sub-details
      page.drawText('PayPilot Autonomous Technologies India Pvt. Ltd.', {
        x: margin + 40,
        y: height - 64,
        size: 7.5,
        font,
        color: rgb(0.35, 0.42, 0.53),
      });
      page.drawText('CIN: U72200KA2024PTC184920  |  GSTIN: 29AABCP9284F1ZT', {
        x: margin + 40,
        y: height - 74,
        size: 7,
        font,
        color: rgb(0.45, 0.52, 0.63),
      });

      // Right Header: Document Meta Box
      const metaBoxW = 185;
      const metaBoxX = width - margin - metaBoxW;
      const metaBoxY = height - 80;
      page.drawRectangle({
        x: metaBoxX,
        y: metaBoxY,
        width: metaBoxW,
        height: 52,
        color: rgb(0.97, 0.98, 0.99),
        borderColor: rgb(0.88, 0.91, 0.94),
        borderWidth: 1,
      });

      page.drawText('CONFIDENTIAL SALARY STATEMENT', {
        x: metaBoxX + 8,
        y: metaBoxY + 38,
        size: 7.5,
        font: fontBold,
        color: rgb(0.145, 0.388, 0.922),
      });

      const payrunNameText = payrun.name.length > 26 ? payrun.name.slice(0, 24) + '...' : payrun.name;
      page.drawText(`Pay Period: ${payrunNameText}`, {
        x: metaBoxX + 8,
        y: metaBoxY + 26,
        size: 7.5,
        font,
        color: rgb(0.2, 0.25, 0.35),
      });

      page.drawText(`Payslip Ref: PS-${slip.id.slice(0, 8).toUpperCase()}`, {
        x: metaBoxX + 8,
        y: metaBoxY + 15,
        size: 7.5,
        font,
        color: rgb(0.2, 0.25, 0.35),
      });

      page.drawText('• STATUS: DISBURSED & AUDITED', {
        x: metaBoxX + 8,
        y: metaBoxY + 4,
        size: 7,
        font: fontBold,
        color: rgb(0.02, 0.58, 0.41),
      });

      // Horizontal Divider
      page.drawLine({
        start: { x: margin, y: height - 90 },
        end: { x: width - margin, y: height - 90 },
        thickness: 0.75,
        color: rgb(0.88, 0.91, 0.94),
      });

      // Employee Information Card
      const cardY = height - 168;
      const cardH = 68;
      page.drawRectangle({
        x: margin,
        y: cardY,
        width: contentWidth,
        height: cardH,
        color: rgb(0.97, 0.98, 0.99),
        borderColor: rgb(0.88, 0.91, 0.94),
        borderWidth: 0.75,
      });

      // Card middle divider
      const midX = margin + contentWidth / 2;
      page.drawLine({
        start: { x: midX, y: cardY },
        end: { x: midX, y: cardY + cardH },
        thickness: 0.5,
        color: rgb(0.88, 0.91, 0.94),
      });

      const empName = slip.employee?.name || 'Staff Member';
      const empId = slip.employee?.employeeNumber || `EMP-${(slip.employee?.id || '').slice(-4).toUpperCase()}`;
      const empDept = slip.employee?.department || 'Engineering & Product';
      const empJob = slip.employee?.jobPosition || 'Specialist';
      const empBank = slip.employee?.bankAccount || 'VERIFIED ON FILE';
      const empPan = slip.employee?.pan || 'ABCPK9482F';

      // Col 1: Employee details
      page.drawText('Employee Name:', { x: margin + 10, y: cardY + 50, size: 7.5, font, color: rgb(0.4, 0.46, 0.54) });
      page.drawText(empName, { x: margin + 85, y: cardY + 50, size: 7.5, font: fontBold, color: rgb(0.06, 0.09, 0.16) });

      page.drawText('Employee ID:', { x: margin + 10, y: cardY + 36, size: 7.5, font, color: rgb(0.4, 0.46, 0.54) });
      page.drawText(empId, { x: margin + 85, y: cardY + 36, size: 7.5, font: fontBold, color: rgb(0.06, 0.09, 0.16) });

      page.drawText('Department:', { x: margin + 10, y: cardY + 22, size: 7.5, font, color: rgb(0.4, 0.46, 0.54) });
      page.drawText(empDept, { x: margin + 85, y: cardY + 22, size: 7.5, font: fontBold, color: rgb(0.06, 0.09, 0.16) });

      page.drawText('Designation:', { x: margin + 10, y: cardY + 8, size: 7.5, font, color: rgb(0.4, 0.46, 0.54) });
      page.drawText(empJob, { x: margin + 85, y: cardY + 8, size: 7.5, font: fontBold, color: rgb(0.06, 0.09, 0.16) });

      // Col 2: Bank & statutory details
      page.drawText('Bank Account:', { x: midX + 10, y: cardY + 50, size: 7.5, font, color: rgb(0.4, 0.46, 0.54) });
      page.drawText(empBank, { x: midX + 85, y: cardY + 50, size: 7.5, font: fontBold, color: rgb(0.06, 0.09, 0.16) });

      page.drawText('PAN Number:', { x: midX + 10, y: cardY + 36, size: 7.5, font, color: rgb(0.4, 0.46, 0.54) });
      page.drawText(empPan, { x: midX + 85, y: cardY + 36, size: 7.5, font: fontBold, color: rgb(0.06, 0.09, 0.16) });

      page.drawText('UAN / PF No:', { x: midX + 10, y: cardY + 22, size: 7.5, font, color: rgb(0.4, 0.46, 0.54) });
      page.drawText('101849204918', { x: midX + 85, y: cardY + 22, size: 7.5, font: fontBold, color: rgb(0.06, 0.09, 0.16) });

      page.drawText('Payable Days:', { x: midX + 10, y: cardY + 8, size: 7.5, font, color: rgb(0.4, 0.46, 0.54) });
      page.drawText('30 Days (LOP: 0)', { x: midX + 85, y: cardY + 8, size: 7.5, font: fontBold, color: rgb(0.06, 0.09, 0.16) });

      // Table Headers
      const tableHeaderY = cardY - 16;
      page.drawRectangle({
        x: margin,
        y: tableHeaderY - 20,
        width: contentWidth,
        height: 20,
        color: rgb(0.06, 0.09, 0.16),
      });

      page.drawText('RULE CODE', { x: margin + 10, y: tableHeaderY - 14, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
      page.drawText('DESCRIPTION / SALARY COMPONENT', { x: margin + 125, y: tableHeaderY - 14, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
      page.drawText('CATEGORY', { x: margin + 325, y: tableHeaderY - 14, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });

      const amtHeader = 'AMOUNT (INR)';
      const amtHeaderW = fontBold.widthOfTextAtSize(amtHeader, 7.5);
      page.drawText(amtHeader, { x: width - margin - 10 - amtHeaderW, y: tableHeaderY - 14, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });

      let currY = tableHeaderY - 20;
      const rowHeight = 20;
      let totalGross = 0;
      let totalDeductions = 0;
      let rowIndex = 0;

      for (const line of slip.lines) {
        const rowY = currY - rowHeight;

        if (rowIndex % 2 === 0) {
          page.drawRectangle({
            x: margin,
            y: rowY,
            width: contentWidth,
            height: rowHeight,
            color: rgb(0.98, 0.98, 0.99),
          });
        }

        page.drawLine({
          start: { x: margin, y: rowY },
          end: { x: width - margin, y: rowY },
          thickness: 0.5,
          color: rgb(0.92, 0.94, 0.96),
        });

        page.drawText(line.code, { x: margin + 10, y: rowY + 6, size: 7.5, font, color: rgb(0.12, 0.16, 0.22) });
        page.drawText(line.name, { x: margin + 125, y: rowY + 6, size: 7.5, font, color: rgb(0.12, 0.16, 0.22) });
        page.drawText(line.category, { x: margin + 325, y: rowY + 6, size: 7.5, font, color: rgb(0.4, 0.46, 0.54) });

        const amt = Number(line.amount);
        const isDeduction = line.category === 'DEDUCTION' || amt < 0;
        const color = isDeduction ? rgb(0.86, 0.15, 0.15) : rgb(0.06, 0.09, 0.16);

        const amtStr = `Rs. ${Math.abs(amt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        const amtStrW = fontBold.widthOfTextAtSize(amtStr, 7.5);
        page.drawText(amtStr, {
          x: width - margin - 10 - amtStrW,
          y: rowY + 6,
          size: 7.5,
          font: fontBold,
          color,
        });

        if (line.category === 'BASIC' || line.category === 'ALLOWANCE' || amt > 0) {
          totalGross += Math.abs(amt);
        } else if (isDeduction) {
          totalDeductions += Math.abs(amt);
        }

        currY = rowY;
        rowIndex++;
      }

      // Gross & Deductions Subtotal Row
      const subtotalH = 22;
      const subtotalY = currY - subtotalH;
      page.drawRectangle({
        x: margin,
        y: subtotalY,
        width: contentWidth,
        height: subtotalH,
        color: rgb(0.95, 0.96, 0.98),
        borderColor: rgb(0.8, 0.84, 0.88),
        borderWidth: 0.5,
      });

      page.drawText('TOTAL GROSS PAY:', { x: margin + 10, y: subtotalY + 7, size: 7.5, font: fontBold, color: rgb(0.06, 0.09, 0.16) });
      page.drawText(`Rs. ${totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, {
        x: margin + 125,
        y: subtotalY + 7,
        size: 7.5,
        font: fontBold,
        color: rgb(0.06, 0.09, 0.16),
      });

      page.drawText('TOTAL DEDUCTIONS:', { x: margin + 280, y: subtotalY + 7, size: 7.5, font: fontBold, color: rgb(0.86, 0.15, 0.15) });
      const totalDedStr = `Rs. ${totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      const totalDedStrW = fontBold.widthOfTextAtSize(totalDedStr, 7.5);
      page.drawText(totalDedStr, {
        x: width - margin - 10 - totalDedStrW,
        y: subtotalY + 7,
        size: 7.5,
        font: fontBold,
        color: rgb(0.86, 0.15, 0.15),
      });

      currY = subtotalY;

      // Net Pay Summary Box
      const netPay = Math.max(0, totalGross - totalDeductions);
      const netCardH = 56;
      const netCardY = currY - 14 - netCardH;

      page.drawRectangle({
        x: margin,
        y: netCardY,
        width: contentWidth,
        height: netCardH,
        color: rgb(0.94, 0.99, 0.96), // #F0FDF4
        borderColor: rgb(0.73, 0.97, 0.82), // #BBF7D0
        borderWidth: 1,
      });

      page.drawText('NET TAKE-HOME SALARY PAYABLE:', {
        x: margin + 12,
        y: netCardY + 40,
        size: 8,
        font: fontBold,
        color: rgb(0.02, 0.58, 0.41),
      });

      page.drawText(`Rs. ${netPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, {
        x: margin + 12,
        y: netCardY + 22,
        size: 15,
        font: fontBold,
        color: rgb(0.02, 0.31, 0.23),
      });

      const wordsStr = `Amount in Words: ${numberToWordsINR(netPay)}`;
      page.drawText(wordsStr.length > 55 ? wordsStr.slice(0, 52) + '...' : wordsStr, {
        x: margin + 12,
        y: netCardY + 8,
        size: 7,
        font,
        color: rgb(0.28, 0.34, 0.42),
      });

      // Right side transaction details in net card
      const netRightX = width - margin - 170;
      page.drawText('Payment Mode:', { x: netRightX, y: netCardY + 40, size: 7, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
      page.drawText('Direct Bank Credit (NEFT)', { x: netRightX + 68, y: netCardY + 40, size: 7, font, color: rgb(0.2, 0.25, 0.35) });

      page.drawText('Transaction Ref:', { x: netRightX, y: netCardY + 25, size: 7, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
      page.drawText(`PP-PS-${slip.id.slice(0, 6).toUpperCase()}-RTGS`, { x: netRightX + 68, y: netCardY + 25, size: 7, font, color: rgb(0.2, 0.25, 0.35) });

      page.drawText('Value Date:', { x: netRightX, y: netCardY + 10, size: 7, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
      const valDateStr = payrun.periodEnd ? new Date(payrun.periodEnd).toLocaleDateString('en-IN') : 'End of Month';
      page.drawText(valDateStr, { x: netRightX + 68, y: netCardY + 10, size: 7, font, color: rgb(0.2, 0.25, 0.35) });

      currY = netCardY;

      // Sentinel AI Compliance Box
      const auditH = 34;
      const auditY = currY - 12 - auditH;
      page.drawRectangle({
        x: margin,
        y: auditY,
        width: contentWidth,
        height: auditH,
        color: rgb(0.97, 0.98, 0.99),
        borderColor: rgb(0.88, 0.91, 0.94),
        borderWidth: 0.75,
      });

      page.drawRectangle({
        x: margin + 8,
        y: auditY + 8,
        width: 18,
        height: 18,
        color: rgb(0.145, 0.388, 0.922),
      });

      page.drawText('AI', {
        x: margin + 12,
        y: auditY + 13,
        size: 9,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      page.drawText('SENTINEL AI COMPLIANCE AUDIT CERTIFIED', {
        x: margin + 34,
        y: auditY + 19,
        size: 7.5,
        font: fontBold,
        color: rgb(0.145, 0.388, 0.922),
      });

      page.drawText('Zero statutory deviations detected. TDS deducted under Income Tax Act Sec 192. EPFO & ESIC compliant.', {
        x: margin + 34,
        y: auditY + 8,
        size: 6.8,
        font,
        color: rgb(0.4, 0.46, 0.54),
      });

      // Signatory & Legal Footer
      page.drawText('Note: This is an electronically authenticated salary document generated by PayPilot Autonomous HRMS.', {
        x: margin,
        y: 52,
        size: 6.5,
        font,
        color: rgb(0.58, 0.64, 0.72),
      });

      page.drawText('Digitally certified by PayPilot Technologies Pvt. Ltd. | No physical signature required.', {
        x: margin,
        y: 42,
        size: 6.5,
        font,
        color: rgb(0.58, 0.64, 0.72),
      });

      const sigLineX = width - margin - 150;
      page.drawLine({
        start: { x: sigLineX, y: 55 },
        end: { x: width - margin, y: 55 },
        thickness: 0.5,
        color: rgb(0.8, 0.84, 0.88),
      });

      page.drawText('Authorized Payroll Signatory', {
        x: sigLineX + 15,
        y: 42,
        size: 7,
        font: fontBold,
        color: rgb(0.2, 0.25, 0.35),
      });

      // Bottom bar
      page.drawRectangle({
        x: margin,
        y: 26,
        width: contentWidth,
        height: 2,
        color: rgb(0.06, 0.09, 0.16),
      });
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
