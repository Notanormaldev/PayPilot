# HRMS OXP — AI Strategy & Bonus Features

> Covers the Sentinel AI layer, Dashboard Copilot, "Explain This Payslip", the demo data story, and the 5-7 minute winning demo script.

---

## 1. AI Governing Principle

> **The LLM is used exactly twice in kind:**
> 1. To **phrase** an already-computed fact in plain language.
> 2. To **select** the closest matching query template from a small, pre-defined set.
>
> It is **never** used to compute a payroll number, decide whether something is anomalous, generate SQL, or make any decision that carries financial weight.

This constraint is what makes OXP's AI narrow, auditable, and trustworthy — and it's the structural difference between OXP and a "bolted-on chatbot" competitor.

---

## 2. Sentinel — Explainable Exception Engine

### 2.1 Detection Layer (Zero AI)

All detection is 100% deterministic or statistical code. The LLM never sees raw payslip data and never makes a detection decision.

```typescript
// sentinel/sentinel.checks.ts

export async function runSentinelChecks(payrunId: string): Promise<SentinelCheckResult[]> {
  const payslips = await getPayslipsWithContext(payrunId);
  const results: SentinelCheckResult[] = [];

  for (const payslip of payslips) {
    results.push(...await checkMissingBankDetails(payslip));
    results.push(...await checkDuplicatePayslip(payslip, payrunId));
    results.push(...await checkNoActiveContract(payslip));
    results.push(...await checkUnapprovedLeaveMismatch(payslip));
    results.push(...await checkStatisticalAnomaly(payslip));
  }

  return results;
}

// ── CHECK 1: Missing bank details ───────────────────────────────
async function checkMissingBankDetails(payslip: PayslipWithContext): Promise<SentinelCheckResult[]> {
  if (!payslip.employee.bankAccount || !payslip.employee.bankName) {
    return [{
      payslipId: payslip.id,
      flagType: 'MISSING_BANK_DETAILS',
      severity: 'HIGH',
      deterministicReason: {
        flagType: 'MISSING_BANK_DETAILS',
        employeeName: payslip.employee.name,
        missingFields: [
          !payslip.employee.bankAccount ? 'bankAccount' : null,
          !payslip.employee.bankName ? 'bankName' : null,
        ].filter(Boolean),
      },
    }];
  }
  return [];
}

// ── CHECK 2: Duplicate payslip in same payrun ────────────────────
async function checkDuplicatePayslip(payslip: PayslipWithContext, payrunId: string): Promise<SentinelCheckResult[]> {
  const duplicates = await prisma.payslip.findMany({
    where: { payrunId, employeeId: payslip.employeeId, id: { not: payslip.id } },
  });
  if (duplicates.length > 0) {
    return [{
      payslipId: payslip.id,
      flagType: 'DUPLICATE_PAYSLIP',
      severity: 'HIGH',
      deterministicReason: {
        flagType: 'DUPLICATE_PAYSLIP',
        employeeName: payslip.employee.name,
        duplicateCount: duplicates.length,
        duplicateIds: duplicates.map(d => d.id),
      },
    }];
  }
  return [];
}

// ── CHECK 3: No active contract covering the period ──────────────
async function checkNoActiveContract(payslip: PayslipWithContext): Promise<SentinelCheckResult[]> {
  // Contract was resolved at payslip creation — if contractId is somehow null, flag it.
  // Also re-verify status is still RUNNING (could have been expired by HR after payslip creation).
  const contract = await prisma.contract.findUnique({ where: { id: payslip.contractId } });
  if (!contract || contract.status !== 'RUNNING') {
    return [{
      payslipId: payslip.id,
      flagType: 'NO_ACTIVE_CONTRACT',
      severity: 'HIGH',
      deterministicReason: {
        flagType: 'NO_ACTIVE_CONTRACT',
        employeeName: payslip.employee.name,
        contractId: payslip.contractId,
        contractStatus: contract?.status ?? 'NOT_FOUND',
      },
    }];
  }
  return [];
}

// ── CHECK 4: Unapproved leave counted as worked ──────────────────
async function checkUnapprovedLeaveMismatch(payslip: PayslipWithContext): Promise<SentinelCheckResult[]> {
  // If employee has a TimeOffRequest with status TO_APPROVE that overlaps the payrun period,
  // but the payslip's workedDays doesn't reflect any leave deduction, flag it.
  const pendingLeave = await prisma.timeOffRequest.findMany({
    where: {
      employeeId: payslip.employeeId,
      status: 'TO_APPROVE',
      startDate: { lte: payslip.payrun.periodEnd },
      endDate: { gte: payslip.payrun.periodStart },
    },
  });
  if (pendingLeave.length > 0) {
    return [{
      payslipId: payslip.id,
      flagType: 'UNAPPROVED_LEAVE_MISMATCH',
      severity: 'MEDIUM',
      deterministicReason: {
        flagType: 'UNAPPROVED_LEAVE_MISMATCH',
        employeeName: payslip.employee.name,
        pendingLeaveRequests: pendingLeave.map(r => ({
          id: r.id,
          startDate: r.startDate,
          endDate: r.endDate,
          duration: r.duration,
        })),
      },
    }];
  }
  return [];
}

// ── CHECK 5: Statistical anomaly (net pay vs trailing average) ───
async function checkStatisticalAnomaly(payslip: PayslipWithContext): Promise<SentinelCheckResult[]> {
  const currentNet = getLineAmount(payslip.lines, 'NET');
  if (!currentNet) return [];

  // Require at least 2 prior paid payslips to compute a meaningful baseline
  const history = await prisma.payslip.findMany({
    where: {
      employeeId: payslip.employeeId,
      status: 'PAID',
      id: { not: payslip.id },
    },
    include: { lines: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  if (history.length < 2) return []; // Not enough history — skip silently

  const historicalNets = history.map(p => getLineAmount(p.lines, 'NET')).filter(Boolean) as number[];
  const avg = historicalNets.reduce((a, b) => a + b, 0) / historicalNets.length;

  if (avg === 0) return [];

  const deviationPct = ((currentNet - avg) / avg) * 100;
  const THRESHOLD_PCT = 50; // Flag if net pay deviates more than ±50% from trailing average

  if (Math.abs(deviationPct) > THRESHOLD_PCT) {
    return [{
      payslipId: payslip.id,
      flagType: 'STATISTICAL_ANOMALY',
      severity: Math.abs(deviationPct) > 100 ? 'HIGH' : 'MEDIUM',
      deterministicReason: {
        flagType: 'STATISTICAL_ANOMALY',
        employeeName: payslip.employee.name,
        currentNet,
        trailingAverage: avg,
        deviationPct: Math.round(deviationPct),
        direction: deviationPct > 0 ? 'above' : 'below',
        periodCount: historicalNets.length,
      },
    }];
  }

  return [];
}
```

### 2.2 AI Narration Layer

After detection, each flag's `deterministicReason` JSON is passed to the LLM — **never raw payslip data**.

```typescript
// lib/ai.ts

const FLAG_PROMPTS: Record<FlagType, (reason: object) => string> = {
  MISSING_BANK_DETAILS: (r: any) =>
    `Write one plain-English sentence explaining that ${r.employeeName} is missing bank details (${r.missingFields.join(', ')}) and payment cannot be processed. Be direct and professional. Under 25 words.`,

  DUPLICATE_PAYSLIP: (r: any) =>
    `Write one plain-English sentence explaining that ${r.employeeName} has ${r.duplicateCount} duplicate payslip(s) in this payrun and the extra must be removed. Under 25 words.`,

  NO_ACTIVE_CONTRACT: (r: any) =>
    `Write one plain-English sentence explaining that ${r.employeeName}'s contract is ${r.contractStatus} and payroll cannot proceed without a running contract. Under 25 words.`,

  UNAPPROVED_LEAVE_MISMATCH: (r: any) =>
    `Write one plain-English sentence explaining that ${r.employeeName} has ${r.pendingLeaveRequests.length} pending leave request(s) that haven't been approved yet, which may affect their worked days calculation. Under 30 words.`,

  STATISTICAL_ANOMALY: (r: any) =>
    `Write one plain-English sentence explaining that ${r.employeeName}'s net pay of ₹${r.currentNet.toLocaleString('en-IN')} is ${Math.abs(r.deviationPct)}% ${r.direction} their trailing ${r.periodCount}-period average of ₹${r.trailingAverage.toLocaleString('en-IN')}. Under 35 words.`,
};

// Hardcoded fallbacks — used when LLM call fails or times out
const FLAG_FALLBACKS: Record<FlagType, (reason: object) => string> = {
  MISSING_BANK_DETAILS: (r: any) =>
    `${r.employeeName} is missing bank details. Payment cannot be processed until this is resolved.`,
  DUPLICATE_PAYSLIP: (r: any) =>
    `${r.employeeName} has ${r.duplicateCount} duplicate payslip(s) in this payrun. Remove the extra(s) before proceeding.`,
  NO_ACTIVE_CONTRACT: (r: any) =>
    `${r.employeeName} does not have a running contract for this period. Payroll cannot be processed.`,
  UNAPPROVED_LEAVE_MISMATCH: (r: any) =>
    `${r.employeeName} has pending leave requests that may affect their worked days. Approve or refuse before finalizing.`,
  STATISTICAL_ANOMALY: (r: any) =>
    `${r.employeeName}'s net pay deviates ${Math.abs(r.deviationPct)}% from their recent average. Review before proceeding.`,
};

export async function phraseSentinelFlag(flagType: FlagType, deterministicReason: object): Promise<string> {
  const promptFn = FLAG_PROMPTS[flagType];
  if (!promptFn) return FLAG_FALLBACKS[flagType]?.(deterministicReason) ?? 'An issue was detected. Please review.';

  try {
    const prompt = promptFn(deterministicReason);
    const response = await callLLM(prompt, { maxTokens: 60, temperature: 0.3 });

    // Validate: LLM output must not contain numbers not present in the input
    const inputNumbers = JSON.stringify(deterministicReason).match(/\d+(\.\d+)?/g) ?? [];
    const outputNumbers = response.match(/\d+(\.\d+)?/g) ?? [];
    const hallucinatedNumbers = outputNumbers.filter(n => !inputNumbers.includes(n));

    if (hallucinatedNumbers.length > 0) {
      console.warn(`LLM hallucinated numbers: ${hallucinatedNumbers.join(', ')}. Using fallback.`);
      return FLAG_FALLBACKS[flagType](deterministicReason);
    }

    return response;
  } catch (err) {
    console.error('LLM call failed, using fallback:', err);
    return FLAG_FALLBACKS[flagType](deterministicReason);
  }
}
```

### 2.3 Resolve → Recompute

When a user clicks Resolve, a scoped recompute fires for just that payslip:

```typescript
// sentinel/sentinel.service.ts

export async function resolveFlag(flagId: string, resolutionType: string, actorId: string) {
  const flag = await prisma.sentinelFlag.findUnique({ where: { id: flagId }, include: { payslip: true } });

  // Apply the fix
  switch (resolutionType) {
    case 'RECOMPUTE_WITH_APPROVED_LEAVE':
      // The leave was approved separately — just trigger recompute
      break;
    case 'REMOVE_DUPLICATE':
      // Delete the duplicate payslip (the one that isn't the flag's payslip)
      await prisma.payslip.delete({ where: { id: flag.deterministicReasonJson.duplicateIds[0] } });
      break;
  }

  // Scoped recompute — only this payslip
  const updatedPayslip = await computePayslip(flag.payslip.id);

  // Build diff
  const diff = buildPayslipLineDiff(flag.payslip, updatedPayslip);

  // Mark flag resolved
  await prisma.sentinelFlag.update({
    where: { id: flagId },
    data: { status: 'RESOLVED', resolvedById: actorId, resolvedAt: new Date() },
  });

  // Audit
  await createAuditEvent('SentinelFlag', flagId, 'resolved', actorId, { diff });

  return { flag, updatedPayslip, diff };
}
```

---

## 3. Dashboard Copilot

### Query Templates

```typescript
// dashboard/copilot.service.ts

const QUERY_TEMPLATES = {
  department_cost_change: {
    keywords: ['department', 'cost', 'change', 'why', 'increase', 'decrease', 'jump', 'drop'],
    query: async (params: { period: string; department: string }) => {
      // Compare current vs prior period for the department
      return prisma.$queryRaw`
        SELECT 
          p.period_start,
          SUM(pl.amount) FILTER (WHERE pl.category = 'NET') as total_net,
          COUNT(DISTINCT ps.employee_id) as headcount
        FROM "Payrun" p
        JOIN "Payslip" ps ON ps.payrun_id = p.id
        JOIN "Employee" e ON e.id = ps.employee_id
        JOIN "PayslipLine" pl ON pl.payslip_id = ps.id
        WHERE e.department = ${params.department}
          AND p.status = 'PAID'
        GROUP BY p.period_start
        ORDER BY p.period_start DESC
        LIMIT 2
      `;
    },
    promptTemplate: (data: any) =>
      `Given these two periods of payroll data for ${data.department}: ${JSON.stringify(data.rows)}, write 2-3 sentences explaining the cost change. Only cite the numbers provided. Be direct.`,
  },

  monthly_trend: {
    keywords: ['trend', 'month', 'monthly', 'over time', 'history', 'growing', 'declining'],
    query: async (params: { months?: number }) => { /* aggregate by month */ },
    promptTemplate: (data: any) => `...`,
  },

  attendance_summary: {
    keywords: ['attendance', 'present', 'absent', 'late', 'who is', 'showing up'],
    query: async (params: { period: string; department?: string }) => { /* attendance stats */ },
    promptTemplate: (data: any) => `...`,
  },

  time_off_summary: {
    keywords: ['leave', 'time off', 'vacation', 'sick', 'balance', 'remaining'],
    query: async (params: { period: string }) => { /* time off stats */ },
    promptTemplate: (data: any) => `...`,
  },
};

export async function handleCopilotQuestion(question: string, filters: DashboardFilters) {
  // Template matching: keyword overlap score
  const scores = Object.entries(QUERY_TEMPLATES).map(([key, template]) => {
    const overlap = template.keywords.filter(kw => question.toLowerCase().includes(kw)).length;
    return { key, score: overlap };
  });

  const best = scores.sort((a, b) => b.score - a.score)[0];
  if (best.score === 0) {
    return {
      answer: "I can currently answer questions about: payroll cost by department, monthly trends, attendance, and time-off. Try: 'Why did Engineering's cost change this month?'",
      templateUsed: null,
    };
  }

  const template = QUERY_TEMPLATES[best.key];
  const data = await template.query(filters);
  const prompt = template.promptTemplate(data);
  const answer = await callLLM(prompt, { maxTokens: 150, temperature: 0.4 });

  return { answer, templateUsed: best.key, data };
}
```

---

## 4. "Explain This Payslip" Trace

```typescript
// payroll/payroll.service.ts

export async function explainPayslip(payslipId: string): Promise<{ narration: string; lines: PayslipLine[] }> {
  const payslip = await prisma.payslip.findUnique({
    where: { id: payslipId },
    include: { lines: { orderBy: { sequence: 'asc' } }, employee: true, contract: true },
  });

  const linesText = payslip.lines
    .map(l => `${l.name} (${l.code}): ₹${l.amount.toLocaleString('en-IN')} [${l.category}]`)
    .join('\n');

  const prompt = `
You are explaining a payslip calculation to an employee. Here are the salary rule results in order:

${linesText}

Write 3-5 plain English sentences explaining how the net pay was calculated from these components.
Only reference numbers that appear above. Do not guess or add information.
`;

  const narration = await callLLM(prompt, { maxTokens: 200, temperature: 0.3 })
    .catch(() => `Your net pay of ₹${getLineAmount(payslip.lines, 'NET').toLocaleString('en-IN')} was calculated from ${payslip.lines.length} salary rules including Basic Salary, allowances, and deductions. See the table below for the full breakdown.`);

  return { narration, lines: payslip.lines };
}
```

---

## 5. Demo Data Story

> The planted dataset that makes every demo interaction non-trivial and narrative.

### Organization

```
OXP Pvt Ltd
5 Departments: Finance (8), HR (6), Engineering (12), Sales (8), Support (6)
Total: 40 employees
```

### Anchor Employees

| Name | Dept | Role | Special State |
|---|---|---|---|
| **Aarav Mehta** | Finance | Payroll Specialist | 2 contracts (expired Oct 2025 + running Nov 2025–); clean, used as a "normal" payslip reference |
| **Sara Khan** | HR | HR Officer | Pending TimeOffRequest (3 days, not yet approved) during Sep period — **triggers UNAPPROVED_LEAVE_MISMATCH sentinel flag** |
| **John Dsouza** | Engineering | Senior Developer | No bank account on file — **triggers MISSING_BANK_DETAILS sentinel flag** |
| **Neha Patel** | HR | Recruiter | Accidentally has 2 payslip records in the Sep draft payrun — **triggers DUPLICATE_PAYSLIP flag** |
| **Rohan Patel** | Sales | Account Exec | Sep payslip net is 340% of his 3-period average (due to a large commission allowance added for first time) — **triggers STATISTICAL_ANOMALY flag** |

### Historical Payruns (Pre-seeded as PAID)

| Period | Total Net | Purpose |
|---|---|---|
| Apr 2026 | ₹17,20,000 | Trailing history baseline |
| May 2026 | ₹17,45,000 | Trending up slightly |
| Jun 2026 | ₹17,80,000 | Trending up (Engineering hire) |
| Jul 2026 | ₹18,10,000 | Trending up |
| Aug 2026 | ₹18,40,000 | Most recent baseline |

### Sep 2026 (Current — Draft Payrun, 4 Sentinel flags planted)

The demo opens here. The payrun has been computed but not yet validated.

---

## 6. Winning Demo Script (5–7 Minutes)

### Setup

- URL open to the **Payroll Dashboard** — already live, showing Sep 2026 data
- Login: Payroll Manager role (can do everything)

---

**Scene 1 — Context (30 sec)**

> "It's the last day of payroll for OXP Pvt Ltd's 40 employees. The Sep payrun has been computed — let me show you what OXP surfaces before a single rupee moves."

*Point at:* KPI cards (Total Cost, Employee Count, Payslips Pending, Open Flags: **4**)

---

**Scene 2 — Live Data (30 sec)**

> "First — Sara Khan just had her leave request approved. Watch what happens."

*Action:* Navigate to Time Off → Requests → Approve Sara Khan's request.

*Show:* Her allocation balance decrements live on screen.

---

**Scene 3 — The Intelligence Moment (90 sec)**

> "Now back to the payrun. This is where OXP is different from every other payroll system."

*Action:* Navigate to Payroll → Payruns → Sep 2026 → click **Validate**.

*Show:* 4 Sentinel flag cards slide up:
- 🔴 HIGH — John Dsouza: Missing bank details
- 🔴 HIGH — Neha Patel: Duplicate payslip detected
- 🟡 MEDIUM — Sara Khan: Pending leave not reflected in worked days
- 🟡 MEDIUM — Rohan Patel: Net pay 340% above 3-month average

> "Every flag is explained in plain language — grounded in the actual numbers. Not a code, not a generic warning. A reason."

---

**Scene 4 — Live Resolve (90 sec)**

> "And resolving a flag isn't a manual edit. It's one click — and the payslip recomputes right here, before payment."

*Action:* Click **Resolve** on Sara Khan's UNAPPROVED_LEAVE_MISMATCH flag.

*Show:* The payslip diff animation — NET salary changes from ₹95,000 to ₹82,500. The delta row highlights in amber, then settles.

> "The reasoning was stated. The fix was one click. The impact was immediate. Sara's leave is now reflected before we pay her."

*Action:* Resolve the duplicate flag (remove extra payslip). Resolve John's bank details flag (redirect to Employee form → add bank account → return).

> "Three flags resolved. One left — Rohan's statistical anomaly. He got a commission this month. We'll override this one with a note."

*Action:* Override flag with note: "Large Q3 commission — pre-approved by Finance."

---

**Scene 5 — Finalize (30 sec)**

> "Zero open HIGH-severity flags. Mark Paid is now available."

*Action:* Click **Mark Paid** → confirm → click **Send Payslips**.

*Show:* Status changes to PAID. Dashboard KPI updates (Payslips Pending → 0).

---

**Scene 6 — Grounded Intelligence (60 sec)**

> "Finally — the Dashboard Copilot. Not a chatbot. It answers questions grounded in the data we just processed."

*Action:* Type in Copilot: *"Why did Engineering's payroll cost change this month?"*

*Show:* Answer in ~2 seconds: *"Engineering's cost rose by ₹48,000 (7.2%) in September vs August, driven by 2 new joiners added in mid-August and 14 hours of overtime across the team."*

> "The answer cites real numbers from the payrun we just closed. Nothing invented."

---

**Closing (30 sec)**

> "HRMS OXP doesn't just calculate payroll — it explains it, resolves it, and shows the impact live, at the one moment it actually matters. That's the gap no other payroll platform closes today."

---

## 7. AI Model Configuration

```typescript
// lib/ai.ts

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function callLLM(
  prompt: string,
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  const { maxTokens = 100, temperature = 0.3 } = options;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022', // Fast + cheap; sufficient for phrase-only tasks
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return text.trim();
}
```

> **Model choice:** Claude 3.5 Haiku — fastest Claude model, ~1s latency, sufficient for 60-word phrase tasks. Fallback: any OpenAI model via the same wrapper pattern.
