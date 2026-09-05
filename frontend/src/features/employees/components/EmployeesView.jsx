import React, { useState } from 'react';
import {
  Stack,
  Group,
  SegmentedControl,
  Text,
  Badge,
  Button,
  Modal,
  TextInput,
  Select,
  Paper,
  Alert,
} from '@mantine/core';
import {
  IconLayoutKanban,
  IconTable,
  IconUserPlus,
  IconUsers,
  IconCheck,
} from '@tabler/icons-react';
import { EmployeeTable } from './EmployeeTable';
import { EmployeeKanbanView } from './EmployeeKanbanView';
import { fetchApi } from '../../../lib/api';

export const EmployeesView = ({ employees = [], onRefresh }) => {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  // New employee form state
  const [formData, setFormData] = useState({
    name: '',
    workEmail: '',
    department: 'Engineering',
    jobPosition: 'Software Engineer',
    bankAccount: '',
    bankName: 'HDFC Bank Direct Deposit',
  });

  const empList = Array.isArray(employees) ? employees : [];

  const handleCreateEmployee = async (e) => {
    e?.preventDefault();
    if (!formData.name.trim() || !formData.workEmail.trim()) {
      setAddError('Please enter employee full name and work email.');
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      await fetchApi('/employees', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setAddModalOpen(false);
      setFormData({
        name: '',
        workEmail: '',
        department: 'Engineering',
        jobPosition: 'Software Engineer',
        bankAccount: '',
        bankName: 'HDFC Bank Direct Deposit',
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to create employee:', err);
      setAddError(err.message || 'Failed to add employee record.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Stack gap="lg">
      {/* Top Header & View Switcher */}
      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        <div>
          <Group gap="xs" align="center">
            <IconUsers size={22} color="#0284C7" />
            <Text fw={800} size="lg" c="#09090B">
              Employee Directory & Personnel Operations
            </Text>
            <Badge size="md" color="blue" variant="filled">
              {empList.length} Staff Members
            </Badge>
          </Group>
          <Text size="xs" c="#64748B">
            Manage organization staff, track live statuses, active contracts, and direct deposit verifications
          </Text>
        </div>

        <Group gap="sm">
          <SegmentedControl
            value={viewMode}
            onChange={setViewMode}
            data={[
              {
                value: 'kanban',
                label: (
                  <Group gap={6} wrap="nowrap">
                    <IconLayoutKanban size={16} />
                    <span>Kanban Board</span>
                  </Group>
                ),
              },
              {
                value: 'table',
                label: (
                  <Group gap={6} wrap="nowrap">
                    <IconTable size={16} />
                    <span>Table View</span>
                  </Group>
                ),
              },
            ]}
            size="sm"
            radius="md"
            styles={{
              root: { backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' },
              indicator: { backgroundColor: '#09090B' },
              label: { fontWeight: 600 },
            }}
          />

          <Button
            size="sm"
            color="dark"
            leftSection={<IconUserPlus size={16} />}
            onClick={() => setAddModalOpen(true)}
          >
            Add Employee
          </Button>
        </Group>
      </Group>

      {/* Render Active View */}
      {viewMode === 'kanban' ? (
        <EmployeeKanbanView employees={employees} onRefresh={onRefresh} />
      ) : (
        <EmployeeTable employees={employees} onRefresh={onRefresh} />
      )}

      {/* Add Employee Modal */}
      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={
          <Group gap="xs">
            <IconUserPlus size={18} color="#0284C7" />
            <Text fw={700} size="sm" c="#09090B">
              Register New Employee
            </Text>
          </Group>
        }
        size="md"
        styles={{
          content: { backgroundColor: '#FFFFFF' },
          header: { backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' },
        }}
      >
        <form onSubmit={handleCreateEmployee}>
          <Stack gap="sm">
            {addError && (
              <Alert color="red" title="Error" withCloseButton onClose={() => setAddError(null)}>
                {addError}
              </Alert>
            )}

            <TextInput
              label="Full Name"
              placeholder="e.g. Rahul Sharma"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextInput
              label="Work Email"
              placeholder="rahul.sharma@paypilot.io"
              required
              value={formData.workEmail}
              onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
            />

            <Select
              label="Department"
              value={formData.department}
              onChange={(val) => setFormData({ ...formData, department: val || 'Engineering' })}
              data={[
                'Engineering',
                'Product',
                'Design',
                'Data & AI',
                'Human Resources',
                'Payroll & Compliance',
                'Finance & Accounts',
                'Sales',
                'Marketing',
                'Customer Success',
                'Legal & Compliance',
                'Operations',
              ]}
            />

            <TextInput
              label="Job Position / Role"
              placeholder="e.g. Senior Frontend Engineer"
              value={formData.jobPosition}
              onChange={(e) => setFormData({ ...formData, jobPosition: e.target.value })}
            />

            <TextInput
              label="Bank Account Number (Direct Deposit)"
              placeholder="e.g. 50100492817263"
              value={formData.bankAccount}
              onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
            />

            <Group justify="flex-end" gap="xs" mt="md">
              <Button size="xs" variant="default" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button size="xs" color="dark" type="submit" loading={adding} leftSection={<IconCheck size={14} />}>
                Create Employee
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
};

export default EmployeesView;
