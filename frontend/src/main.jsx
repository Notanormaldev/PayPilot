import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ClerkProvider } from '@clerk/clerk-react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './app/store.js';
import { theme } from './theme/theme.js';
import { App } from './App.jsx';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

const queryClient = new QueryClient();

const CLERK_PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_ZW5kbGVzcy1lc2NhcmdvdC0xODE1LmNsZXJrLmFjY291bnRzLmRldiQ';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <QueryClientProvider client={queryClient}>
          <MantineProvider theme={theme} defaultColorScheme="light">
            <Notifications position="top-right" zIndex={1000} />
            <App />
          </MantineProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </Provider>
  </React.StrictMode>
);
