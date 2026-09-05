import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export const settingsRouter = Router();

// In-memory persistent store for settings if not in DB
let globalSettings = {
  organization: {
    legalName: 'OXP Technologies Private Limited',
    brandName: 'PayPilot Technologies',
    cin: 'U72900DL2021PTC389421',
    pan: 'AAFCO9821K',
    tan: 'DELA12345F',
    gstin: '07AAFCO9821K1Z5',
    epfoCode: 'DSNHP0039281000',
    esicCode: '31000459280001001',
    ptCircle: 'Delhi / NCR & Karnataka',
    address: 'Plot 42, Sector 18, Electronic City, Cyber Hub, Gurugram, Haryana - 122002',
    financialYearStart: 'April',
    payrollCycleBasis: '30_DAYS',
  },
  payrollRules: {
    salaryDisbursementDay: '30',
    cutoffDay: '25',
    epfEmployeePercent: 12.0,
    epfEmployerPercent: 12.0,
    epfWageCeilingCap: 15000,
    epfWageCeilingEnforced: true,
    esiEmployeePercent: 0.75,
    esiEmployerPercent: 3.25,
    esiGrossCeiling: 21000,
    defaultTaxRegime: 'NEW_115BAC',
    hraExemptionEnabled: true,
    sentinelSensitivity: 'STRICT',
    autoHoldOnCriticalAnomaly: true,
  },
  notifications: {
    emailPayrunCompleted: true,
    emailLeaveApproval: true,
    emailSentinelFlag: true,
    inAppAlerts: true,
    smsDisbursementNotice: false,
    monthlyDigest: true,
  },
};

// GET /api/settings
settingsRouter.get('/', authenticate, async (req, res) => {
  try {
    // Attempt to enrich with org data if available in DB
    const org = await prisma.organization.findFirst();
    if (org) {
      globalSettings.organization.legalName = org.name || globalSettings.organization.legalName;
    }
    res.json({ success: true, data: globalSettings });
  } catch (err) {
    res.json({ success: true, data: globalSettings });
  }
});

// PUT /api/settings
settingsRouter.put('/', authenticate, async (req, res) => {
  try {
    const { organization, payrollRules, notifications } = req.body;
    if (organization) {
      globalSettings.organization = { ...globalSettings.organization, ...organization };
      // Sync org name if possible
      try {
        const org = await prisma.organization.findFirst();
        if (org && organization.legalName) {
          await prisma.organization.update({
            where: { id: org.id },
            data: { name: organization.legalName },
          });
        }
      } catch (e) {
        // non-blocking
      }
    }
    if (payrollRules) {
      globalSettings.payrollRules = { ...globalSettings.payrollRules, ...payrollRules };
    }
    if (notifications) {
      globalSettings.notifications = { ...globalSettings.notifications, ...notifications };
    }
    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: globalSettings,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});
