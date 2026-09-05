import React, { useState } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Button,
  Group,
  Paper,
  Text,
  Badge,
  SimpleGrid,
  Alert,
} from '@mantine/core';
import { IconCheck, IconCurrencyRupee, IconCalendar, IconInfoCircle } from '@tabler/icons-react';
import { UserAvatar } from '../../../components/ui';

const SAMPLE_EMPLOYEES = [
  { value: 'emp-kartik', label: 'Kartik Kumar (Product Manager - Product)', email: 'kartik.kumar@paypilot.internal', dept: 'Product', role: 'Product Manager', name: 'Kartik Kumar' },
  { value: 'emp-ananya', label: 'Ananya Iyer (Senior Frontend Engineer - Engineering)', email: 'ananya.iyer@paypilot.internal', dept: 'Engineering', role: 'Senior Frontend Engineer', name: 'Ananya Iyer' },
  { value: 'emp-tanvi', label: 'Tanvi Kapoor (Senior UI/UX Designer - Product)', email: 'tanvi.kapoor@paypilot.internal', dept: 'Product', role: 'Senior UI/UX Designer', name: 'Tanvi Kapoor' },
  { value: 'emp-devendra', label: 'Devendra Rao (Lead Cloud Architect - DevOps)', email: 'devendra.rao@paypilot.internal', dept: 'DevOps', role: 'Lead Cloud Architect', name: 'Devendra Rao' },
  { value: 'emp-sneha', label: 'Sneha Nair (Staff QA Engineer - Quality Assurance)', email: 'sneha.nair@paypilot.internal', dept: 'Quality Assurance', role: 'Staff QA Engineer', name: 'Sneha Nair' },
  { value: 'emp-rohan', label: 'Rohan Verma (Backend Core Specialist - Engineering)', email: 'rohan.verma@paypilot.internal', dept: 'Engineering', role: 'Backend Core Specialist', name: 'Rohan Verma' },
  { value: 'emp-priya', label: 'Priya Sharma (Data Operations Lead - Analytics)', email: 'priya.sharma@paypilot.internal', dept: 'Analytics', role: 'Data Operations Lead', name: 'Priya Sharma' },
];

const LOAN_TYPES = [
  { value: 'SALARY_ADVANCE', label: 'Short-Term Salary Advance (0% Interest)' },
  { value: 'MEDICAL_EMERGENCY', label: 'Medical Emergency Assistance (0% Interest)' },
  { value: 'RELOCATION', label: 'Relocation & Housing Deposit Advance' },
  { value: 'EDUCATION_CERTIFICATION', label: 'Professional Certification & Training Loan' },
  { value: 'EQUIPMENT_BUYBACK', label: 'Company Workstation Buyback Advance' },
  { value: 'PERSONAL_LOAN', label: 'General Employee Welfare Advance' },
];

export const NewLoanModal = ({ opened, onClose, onSubmit, currentRole }) => {
  const isManager = ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'].includes(currentRole);

  const [selectedEmpId, setSelectedEmpId] = useState(SAMPLE_EMPLOYEES[0].value);
  const [loanType, setLoanType] = useState('SALARY_ADVANCE');
  const [principalAmount, setPrincipalAmount] = useState(50000);
  const [tenureMonths, setTenureMonths] = useState(5);
  const [deductionStartMonth, setDeductionStartMonth] = useState('Apr 2026');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const selectedEmp = SAMPLE_EMPLOYEES.find((e) => e.value === selectedEmpId) || SAMPLE_EMPLOYEES[0];
  const monthlyEmi = Math.round(principalAmount / Math.max(1, tenureMonths));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!principalAmount || principalAmount < 5000) {
      setErrorMsg('Principal loan amount must be at least ₹5,000.');
      return;
    }
    if (!tenureMonths || tenureMonths < 1) {
      setErrorMsg('Tenure must be at least 1 month.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const typeObj = LOAN_TYPES.find((t) => t.value === loanType);
      await onSubmit({
        employeeId: selectedEmp.value,
        employeeName: selectedEmp.name,
        employeeEmail: selectedEmp.email,
        department: selectedEmp.dept,
        jobPosition: selectedEmp.role,
        loanType,
        loanTypeName: typeObj?.label.split(' (')[0] || 'Salary Advance',
        principalAmount,
        tenureMonths,
        deductionStartMonth,
        reason,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit loan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Text fw={700} size="md" c="#09090B">
            {isManager ? 'Grant / Sanction Employee Loan & Advance' : 'Apply for Salary Advance / Loan'}
          </Text>
          <Badge size="xs" color="blue" variant="light">
            Auto-Payroll EMI
          </Badge>
        </Group>
      }
      size="lg"
      radius="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {errorMsg && (
            <Alert icon={<IconInfoCircle size={16} />} color="red" title="Submission Error">
              {errorMsg}
            </Alert>
          )}

          {/* Employee Selection */}
          {isManager ? (
            <Select
              label="Select Employee"
              data={SAMPLE_EMPLOYEES.map((e) => ({ value: e.value, label: e.label }))}
              value={selectedEmpId}
              onChange={setSelectedEmpId}
              required
              styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
            />
          ) : (
            <Paper p="xs" radius="sm" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Group gap="sm">
                <UserAvatar size={36} name="Kartik Kumar" id="emp-kartik" />
                <div>
                  <Text size="xs" fw={700} c="#09090B">
                    Kartik Kumar (Product Manager)
                  </Text>
                  <Text size="11px" c="#64748B">
                    kartik.kumar@paypilot.internal • Product
                  </Text>
                </div>
              </Group>
            </Paper>
          )}

          {/* Loan Category */}
          <Select
            label="Loan / Advance Category"
            data={LOAN_TYPES}
            value={loanType}
            onChange={setLoanType}
            required
            styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
          />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <NumberInput
              label="Loan Amount (₹)"
              placeholder="e.g. 50,000"
              value={principalAmount}
              onChange={(val) => setPrincipalAmount(Number(val) || 0)}
              min={5000}
              max={500000}
              step={5000}
              leftSection={<IconCurrencyRupee size={16} color="#71717A" />}
              styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
              required
            />

            <NumberInput
              label="Repayment Tenure (Months)"
              placeholder="e.g. 6"
              value={tenureMonths}
              onChange={(val) => setTenureMonths(Number(val) || 1)}
              min={1}
              max={24}
              styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
              required
            />
          </SimpleGrid>

          <Select
            label="Deduction Starting Month"
            data={[
              { value: 'Apr 2026', label: 'April 2026 Payrun Cycle' },
              { value: 'May 2026', label: 'May 2026 Payrun Cycle' },
              { value: 'Jun 2026', label: 'June 2026 Payrun Cycle' },
              { value: 'Jul 2026', label: 'July 2026 Payrun Cycle' },
            ]}
            value={deductionStartMonth}
            onChange={setDeductionStartMonth}
            leftSection={<IconCalendar size={16} color="#71717A" />}
            styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
          />

          {/* EMI Calculation Summary Box */}
          <Paper p="md" radius="md" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Group justify="space-between" align="center">
              <div>
                <Text size="xs" c="#1E40AF" fw={600}>
                  Estimated Monthly EMI Recovery:
                </Text>
                <Text size="lg" fw={800} c="#1D4ED8">
                  ₹{monthlyEmi.toLocaleString('en-IN')} / month
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text size="11px" c="#60A5FA">
                  Tenure: {tenureMonths} Months • 0% Corporate Interest
                </Text>
                <Text size="11px" c="#1E40AF" fw={500}>
                  Auto-deducted under Payslip Deductions Line
                </Text>
              </div>
            </Group>
          </Paper>

          <Textarea
            label="Purpose / Justification Notes"
            placeholder="Brief reason for the advance or loan request..."
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            styles={{ input: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' } }}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" color="dark" loading={submitting} leftSection={<IconCheck size={16} />}>
              {isManager ? 'Sanction Loan' : 'Submit Loan Request'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
