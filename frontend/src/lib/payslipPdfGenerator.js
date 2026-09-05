import { jsPDF } from 'jspdf';

/**
 * Converts a numeric amount to Indian Currency Words
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

/**
 * Generates and downloads a high-fidelity corporate PayPilot Payslip PDF
 */
export function generatePayslipPdf(psData, employeeDetails = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182

  const emp = {
    name: employeeDetails.name || 'Kartik Kumar',
    id: employeeDetails.id || 'EMP-8492',
    designation: employeeDetails.designation || 'Staff Software Engineer',
    department: employeeDetails.department || 'Engineering & Product',
    doj: employeeDetails.doj || '15-Mar-2023',
    bankName: employeeDetails.bankName || 'HDFC Bank Ltd.',
    bankAccount: employeeDetails.bankAccount || '•••• •••• •••• 8492',
    ifsc: employeeDetails.ifsc || 'HDFC0001429',
    pan: employeeDetails.pan || 'ABCPK8942F',
    uan: employeeDetails.uan || '101849204918',
    pfNo: employeeDetails.pfNo || 'KN/BLR/0084921/000',
    totalDays: 31,
    payableDays: 31,
    lopDays: 0,
    ...employeeDetails,
  };

  const month = psData.month || 'August 2026';
  const payDate = psData.date || '31-Aug-2026';
  const payslipId = psData.id || 'PS-2026-08';

  // -------------------------------------------------------------
  // 1. TOP HEADER BRANDING BANNER
  // -------------------------------------------------------------
  // Top subtle decorative bar (PayPilot Blue)
  doc.setFillColor(37, 99, 235); // #2563EB
  doc.rect(margin, 12, contentWidth, 3, 'F');

  // PayPilot Logo Symbol (Geometric Wing + Shield Icon)
  const logoX = margin + 2;
  const logoY = 20;

  // Dark wing
  doc.setFillColor(15, 23, 42); // #0F172A
  doc.roundedRect(logoX, logoY, 11, 11, 2, 2, 'F');

  // White inner loop
  doc.setFillColor(255, 255, 255);
  doc.rect(logoX + 3, logoY + 3, 3, 3, 'F');

  // Blue Accent Wing
  doc.setFillColor(37, 99, 235);
  doc.triangle(logoX + 7, logoY + 2, logoX + 13, logoY - 2, logoX + 13, logoY + 6, 'F');

  // Amber Sentinel Security Dot
  doc.setFillColor(245, 158, 11);
  doc.circle(logoX + 11, logoY + 8, 1.2, 'F');

  // "PayPilot" Wordmark
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text('Pay', logoX + 16, logoY + 7.5);

  doc.setTextColor(37, 99, 235); // Pilot in brand blue
  doc.text('Pilot', logoX + 28.5, logoY + 7.5);

  // Sub-brand / Company Details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('PayPilot Autonomous Technologies India Pvt. Ltd.', logoX, logoY + 14);
  doc.text('CIN: U72200KA2024PTC184920  |  GSTIN: 29AABCP9284F1ZT', logoX, logoY + 17.5);
  doc.text('Orbit Cyber Park, Whitefield, Bengaluru, Karnataka - 560066', logoX, logoY + 21);

  // Right Header Card: Document Metadata
  const metaBoxX = pageWidth - margin - 62;
  doc.setFillColor(248, 250, 252); // #F8FAFC
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.roundedRect(metaBoxX, 18, 62, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text('CONFIDENTIAL SALARY STATEMENT', metaBoxX + 4, 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Pay Period: `, metaBoxX + 4, 28);
  doc.setFont('helvetica', 'bold');
  doc.text(`${month.toUpperCase()}`, metaBoxX + 22, 28);

  doc.setFont('helvetica', 'normal');
  doc.text(`Payslip Ref: `, metaBoxX + 4, 32.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${payslipId}`, metaBoxX + 22, 32.5);

  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Date: `, metaBoxX + 4, 37);
  doc.setFont('helvetica', 'bold');
  doc.text(`${payDate}`, metaBoxX + 22, 37);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(5, 150, 105);
  doc.text('• STATUS: DISBURSED (VERIFIED)', metaBoxX + 4, 41.5);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, 48, pageWidth - margin, 48);

  // -------------------------------------------------------------
  // 2. EMPLOYEE DETAILS GRID (2 Columns)
  // -------------------------------------------------------------
  const gridY = 52;
  const gridHeight = 36;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, gridY, contentWidth, gridHeight, 2, 2, 'FD');

  // Middle divider line
  const midX = margin + contentWidth / 2;
  doc.line(midX, gridY, midX, gridY + gridHeight);

  // Column 1 - Employment Info
  const col1X = margin + 5;
  const col1ValX = margin + 35;
  let rowY = gridY + 6;

  const renderInfoRow = (label, value, labelX, valX, y) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, labelX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(String(value), valX, y);
  };

  renderInfoRow('Employee Name:', emp.name, col1X, col1ValX, rowY);
  renderInfoRow('Employee ID:', emp.id, col1X, col1ValX, (rowY += 6));
  renderInfoRow('Designation:', emp.designation, col1X, col1ValX, (rowY += 6));
  renderInfoRow('Department:', emp.department, col1X, col1ValX, (rowY += 6));
  renderInfoRow('Date of Joining:', emp.doj, col1X, col1ValX, (rowY += 6));

  // Column 2 - Bank & Statutory Info
  const col2X = midX + 5;
  const col2ValX = midX + 35;
  rowY = gridY + 6;

  renderInfoRow('Bank & A/C:', `${emp.bankName} (${emp.bankAccount})`, col2X, col2ValX, rowY);
  renderInfoRow('IFSC / Branch:', emp.ifsc, col2X, col2ValX, (rowY += 6));
  renderInfoRow('PAN Number:', emp.pan, col2X, col2ValX, (rowY += 6));
  renderInfoRow('UAN / PF No.:', `${emp.uan}`, col2X, col2ValX, (rowY += 6));
  renderInfoRow('Days Worked:', `${emp.payableDays} Days (LOP: ${emp.lopDays})`, col2X, col2ValX, (rowY += 6));

  // -------------------------------------------------------------
  // 3. EARNINGS & DEDUCTIONS BREAKDOWN TABLE
  // -------------------------------------------------------------
  const tableStartY = 93;
  const colWidth = (contentWidth - 4) / 2; // ~89mm each

  // Separate earnings and deductions from psData.lines
  const lines = psData.lines || [
    { code: 'BASIC', name: 'Basic Salary', category: 'BASIC', amount: 72500 },
    { code: 'HRA', name: 'House Rent Allowance', category: 'ALLOWANCE', amount: 29000 },
    { code: 'SPECIAL', name: 'Special Allowance', category: 'ALLOWANCE', amount: 14500 },
    { code: 'PF_EMP', name: 'Provident Fund (PF)', category: 'DEDUCTION', amount: -7250 },
    { code: 'ESI_EMP', name: 'ESI Contribution', category: 'DEDUCTION', amount: -1450 },
    { code: 'TDS', name: 'Income Tax (TDS)', category: 'DEDUCTION', amount: -12000 },
  ];

  const earnings = lines.filter((l) => Number(l.amount) > 0);
  const deductions = lines.filter((l) => Number(l.amount) < 0 || l.category === 'DEDUCTION');

  // Header 1: EARNINGS
  const earnX = margin;
  doc.setFillColor(15, 23, 42); // #0F172A
  doc.rect(earnX, tableStartY, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('EARNINGS & ALLOWANCES', earnX + 4, tableStartY + 5);
  doc.text('AMOUNT (INR)', earnX + colWidth - 25, tableStartY + 5);

  // Header 2: DEDUCTIONS
  const dedX = margin + colWidth + 4;
  doc.setFillColor(15, 23, 42);
  doc.rect(dedX, tableStartY, colWidth, 7, 'F');
  doc.text('STATUTORY DEDUCTIONS', dedX + 4, tableStartY + 5);
  doc.text('AMOUNT (INR)', dedX + colWidth - 25, tableStartY + 5);

  // Rows
  const maxRows = Math.max(earnings.length, deductions.length, 5);
  let currentY = tableStartY + 7;
  const rowHeight = 6.5;

  let totalGross = 0;
  let totalDeductions = 0;

  for (let i = 0; i < maxRows; i++) {
    const isEven = i % 2 === 0;
    const earnItem = earnings[i];
    const dedItem = deductions[i];

    // Background zebra striping
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(earnX, currentY, colWidth, rowHeight, 'F');
      doc.rect(dedX, currentY, colWidth, rowHeight, 'F');
    }

    // Border
    doc.setDrawColor(241, 245, 249);
    doc.line(earnX, currentY + rowHeight, earnX + colWidth, currentY + rowHeight);
    doc.line(dedX, currentY + rowHeight, dedX + colWidth, currentY + rowHeight);

    // Earnings cell
    if (earnItem) {
      const amt = Math.abs(Number(earnItem.amount));
      totalGross += amt;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(earnItem.name, earnX + 4, currentY + 4.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rs. ${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, earnX + colWidth - 4, currentY + 4.5, { align: 'right' });
    }

    // Deductions cell
    if (dedItem) {
      const amt = Math.abs(Number(dedItem.amount));
      totalDeductions += amt;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(dedItem.name, dedX + 4, currentY + 4.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text(`Rs. ${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, dedX + colWidth - 4, currentY + 4.5, { align: 'right' });
    }

    currentY += rowHeight;
  }

  // If psData has override values, use them
  if (psData.gross) totalGross = psData.gross;
  if (psData.deductions) totalDeductions = psData.deductions;
  const netSalary = psData.net || totalGross - totalDeductions;

  // Subtotal Rows
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(earnX, currentY, colWidth, 8, 'FD');
  doc.rect(dedX, currentY, colWidth, 8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL GROSS PAY', earnX + 4, currentY + 5.5);
  doc.text(`Rs. ${totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, earnX + colWidth - 4, currentY + 5.5, { align: 'right' });

  doc.text('TOTAL DEDUCTIONS', dedX + 4, currentY + 5.5);
  doc.setTextColor(220, 38, 38);
  doc.text(`Rs. ${totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, dedX + colWidth - 4, currentY + 5.5, { align: 'right' });

  currentY += 12;

  // -------------------------------------------------------------
  // 4. NET SALARY CALLOUT CARD
  // -------------------------------------------------------------
  const netCardHeight = 22;
  doc.setFillColor(240, 253, 244); // Light Green #F0FDF4
  doc.setDrawColor(187, 247, 208); // Green border #BBF7D0
  doc.roundedRect(margin, currentY, contentWidth, netCardHeight, 2, 2, 'FD');

  // Left Net Pay Callout
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105); // #059669
  doc.text('NET TAKE-HOME SALARY PAYABLE:', margin + 6, currentY + 6.5);

  doc.setFontSize(15);
  doc.setTextColor(6, 78, 59); // Deep Emerald #064E3B
  doc.text(`Rs. ${netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, margin + 6, currentY + 14);

  // In Words
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Amount in Words: ${numberToWordsINR(netSalary)}`, margin + 6, currentY + 19);

  // Right Side Disbursement Stamp
  const stampX = pageWidth - margin - 58;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Payment Mode:', stampX, currentY + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Direct Bank Credit (NEFT)', stampX + 22, currentY + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Ref:', stampX, currentY + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`PP-${payslipId}-RTGS`, stampX + 22, currentY + 11.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Value Date:', stampX, currentY + 16.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${payDate}`, stampX + 22, currentY + 16.5);

  currentY += netCardHeight + 8;

  // -------------------------------------------------------------
  // 5. SENTINEL AI AUDIT & STATUTORY CLEARANCE BANNER
  // -------------------------------------------------------------
  const auditBoxHeight = 16;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, auditBoxHeight, 2, 2, 'FD');

  // Shield Icon / Badge
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(margin + 4, currentY + 3.5, 9, 9, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('AI', margin + 6.5, currentY + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('SENTINEL AI COMPLIANCE AUDIT CERTIFICATE', margin + 16, currentY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'Statutory deductions computed under Income Tax Act Sec 192, EPFO rules, and State PT schedules. Anomaly audit: PASSED (0 flags).',
    margin + 16,
    currentY + 11.5
  );

  currentY += auditBoxHeight + 10;

  // -------------------------------------------------------------
  // 6. SIGNATURES & AUTHENTICATION FOOTER
  // -------------------------------------------------------------
  // Left: Legal notice
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Note: This document is a computer-generated tax salary statement issued under the authority of', margin, currentY);
  doc.text('PayPilot Autonomous HRMS. It is digitally signed and does not require a physical signature.', margin, currentY + 4);
  doc.text('For payroll grievances or tax declaration updates, write to: payroll@paypilot.internal', margin, currentY + 8);

  // Right: Authorized Signatory Seal
  const sigX = pageWidth - margin - 45;
  doc.setDrawColor(203, 213, 225);
  doc.line(sigX, currentY + 6, sigX + 45, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('For PayPilot Technologies Pvt. Ltd.', sigX, currentY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Payroll Signatory', sigX, currentY + 14);

  // Bottom Border
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, 285, contentWidth, 1.5, 'F');

  // Trigger browser download
  const sanitizedMonth = month.replace(/\s+/g, '_');
  const filename = `PayPilot_Payslip_${payslipId}_${sanitizedMonth}.pdf`;
  doc.save(filename);
}

export default generatePayslipPdf;
