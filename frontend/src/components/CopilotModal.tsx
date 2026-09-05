import React, { useState } from 'react';
import { Modal, Stack, Group, TextInput, Button, Text, Badge } from '@mantine/core';
import { IconSparkles, IconSend } from '@tabler/icons-react';
import { fetchApi } from '../lib/api';

interface CopilotModalProps {
  opened: boolean;
  onClose: () => void;
}

export const CopilotModal: React.FC<CopilotModalProps> = ({ opened, onClose }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your Sentinel Executive Copilot. Ask me about payroll anomalies, employee contracts, or budget trends.',
    },
  ]);

  const handleAsk = async (promptText?: string) => {
    const q = promptText || question;
    if (!q.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, text: q }];
    setMessages(newMessages);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetchApi<{ answer: string }>('/dashboard/copilot', {
        method: 'POST',
        body: JSON.stringify({ question: q }),
      });
      setMessages([...newMessages, { role: 'assistant', text: res.answer }]);
    } catch (err: any) {
      setMessages([...newMessages, { role: 'assistant', text: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'Summarize current Sentinel blocking flags',
    'What is our total active monthly payroll spend?',
    'Who has missing bank details?',
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconSparkles size={18} color="#60A5FA" />
          <Text fw={700} size="sm" c="#F1F5F9">
            PayPilot Executive Copilot
          </Text>
          <Badge size="xs" color="blue" variant="filled">
            Gemini 2.5
          </Badge>
        </Group>
      }
      size="lg"
      styles={{
        content: { backgroundColor: '#14161F', borderColor: '#262A36' },
        header: { backgroundColor: '#14161F', borderBottom: '1px solid #262A36' },
      }}
    >
      <Stack gap="md">
        {/* Messages */}
        <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: m.role === 'user' ? '#3B82F6' : '#0D0E12',
                color: '#F1F5F9',
                padding: '10px 14px',
                borderRadius: '8px',
                border: m.role === 'assistant' ? '1px solid #262A36' : 'none',
                maxWidth: '85%',
                fontSize: '13px',
                lineHeight: '1.5',
              }}
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', color: '#94A3B8', fontSize: '12px' }}>
              Copilot is querying real-time system state...
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <Group gap="xs">
          {sampleQuestions.map((sq, i) => (
            <Badge
              key={i}
              size="xs"
              variant="outline"
              color="gray"
              style={{ cursor: 'pointer' }}
              onClick={() => handleAsk(sq)}
            >
              {sq}
            </Badge>
          ))}
        </Group>

        {/* Input */}
        <Group gap="xs">
          <TextInput
            placeholder="Ask anything about payroll or staff..."
            value={question}
            onChange={(e) => setQuestion(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            style={{ flex: 1 }}
            styles={{
              input: { backgroundColor: '#0D0E12', borderColor: '#262A36', color: '#F1F5F9' },
            }}
          />
          <Button
            size="sm"
            color="blue"
            loading={loading}
            onClick={() => handleAsk()}
            rightSection={<IconSend size={14} />}
          >
            Send
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
