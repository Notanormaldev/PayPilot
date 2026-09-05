import React from 'react';
import { Paper, Stack, Text, Button, Code, Container } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PayPilot Application Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container size="sm" py={50}>
          <Paper p="xl" radius="md" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
            <Stack gap="md" align="center" style={{ textAlign: 'center' }}>
              <IconAlertTriangle size={48} color="#DC2626" />
              <Text size="lg" fw={800} c="#991B1B">
                Something went wrong in PayPilot
              </Text>
              <Text size="sm" c="#7F1D1D">
                An unexpected error occurred while rendering this view.
              </Text>
              {this.state.error && (
                <Code block color="red" style={{ maxWidth: '100%', overflowX: 'auto', textAlign: 'left', fontSize: '11px' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </Code>
              )}
              <Button
                color="red"
                size="sm"
                leftSection={<IconRefresh size={16} />}
                onClick={this.handleReload}
              >
                Reload PayPilot Application
              </Button>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}
