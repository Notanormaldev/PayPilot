import React from 'react';
import {
  IconCalculator,
  IconShieldCheck,
  IconChartBar,
  IconCheck,
  IconClock,
  IconSparkles,
  IconTrendingUp,
  IconBolt,
  IconUsers,
} from '@tabler/icons-react';

export const LandingFeatures = () => {
  return (
    <section id="features" className="pp-features-section">
      <div className="pp-section-header">
        <div className="pp-section-badge">
          <IconBolt size={14} />
          <span>Core Capabilities</span>
        </div>
        <h2 className="pp-section-title">
          Everything your enterprise payroll needs
        </h2>
        <p className="pp-section-desc">
          PayPilot unifies contract management, biometric attendance, tax compliance,
          and instant payrun execution into one explainable platform.
        </p>
      </div>

      <div className="pp-bento-grid">
        {/* Bento 1: Autonomous Payrun */}
        <div className="pp-bento-card">
          <div className="pp-bento-header">
            <div className="pp-bento-icon-wrapper" style={{ color: '#2563EB' }}>
              <IconCalculator size={22} />
            </div>
            <h3 className="pp-bento-title">Autonomous Payrun Engine</h3>
            <p className="pp-bento-desc">
              Execute multi-tier payroll across 1,300+ employees in seconds with period-correct contract rules.
            </p>
          </div>

          <div className="pp-bento-preview">
            <div className="pp-preview-stat-row">
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconUsers size={16} color="#2563EB" />
                Active Payrun
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '9999px' }}>
                ● Live Ready
              </span>
            </div>

            <div style={{ margin: '8px 0' }}>
              <div className="pp-preview-stat-val">₹42.8 Lakh</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Disbursed across 1,308 verified staff</div>
            </div>

            <div className="pp-preview-bars">
              {[45, 60, 40, 85, 65, 92, 75].map((h, i) => (
                <div key={i} className="pp-bar-item" title={`Cycle ${i + 1}`}>
                  <div className="pp-bar-fill" style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>

            <div className="pp-preview-mini-grid">
              <div className="pp-mini-stat-card">
                <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconClock size={12} />
                  Batch Run Time
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#09090B', marginTop: '4px' }}>
                  12 sec
                </div>
              </div>

              <div className="pp-mini-stat-card">
                <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconSparkles size={12} color="#2563EB" />
                  Accuracy
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#2563EB', marginTop: '4px' }}>
                  99.98%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento 2: Sentinel Compliance Guard */}
        <div id="sentinel" className="pp-bento-card">
          <div className="pp-bento-header">
            <div className="pp-bento-icon-wrapper" style={{ color: '#F59E0B' }}>
              <IconShieldCheck size={22} />
            </div>
            <h3 className="pp-bento-title">Sentinel Compliance Guard</h3>
            <p className="pp-bento-desc">
              Proactive anomaly detection surfaces missing PAN, PF caps, and salary spikes before final validation.
            </p>
          </div>

          <div className="pp-bento-preview">
            <div className="pp-preview-stat-row">
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconShieldCheck size={16} color="#F59E0B" />
                Statutory Audit
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#D97706', background: '#FEF3C7', padding: '2px 8px', borderRadius: '9999px' }}>
                Active Shield
              </span>
            </div>

            <div className="pp-radial-gauge-container">
              <div className="pp-radial-gauge">
                <IconShieldCheck size={32} color="#2563EB" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#09090B', marginTop: '2px' }}>100% CLEAN</span>
              </div>
            </div>

            <div className="pp-sentinel-item-list">
              <div className="pp-sentinel-row">
                <span style={{ color: '#475569' }}>Income Tax (TDS Slabs)</span>
                <span style={{ color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconCheck size={14} /> Passed
                </span>
              </div>
              <div className="pp-sentinel-row">
                <span style={{ color: '#475569' }}>EPFO / ESIC Mandate</span>
                <span style={{ color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconCheck size={14} /> Passed
                </span>
              </div>
              <div className="pp-sentinel-row">
                <span style={{ color: '#475569' }}>Ghost Employee Check</span>
                <span style={{ color: '#2563EB', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  0 Flags
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento 3: Workforce Analytics & Savings */}
        <div className="pp-bento-card">
          <div className="pp-bento-header">
            <div className="pp-bento-icon-wrapper" style={{ color: '#0D9488' }}>
              <IconChartBar size={22} />
            </div>
            <h3 className="pp-bento-title">Deductions & Cost Telemetry</h3>
            <p className="pp-bento-desc">
              Understand every rupee with detailed breakdowns of employer contributions, taxes, and net disbursements.
            </p>
          </div>

          <div className="pp-bento-preview">
            <div className="pp-preview-stat-row">
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconTrendingUp size={16} color="#0D9488" />
                Monthly Outflow
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0D9488', background: '#CCFBF1', padding: '2px 8px', borderRadius: '9999px' }}>
                +4.2% YoY
              </span>
            </div>

            <div style={{ margin: '8px 0' }}>
              <div className="pp-preview-stat-val">₹51.2 Lakh</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Gross workforce liability</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '14px 0' }}>
              <div className="pp-progress-stat">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569' }}>
                  <span>Net Salary Payout</span>
                  <span style={{ fontWeight: 600, color: '#09090B' }}>82.4%</span>
                </div>
                <div className="pp-progress-track">
                  <div className="pp-progress-fill" style={{ width: '82.4%', background: '#2563EB' }} />
                </div>
              </div>

              <div className="pp-progress-stat">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569' }}>
                  <span>Tax & Statutory (TDS/PF)</span>
                  <span style={{ fontWeight: 600, color: '#09090B' }}>14.8%</span>
                </div>
                <div className="pp-progress-track">
                  <div className="pp-progress-fill" style={{ width: '14.8%', background: '#F59E0B' }} />
                </div>
              </div>

              <div className="pp-progress-stat">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569' }}>
                  <span>Insurance & Benefits</span>
                  <span style={{ fontWeight: 600, color: '#09090B' }}>2.8%</span>
                </div>
                <div className="pp-progress-track">
                  <div className="pp-progress-fill" style={{ width: '2.8%', background: '#10B981' }} />
                </div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Audit Trail</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0D9488' }}>100% Immutable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
