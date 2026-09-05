import React from 'react';

export const Badge = ({
  children,
  variant = 'filled',
  color = 'blue',
  size = 'sm',
  className = '',
  style = {},
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    borderRadius: '9999px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    lineHeight: 1,
    padding: size === 'xs' ? '2px 6px' : '4px 10px',
    fontSize: size === 'xs' ? '10px' : '11px',
    border: 'none',
  };

  const colors = {
    blue: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
    amber: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
    green: { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' },
    teal: { bg: '#CCFBF1', text: '#0F766E', border: '#99F6E4' },
    gray: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
  }[color] || { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };

  const variantStyles = {
    filled: { backgroundColor: colors.bg, color: colors.text },
    outline: { backgroundColor: 'transparent', color: colors.text, border: `1px solid ${colors.border}` },
    light: { backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` },
  }[variant] || { backgroundColor: colors.bg, color: colors.text };

  return (
    <span
      className={`pp-ui-badge ${className}`}
      style={{ ...baseStyles, ...variantStyles, ...style }}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
