import React from 'react';
import { IconLayersLinked, IconShieldCheck, IconCashBanknote, IconArrowRight } from '@tabler/icons-react';

export const LandingHowItWorks = () => {
  const steps = [
    {
      num: '01',
      title: 'Sync Workforce & Attendance',
      desc: 'Employee contracts, working hours, biometric punch logs, and approved leaves flow directly into the payroll period timeline.',
      icon: <IconLayersLinked size={20} color="#2563EB" />,
    },
    {
      num: '02',
      title: 'Sentinel AI Audits Rules',
      desc: 'The deterministic rule engine evaluates statutory deductions (PF, ESI, TDS) while Sentinel scans for statistical anomalies.',
      icon: <IconShieldCheck size={20} color="#F59E0B" />,
    },
    {
      num: '03',
      title: '1-Click Explainable Disbursement',
      desc: 'Validate payrun in one click with live recomputing payslips, immutable audit logs, and automated employee notifications.',
      icon: <IconCashBanknote size={20} color="#10B981" />,
    },
  ];

  return (
    <section id="how" className="pp-how-section">
      <div className="pp-section-header">
        <div className="pp-section-badge" style={{ background: '#FEF3C7', color: '#D97706' }}>
          <span>Workforce Workflow</span>
        </div>
        <h2 className="pp-section-title">How PayPilot Works</h2>
        <p className="pp-section-desc">
          A closed-loop payroll cycle from clock-in to direct deposit in three transparent steps.
        </p>
      </div>

      <div className="pp-steps-grid">
        {steps.map((step) => (
          <div key={step.num} className="pp-step-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div className="pp-step-number">{step.num}</div>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {step.icon}
              </div>
            </div>
            <h3 className="pp-step-title">{step.title}</h3>
            <p className="pp-step-desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
