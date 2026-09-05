import React, { useState } from 'react';
import { IconPlus, IconMinus } from '@tabler/icons-react';

export const Accordion = ({ children, className = '', style = {} }) => {
  return (
    <div className={`pp-ui-accordion ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', ...style }}>
      {children}
    </div>
  );
};

export const AccordionItem = ({
  title,
  children,
  isOpen = false,
  onToggle,
  className = '',
  style = {},
}) => {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const open = onToggle ? isOpen : internalOpen;
  const toggle = onToggle || (() => setInternalOpen(!internalOpen));

  return (
    <div
      className={`pp-ui-accordion-item ${open ? 'open' : ''} ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        border: open ? '1px solid #CBD5E1' : '1px solid #E2E8F0',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: open ? '0 4px 12px rgba(0, 0, 0, 0.03)' : 'none',
        ...style,
      }}
    >
      <button
        onClick={toggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'transparent',
          border: 'none',
          fontSize: '15px',
          fontWeight: 600,
          color: '#09090B',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span>{title}</span>
        <span
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: open ? '#2563EB' : '#F1F5F9',
            color: open ? '#FFFFFF' : '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          {open ? <IconMinus size={14} /> : <IconPlus size={14} />}
        </span>
      </button>

      {open && (
        <div
          style={{
            padding: '0 20px 16px',
            fontSize: '14px',
            color: '#475569',
            lineHeight: 1.6,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
