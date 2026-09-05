import React, { useState } from 'react';
import { IconPlus, IconMinus, IconHelpCircle, IconCalculator, IconShieldCheck, IconUsers } from '@tabler/icons-react';

const FAQ_CATEGORIES = [
  {
    id: 'general',
    label: 'General',
    icon: <IconHelpCircle size={16} />,
    items: [
      {
        question: 'What makes PayPilot different from traditional payroll software?',
        answer:
          'Traditional payroll platforms rely on static checklists and force payroll managers to reverse-engineer discrepancies after errors occur. PayPilot couples a deterministic salary calculation engine with the Sentinel AI Anomaly Guard, explaining every number and enabling live payslip recomputation before money is disbursed.',
      },
      {
        question: 'Who is PayPilot built for?',
        answer:
          'PayPilot is built for HR Managers, Payroll Specialists, Finance Controllers, and Executives managing workforce operations from 50 to 10,000+ employees. It also provides a sleek Self-Service Portal for employees to track attendance, submit leaves, and download payslips.',
      },
      {
        question: 'How fast is migration and onboarding?',
        answer:
          'You can import employee rosters, historical pay structures, and banking details via CSV or direct API sync. PayPilot automatically validates field mappings and checks for missing statutory data before your first payrun.',
      },
    ],
  },
  {
    id: 'payroll',
    label: 'Autonomous Payroll',
    icon: <IconCalculator size={16} />,
    items: [
      {
        question: 'How does the autonomous payrun engine compute salaries?',
        answer:
          'The engine evaluates period-correct employee contracts, applies sequenced salary rules (Basic, HRA, Special Allowances), subtracts statutory deductions (PF, ESI, TDS, Professional Tax), adjusts for unpaid leaves from attendance logs, and generates complete payslips in seconds.',
      },
      {
        question: 'Can PayPilot handle overtime, bonuses, and variable pay?',
        answer:
          'Yes. Overtime rates from attendance punch records and one-time discretionary bonuses can be seamlessly injected into any payrun cycle without altering baseline salary templates.',
      },
      {
        question: 'What happens if an employee contract changes mid-month?',
        answer:
          'PayPilot supports period-correct pro-rated salary computation, automatically dividing the monthly cycle by contract validity dates to ensure exact statutory precision.',
      },
    ],
  },
  {
    id: 'sentinel',
    label: 'Sentinel AI & Compliance',
    icon: <IconShieldCheck size={16} />,
    items: [
      {
        question: 'What is the Sentinel AI Anomaly Guard?',
        answer:
          'Sentinel is PayPilot’s automated compliance watchdog. It continuously scans your pending payrun for anomalies such as missing PAN/Aadhaar, sudden 300%+ salary spikes, duplicate bank accounts (ghost employees), or statutory PF threshold breaches.',
      },
      {
        question: 'How does PayPilot handle Indian Tax Regimes (Old vs New)?',
        answer:
          'Employees can choose their preferred tax regime in the Self-Service Portal. PayPilot projects annual tax liabilities under both Old (with 80C/80D deductions) and New Regimes, recommending the highest tax-saving path automatically.',
      },
      {
        question: 'Are payroll numbers altered by AI?',
        answer:
          'No. Numbers are strictly computed by deterministic code rules. Sentinel AI only narrates, audits, and flags issues in plain language so the human officer remains in complete legal and financial control.',
      },
    ],
  },
  {
    id: 'security',
    label: 'Self-Service & Security',
    icon: <IconUsers size={16} />,
    items: [
      {
        question: 'Can employees view their payslips and leave balance?',
        answer:
          'Yes. Employees have access to an intuitive self-service portal where they can view PDF payslips, submit leave requests with instant manager routing, and calculate take-home salary projections.',
      },
      {
        question: 'How are roles and permissions managed?',
        answer:
          'PayPilot enforces granular Role-Based Access Control (RBAC) across 4 standard tiers: Administrator, HR Manager, Payroll Lead, and Employee Self-Service, ensuring sensitive salary figures are never exposed to unauthorized personnel.',
      },
      {
        question: 'Is compensation and bank data secure?',
        answer:
          'All data is encrypted in transit via TLS 1.3 and at rest with AES-256. Audit trails log every payroll validation, override, and bank disbursement attempt immutably.',
      },
    ],
  },
];

export const LandingFAQ = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [openIndex, setOpenIndex] = useState(0);

  const currentCategory = FAQ_CATEGORIES.find((c) => c.id === activeCategory) || FAQ_CATEGORIES[0];

  return (
    <section id="faq" className="pp-faq-section">
      <div className="pp-section-header">
        <div className="pp-section-badge">
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="pp-section-title">Everything you need to know</h2>
        <p className="pp-section-desc">
          Have questions about PayPilot’s calculation engine, compliance guarantees, or pricing? Find clear answers below.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="pp-faq-tabs">
        {FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`pp-faq-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(cat.id);
              setOpenIndex(0);
            }}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="pp-faq-accordion">
        {currentCategory.items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className={`pp-faq-item ${isOpen ? 'open' : ''}`}>
              <button
                className="pp-faq-trigger"
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <span className="pp-faq-icon-pill">
                  {isOpen ? <IconMinus size={14} /> : <IconPlus size={14} />}
                </span>
              </button>
              {isOpen && <div className="pp-faq-content">{item.answer}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
};
