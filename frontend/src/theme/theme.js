import { createTheme } from '@mantine/core';

// Executive Precision - Linear/Apple Fintech Light Scale
const executiveSlate = [
  '#09090B', // deep ink
  '#18181B',
  '#27272A',
  '#52525B',
  '#71717A',
  '#A1A1AA',
  '#E4E4E7', // border hover
  '#E2E8F0', // primary border
  '#F1F5F9', // secondary surface
  '#FFFFFF', // pure white surface
];

export const theme = createTheme({
  primaryColor: 'dark',
  fontFamily: 'Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Menlo, monospace',
  defaultRadius: 'sm',
  colors: {
    gray: executiveSlate,
  },
  components: {
    Card: {
      defaultProps: {
        bg: '#FFFFFF',
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: '#E2E8F0',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    Paper: {
      defaultProps: {
        bg: '#FFFFFF',
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: '#E2E8F0',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    Button: {
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },
    Table: {
      styles: {
        th: {
          color: '#64748B',
          borderColor: '#E2E8F0',
          backgroundColor: '#F8FAFC',
          fontSize: '11px',
          letterSpacing: '0.04em',
        },
        td: {
          borderColor: '#E2E8F0',
          fontSize: '13px',
        },
      },
    },
  },
});
