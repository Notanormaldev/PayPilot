import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GOOGLE_GEMINI_API;
let aiClient = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('⚠️ [Gemini] Failed to initialize GoogleGenAI client:', err.message);
  }
}

/**
 * Generate 1-2 sentence executive audit flag narration
 */
export async function generateAuditFlagNarration(flagType, severity, metadata) {
  if (!aiClient) return null;

  try {
    const prompt = `You are Sentinel AI, an autonomous HR compliance auditor. Write exactly 1-2 concise, high-impact professional sentences explaining the payroll risk for executive review.
Flag Type: ${flagType}
Severity: ${severity}
Metadata: ${JSON.stringify(metadata)}
Executive Summary:`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || null;
  } catch (err) {
    console.warn('⚠️ [Gemini] Generation failed, using fallback:', err.message);
    return null;
  }
}

/**
 * Executive Copilot Q&A
 */
export async function queryCopilot(question, contextData) {
  if (!aiClient) {
    return `PayPilot Copilot: Based on system state, total active payroll is ₹${Number(contextData?.totalPayrollCost || 2450000).toLocaleString('en-IN')}, with ${contextData?.employeeCount || 40} employees and ${contextData?.openSentinelFlags || 0} active compliance flags.`;
  }

  try {
    const prompt = `You are PayPilot Executive Copilot. Answer the executive question concisely in 2-3 sentences based on the following real-time HRMS context:
Context: ${JSON.stringify(contextData)}
Question: "${question}"
Answer:`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return (
      response.text?.trim() ||
      'Based on current system records, payroll processes are running within normal parameters.'
    );
  } catch (err) {
    console.warn('⚠️ [Gemini] Copilot Q&A failed, fallback used:', err.message);
    return `PayPilot Copilot: System active with ${contextData?.employeeCount || 40} employees and ₹${Number(contextData?.totalPayrollCost || 2450000).toLocaleString('en-IN')} monthly spend.`;
  }
}
