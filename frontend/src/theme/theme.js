import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Menlo, monospace',
  defaultRadius: 'sm',
  components: {
    Select: {
      defaultProps: {
        checkIconPosition: 'right',
      },
      styles: {
        input: {
          backgroundColor: '#F8FAFC',
          borderColor: '#E2E8F0',
          color: '#09090B',
          fontWeight: 500,
        },
        dropdown: {
          backgroundColor: '#FFFFFF',
          borderColor: '#E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        },
        option: {
          color: '#09090B',
          fontSize: '13px',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: '#F1F5F9',
            color: '#09090B',
          },
        },
      },
    },
    Combobox: {
      styles: {
        dropdown: {
          backgroundColor: '#FFFFFF',
          borderColor: '#E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        },
        option: {
          color: '#09090B',
          fontSize: '13px',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: '#F1F5F9',
            color: '#09090B',
          },
        },
      },
    },
    TextInput: {
      styles: {
        input: {
          backgroundColor: '#F8FAFC',
          borderColor: '#E2E8F0',
          color: '#09090B',
        },
      },
    },
    PasswordInput: {
      styles: {
        innerInput: {
          color: '#09090B',
        },
        input: {
          backgroundColor: '#F8FAFC',
          borderColor: '#E2E8F0',
        },
      },
    },
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

