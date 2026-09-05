import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GOOGLE_GEMINI_API;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err: any) {
    console.warn('⚠️ [Gemini] Client init warning:', err.message);
  }
}

/**
 * Generates an executive, 1-2 sentence narration for Sentinel payroll anomaly flags.
 * Adheres strictly to the architectural boundary: zero computation, phrase-only, with instant fallback.
 */
export async function generateSentinelNarration(
  flagType: string,
  employeeName: string,
  details: Record<string, any>
): Promise<string> {
  const fallbackExplanations: Record<string, string> = {
    MISSING_BANK_DETAILS: `Payment block for ${employeeName}: Direct deposit account information is missing. Add valid bank details before releasing payslip.`,
    DUPLICATE_PAYSLIP: `Duplicate payroll record detected for ${employeeName} within the same payrun period. Review contract lines to prevent double disbursement.`,
    NO_ACTIVE_CONTRACT: `Compliance block: ${employeeName} has no valid active contract covering this payrun period.`,
    UNAPPROVED_LEAVE_MISMATCH: `Unverified absence detected: ${employeeName} logged ${details.missingDays || 'unapproved'} days of absence without an approved leave request.`,
    STATISTICAL_ANOMALY: `Salary variance alert: ${employeeName}'s calculated net pay deviates by ${details.variancePct || 0}% from the 3-month rolling baseline.`,
  };

  const defaultFallback = fallbackExplanations[flagType] || `Audit flag (${flagType}) recorded for ${employeeName}. Verification required before disbursement.`;

  if (!aiClient) {
    return defaultFallback;
  }

  try {
    const prompt = `You are Sentinel, an autonomous HRMS and Payroll fraud and error detection engine.
Write a crisp, professional, 1 to 2-sentence executive summary explaining this audit flag to a Payroll Officer:
- Flag Type: ${flagType}
- Employee: ${employeeName}
- Context Details: ${JSON.stringify(details)}

Rules:
- Do NOT perform math or invent numbers not in the prompt.
- Be concise, objective, and action-oriented.
- Do NOT use filler words like "Here is a summary". Return ONLY the explanation sentences.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim();
    return text || defaultFallback;
  } catch (err: any) {
    console.warn('⚠️ [Gemini] Narrative generation failed, using deterministic fallback:', err.message);
    return defaultFallback;
  }
}

/**
 * Natural language payroll copilot template responder
 */
export async function queryPayrollCopilot(
  question: string,
  contextData: Record<string, any>
): Promise<string> {
  if (!aiClient) {
    return `Copilot analysis: Based on current metrics, total active headcount is ${contextData.totalEmployees || 0} with monthly payroll commitment of ₹${contextData.monthlyPayrollCost || 0}.`;
  }

  try {
    const prompt = `You are the PayPilot Executive HRMS Copilot. Answer the manager's inquiry accurately using ONLY the provided real-time system context.
User Question: "${question}"
Live Context Metrics: ${JSON.stringify(contextData)}

Rules:
- Maximum 3 concise sentences.
- Be professional and highlight actionable next steps if anomalies exist.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || 'Data summary generated from live system telemetry.';
  } catch {
    return `Live metrics indicate ${contextData.openSentinelFlags || 0} open Sentinel audit flags requiring attention across ${contextData.totalEmployees || 0} employees.`;
  }
}
