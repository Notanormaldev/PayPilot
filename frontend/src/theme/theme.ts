import { createTheme, MantineColorsTuple } from '@mantine/core';

const obsidianDark: MantineColorsTuple = [
  '#F1F5F9',
  '#E2E8F0',
  '#94A3B8',
  '#64748B',
  '#475569',
  '#334155',
  '#262A36', // border
  '#1C1F2B', // overlay
  '#14161F', // card surface
  '#0D0E12', // background base
];

export const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    dark: obsidianDark,
  },
  fontFamily: 'Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, Menlo, monospace',
  defaultRadius: 6,
  components: {
    Card: {
      defaultProps: {
        bg: '#14161F',
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: '#262A36',
        },
      },
    },
    Paper: {
      defaultProps: {
        bg: '#14161F',
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: '#262A36',
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
  },
});
