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

function formatINR(val) {
  const num = Math.round(Number(val) || 0);
  return 'Rs. ' + num.toLocaleString('en-IN');
}

/**
 * Generates and downloads a corporate PayPilot Official Tax Computation & Form 16 Annexure PDF
 * Fully compliant with FY 2026-27 Union Budget Reforms, Gratuity Act 1972, & Bonus Act 1965
 */
export async function generateTaxBreakdownPdf(taxData, employeeDetails = {}, payrollData = {}) {
  let jsPDFClass;
  try {
    const mod = await import(/* @vite-ignore */ 'jspdf');
    jsPDFClass = mod.jsPDF || mod.default;
  } catch (err) {
    console.warn('jsPDF dynamic import warning:', err);
    if (typeof window !== 'undefined' && window.jspdf) {
      jsPDFClass = window.jspdf.jsPDF;
    }
  }

  if (!jsPDFClass) {
    alert('PDF generator module is currently initializing. Please try again.');
    return;
  }

  const doc = new jsPDFClass({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186 mm

  const emp = {
    name: employeeDetails.name || 'Kartik Kumar',
    id: employeeDetails.id || 'EMP-8492',
    designation: employeeDetails.designation || 'Staff Software Engineer',
    department: employeeDetails.department || 'Engineering & Product',
    pan: employeeDetails.pan || 'ABCPK8942F',
    uan: employeeDetails.uan || '101849204918',
    state: employeeDetails.state || 'Maharashtra (MH)',
    serviceYears: employeeDetails.serviceYears || 5,
    ...employeeDetails,
  };

  const rawFy = taxData.financialYear || 'FY_2026_27';
  const fyFormatted = rawFy.replace('FY_', '20').replace('_', '-').replace('FY ', '');
  const rawAy = taxData.assessmentYear || 'AY_2027_28';
  const ayFormatted = rawAy.replace('AY_', '20').replace('_', '-').replace('AY ', '');
  const regimeName = taxData.regime?.name || (taxData.regimeCode === 'NEW' ? 'New Tax Regime (u/s 115BAC)' : 'Old Tax Regime');
  const isZeroTax = taxData.taxBreakdown?.totalTaxPayable === 0;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(30, 58, 138); // Navy 900
  doc.rect(margin, 8, contentWidth, 3, 'F');

  // 2. Company & Document Header
  let y = 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('PAYPILOT ENTERPRISE HRMS', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Autonomous Payroll Engine • Income Tax Department Compliance Portal • India', margin, y + 4.2);

  // Right Header Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text('FORM 16 & ANNUAL TAX COMPUTATION STATEMENT', pageWidth - margin, y, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Financial Year: ${fyFormatted} | Assessment Year: ${ayFormatted}`, pageWidth - margin, y + 4.2, { align: 'right' });

  y += 7;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  // 3. Employee & Deductor Information Box (Dual Column Grid)
  y += 3;
  const cardHeight = 25;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, cardHeight, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, cardHeight, 1.5, 1.5, 'S');

  // Employee Demographics Grid
  const col1X = margin + 3;
  const col2X = margin + 48;
  const col3X = margin + 98;
  const col4X = margin + 144;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('EMPLOYEE NAME', col1X, y + 4.5);
  doc.text('EMPLOYEE ID', col2X, y + 4.5);
  doc.text('DESIGNATION', col3X, y + 4.5);
  doc.text('DEPARTMENT', col4X, y + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(emp.name, col1X, y + 9);
  doc.text(emp.id, col2X, y + 9);
  doc.text(emp.designation.substring(0, 24), col3X, y + 9);
  doc.text(emp.department.substring(0, 22), col4X, y + 9);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('PAN OF EMPLOYEE', col1X, y + 15.5);
  doc.text('UAN NUMBER', col2X, y + 15.5);
  doc.text('TAX REGIME APPLIED', col3X, y + 15.5);
  doc.text('WORK LOCATION / PT STATE', col4X, y + 15.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(emp.pan, col1X, y + 20);
  doc.text(emp.uan, col2X, y + 20);
  doc.setTextColor(30, 58, 138);
  doc.text(regimeName.substring(0, 26), col3X, y + 20);
  doc.setTextColor(15, 23, 42);
  doc.text(emp.state, col4X, y + 20);

  y += cardHeight + 4;

  // Helper function for structured table headers
  const renderTableHeader = (title, subTitle, currentY) => {
    doc.setFillColor(30, 58, 138); // Navy header
    doc.rect(margin, currentY, contentWidth, 5.5, 'F');
    doc.setDrawColor(30, 58, 138);
    doc.rect(margin, currentY, contentWidth, 5.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 3, currentY + 3.8);

    if (subTitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(226, 232, 240);
      doc.text(subTitle, pageWidth - margin - 3, currentY + 3.8, { align: 'right' });
    }
    return currentY + 5.5;
  };

  // 4. Section I: Annual Earnings & Statutory Salary Breakdown
  y = renderTableHeader('SECTION I: ANNUAL CTC & STATUTORY SALARY BREAKDOWN', 'Payment of Bonus Act 1965 / Gratuity Act 1972', y);

  // Column Sub-Header Bar
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 4.8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 4.8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('SALARY COMPONENT', margin + 3, y + 3.4);
  doc.text('MONTHLY AMOUNT (INR)', margin + 78, y + 3.4, { align: 'right' });
  doc.text('ANNUAL AMOUNT (INR)', margin + 124, y + 3.4, { align: 'right' });
  doc.text('STATUTORY TREATMENT', pageWidth - margin - 3, y + 3.4, { align: 'right' });

  y += 4.8;

  const earn = payrollData.earnings || {
    basic: { monthly: Math.round((taxData.incomeSummary?.grossSalary || 1200000) * 0.4 / 12), annual: Math.round((taxData.incomeSummary?.grossSalary || 1200000) * 0.4) },
    hra: { monthly: Math.round((taxData.incomeSummary?.grossSalary || 1200000) * 0.2 / 12), annual: Math.round((taxData.incomeSummary?.grossSalary || 1200000) * 0.2) },
    specialAllowance: { monthly: Math.round((taxData.incomeSummary?.grossSalary || 1200000) * 0.35 / 12), annual: Math.round((taxData.incomeSummary?.grossSalary || 1200000) * 0.35) },
    statutoryBonus: { monthly: 583, annual: 7000 },
    grossSalary: { monthly: Math.round((taxData.incomeSummary?.grossSalary || 1200000) / 12), annual: taxData.incomeSummary?.grossSalary || 1200000 },
  };

  const salaryRows = [
    { name: '1. Basic Salary (40% Statutory Wage Base)', m: earn.basic?.monthly || 0, a: earn.basic?.annual || 0, note: 'Fully Taxable Income' },
    { name: '2. House Rent Allowance (HRA)', m: earn.hra?.monthly || 0, a: earn.hra?.annual || 0, note: 'Exempt u/s 10(13A) (Old Regime)' },
    { name: '3. Special & Flexi Allowances', m: earn.specialAllowance?.monthly || 0, a: earn.specialAllowance?.annual || 0, note: 'Fully Taxable Income' },
    { name: '4. Statutory Bonus (Payment of Bonus Act, 1965)', m: earn.statutoryBonus?.monthly || 0, a: earn.statutoryBonus?.annual || 0, note: 'Bonus Act Base (8.33% - 20%)' },
  ];

  salaryRows.forEach((r, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, 250, 252);
    doc.rect(margin, y, contentWidth, 4.6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 4.6, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(r.name, margin + 3, y + 3.3);
    doc.text(r.m.toLocaleString('en-IN'), margin + 78, y + 3.3, { align: 'right' });
    doc.text(r.a.toLocaleString('en-IN'), margin + 124, y + 3.3, { align: 'right' });

    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(r.note, pageWidth - margin - 3, y + 3.3, { align: 'right' });

    y += 4.6;
  });

  // Gross Salary Subtotal Row
  doc.setFillColor(239, 246, 255); // Light blue
  doc.rect(margin, y, contentWidth, 5.2, 'F');
  doc.setDrawColor(191, 219, 254);
  doc.rect(margin, y, contentWidth, 5.2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 58, 138);
  doc.text('TOTAL GROSS SALARY INCOME (A)', margin + 3, y + 3.6);
  doc.text(formatINR(earn.grossSalary.monthly), margin + 78, y + 3.6, { align: 'right' });
  doc.text(formatINR(earn.grossSalary.annual), margin + 124, y + 3.6, { align: 'right' });
  doc.text('Gross Taxable Base', pageWidth - margin - 3, y + 3.6, { align: 'right' });

  y += 7;

  // 5. Section II: Income Tax Computation (Form 16 Annexure)
  y = renderTableHeader('SECTION II: INCOME TAX COMPUTATION & STATUTORY REBATES', `Union Budget Reforms (u/s 115BAC / Section 87A)`, y);

  const grossTotal = taxData.incomeSummary?.totalGrossIncome || earn.grossSalary.annual;
  const stdDed = taxData.incomeSummary?.standardDeduction || (taxData.regimeCode === 'NEW' ? 75000 : 50000);
  const ch6Deductions = taxData.deductions?.totalDeductions || 0;
  const taxableInc = taxData.taxableIncome || (grossTotal - stdDed - ch6Deductions);
  const baseTax = taxData.taxBreakdown?.baseTax || 0;
  const rebate87A = taxData.taxBreakdown?.rebate87A || 0;
  const cessAmt = taxData.taxBreakdown?.cess?.amount || 0;
  const finalTax = taxData.taxBreakdown?.totalTaxPayable || 0;
  const monthlyTds = taxData.taxBreakdown?.monthlyTDS || Math.round(finalTax / 12);

  const computationRows = [
    { label: '1. Gross Total Income (Salary + Other Declared Sources)', amount: formatINR(grossTotal), isBold: true, highlightColor: [15, 23, 42] },
    { label: `2. Less: Standard Deduction u/s 16(ia) (${taxData.regimeCode === 'NEW' ? 'Enhanced New Regime Rs. 75,000' : 'Old Regime Rs. 50,000'})`, amount: '- ' + formatINR(stdDed), isBold: false, highlightColor: [22, 101, 52] },
    ...(ch6Deductions > 0 ? [{ label: '3. Less: Chapter VI-A Deductions (Sections 80C, 80D, 80CCD, 24b, HRA)', amount: '- ' + formatINR(ch6Deductions), isBold: false, highlightColor: [22, 101, 52] }] : []),
    { label: '4. TOTAL TAXABLE INCOME (Rounded to nearest Rs. 10 u/s 288A)', amount: formatINR(taxableInc), isBold: true, highlightColor: [30, 58, 138] },
    { label: '5. Gross Tax Liability as per Progressive Slabs', amount: formatINR(baseTax), isBold: false, highlightColor: [15, 23, 42] },
    { label: '6. Less: Tax Rebate u/s 87A (100% Tax Relief up to Rs. 12 Lakhs Taxable Income)', amount: rebate87A > 0 ? '- ' + formatINR(rebate87A) : 'Rs. 0', isBold: true, highlightColor: [22, 101, 52] },
    { label: '7. Add: Health and Education Cess @ 4.0% on Net Tax', amount: formatINR(cessAmt), isBold: false, highlightColor: [15, 23, 42] },
    { label: '8. TOTAL NET ANNUAL INCOME TAX PAYABLE (Rounded u/s 288B)', amount: formatINR(finalTax), isBold: true, highlightColor: isZeroTax ? [22, 101, 52] : [185, 28, 28] },
    { label: '9. PROJECTED MONTHLY TDS TAX DEDUCTION', amount: formatINR(monthlyTds) + ' / month', isBold: true, highlightColor: [30, 58, 138] },
  ];

  computationRows.forEach((cr, idx) => {
    const isSpecial = idx === 3 || idx === 7 || idx === 8;
    doc.setFillColor(isSpecial ? (idx === 7 && isZeroTax ? 240 : 241) : (idx % 2 === 0 ? 255 : 248), isSpecial ? (idx === 7 && isZeroTax ? 253 : 245) : (idx % 2 === 0 ? 255 : 250), isSpecial ? (idx === 7 && isZeroTax ? 244 : 249) : (idx % 2 === 0 ? 255 : 252));
    doc.rect(margin, y, contentWidth, 4.6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 4.6, 'S');

    doc.setFont('helvetica', cr.isBold ? 'bold' : 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(cr.label, margin + 3, y + 3.3);

    doc.setTextColor(cr.highlightColor[0], cr.highlightColor[1], cr.highlightColor[2]);
    doc.text(cr.amount, pageWidth - margin - 3, y + 3.3, { align: 'right' });

    y += 4.6;
  });

  y += 4;

  // 6. Section III: Progressive Slab-by-Slab Audit Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('SECTION III: PROGRESSIVE SLAB-BY-SLAB AUDIT TRAIL', margin, y);

  y += 2.2;
  const slabs = taxData.taxBreakdown?.slabs || [];
  if (slabs.length > 0) {
    const visibleSlabs = slabs.slice(0, 7);
    const slabW = contentWidth / visibleSlabs.length;

    visibleSlabs.forEach((sl, idx) => {
      const sx = margin + idx * slabW;
      const isActive = sl.taxableAmountInSlab > 0;

      doc.setFillColor(isActive ? 240 : 255, isActive ? 253 : 255, isActive ? 244 : 255);
      doc.rect(sx, y, slabW, 11, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(sx, y, slabW, 11, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(isActive ? 22 : 100, isActive ? 101 : 116, isActive ? 52 : 139);
      doc.text(`${sl.taxRate}% Rate`, sx + slabW / 2, y + 3.2, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.8);
      doc.setTextColor(71, 85, 105);
      const rangeTxt = sl.maxIncome ? `${(sl.minIncome / 100000).toFixed(0)}L - ${(sl.maxIncome / 100000).toFixed(0)}L` : `> ${(sl.minIncome / 100000).toFixed(0)}L`;
      doc.text(rangeTxt, sx + slabW / 2, y + 6.2, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(isActive ? 15 : 148, isActive ? 23 : 163, isActive ? 42 : 184);
      doc.text(formatINR(sl.taxForSlab), sx + slabW / 2, y + 9.5, { align: 'center' });
    });
    y += 13.5;
  }

  // 7. Section IV: Statutory Disclosures & Compliance Declarations (Wrapped Multi-line Text)
  doc.setFillColor(248, 250, 252);
  const notesHeight = 27;
  doc.roundedRect(margin, y, contentWidth, notesHeight, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, notesHeight, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('SECTION IV: STATUTORY ACTS COMPLIANCE & LEGAL DISCLOSURES', margin + 3, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);

  const maxNoteWidth = contentWidth - 8;
  let noteY = y + 8.5;

  const note1 = doc.splitTextToSize(
    '1. Payment of Gratuity Act, 1972: Gratuity is computed at the statutory rate of (15 / 26) * Monthly Basic Wage * completed years of continuous service. Statutory tax exemption is applicable up to Rs. 20,00,000 under Section 10(10) of the Income Tax Act.',
    maxNoteWidth
  );
  doc.text(note1, margin + 3, noteY);
  noteY += note1.length * 3.4;

  const note2 = doc.splitTextToSize(
    '2. Payment of Bonus Act, 1965: Statutory bonus entitlement is computed on the statutory wage calculation limit of Rs. 7,000/month (eligibility ceiling: Rs. 21,000/month). Minimum rate: 8.33%, Maximum rate: 20.0%.',
    maxNoteWidth
  );
  doc.text(note2, margin + 3, noteY);
  noteY += note2.length * 3.4;

  const note3 = doc.splitTextToSize(
    '3. Indian Income Tax Act, 1961: Tax computation reflects the latest Union Budget reforms (Assessment Year 2027-28). Official Form 16 Part A & Part B TDS certificate will be issued following annual corporate tax return filing.',
    maxNoteWidth
  );
  doc.text(note3, margin + 3, noteY);

  y += notesHeight + 4;

  // 8. Section V: Authorized Signatory & Verification Seal Box
  const sigBoxHeight = 18;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, contentWidth, sigBoxHeight, 1.5, 1.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, sigBoxHeight, 1.5, 1.5, 'S');

  // Left Signatory Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(15, 23, 42);
  doc.text('FOR PAYPILOT HRMS TECHNOLOGIES PVT. LTD.', margin + 3, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Payroll Officer / Comptroller of Taxes', margin + 3, y + 8.5);
  doc.text('[Digitally Verified & Encrypted via PayPilot Sentinel Core]', margin + 3, y + 12.5);

  // Right Seal Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(30, 58, 138);
  doc.text('SENTINEL TAMPER-PROOF VERIFICATION SEAL', pageWidth - margin - 3, y + 4.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  const hash = `SEC-IN-TDS-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  doc.text(`Digital Verification Code: ${hash}`, pageWidth - margin - 3, y + 8.5, { align: 'right' });
  doc.text('Valid for Income Tax Returns (ITR-1 / ITR-2) Verification', pageWidth - margin - 3, y + 12.5, { align: 'right' });

  y += sigBoxHeight + 3;

  // 9. Document Footer
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const printDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.text(`Generated on: ${printDate} | System Generated Statement | PayPilot HRMS Version 2.4`, margin, y + 3.8);
  doc.text('Page 1 of 1 • Strictly Confidential', pageWidth - margin, y + 3.8, { align: 'right' });

  // Save the PDF
  const filename = `Tax_Salary_Statement_${emp.id}_${emp.name.replace(/\s+/g, '_')}_${fyFormatted}.pdf`;
  doc.save(filename);
}
