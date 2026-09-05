import React from 'react';

export const Button = ({
  children,
  variant = 'filled',
  size = 'md',
  className = '',
  onClick,
  style = {},
  disabled = false,
  asChild = false,
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '9999px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    textDecoration: 'none',
    border: 'none',
    fontFamily: 'inherit',
  };

  const sizeStyles = {
    sm: { padding: '6px 14px', fontSize: '12px', height: '32px' },
    md: { padding: '8px 20px', fontSize: '13px', height: '40px' },
    lg: { padding: '12px 28px', fontSize: '15px', height: '48px' },
  }[size] || { padding: '8px 20px', fontSize: '13px', height: '40px' };

  const variantStyles = {
    filled: {
      backgroundColor: '#2563EB',
      color: '#FFFFFF',
      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    },
    dark: {
      backgroundColor: '#09090B',
      color: '#FFFFFF',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
    },
    light: {
      backgroundColor: '#EFF6FF',
      color: '#2563EB',
      border: '1px solid #DBEAFE',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#334155',
      border: '1px solid #E2E8F0',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#475569',
      border: 'none',
    },
    white: {
      backgroundColor: '#FFFFFF',
      color: '#09090B',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    },
  }[variant] || { backgroundColor: '#2563EB', color: '#FFFFFF' };

  return (
    <button
      className={`pp-ui-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyles, ...sizeStyles, ...variantStyles, ...style }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
