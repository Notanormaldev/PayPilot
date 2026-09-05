import React, { useState } from 'react';
import { Paper, Stack, Group, Text, Button, Badge } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

export const ToDoTasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, count: 136, title: 'Reimbursement Claim(s)', status: 'Pending Approval' },
    { id: 2, count: 96, title: 'Proof of Investment(s)', status: 'Pending Approval' },
    { id: 3, count: 55, title: 'Salary Revision(s)', status: 'Pending Approval' },
  ]);

  const [approvedIds, setApprovedIds] = useState([]);

  const handleApprove = (id) => {
    setApprovedIds([...approvedIds, id]);
  };

  return (
    <Paper
      p="lg"
      radius="md"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Text fw={700} size="sm" c="#09090B" mb="md">
        To Do Tasks
      </Text>

      <Stack gap="md">
        {tasks.map((t) => {
          const isApproved = approvedIds.includes(t.id);
          return (
            <div
              key={t.id}
              style={{
                paddingBottom: '12px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Text size="xs" fw={700} c="#09090B">
                  {t.count} {t.title}
                </Text>
                <Text size="10px" c={isApproved ? '#0D9488' : '#71717A'}>
                  {isApproved ? 'Approved & Synced' : t.status}
                </Text>
              </div>

              {isApproved ? (
                <Badge size="xs" color="teal" variant="light" leftSection={<IconCheck size={10} />}>
                  Approved
                </Badge>
              ) : (
                <Button
                  size="xs"
                  variant="outline"
                  color="blue"
                  onClick={() => handleApprove(t.id)}
                  styles={{
                    root: { height: 26, padding: '0 10px', fontSize: '11px' },
                  }}
                >
                  Approve
                </Button>
              )}
            </div>
          );
        })}
      </Stack>
    </Paper>
  );
};
