import React, { useState } from 'react';
import {
  Paper,
  Table,
  Badge,
  Text,
  Group,
  Button,
  Stack,
  ActionIcon,
  Modal,
  Divider,
} from '@mantine/core';
import {
  IconPlayerPlay,
  IconDownload,
  IconEye,
  IconReceipt2,
  IconCheck,
} from '@tabler/icons-react';
import { payrollService } from '../services/payrollService';

export const PayrunView = ({ payruns, onRefresh }) => {
  const [computingId, setComputingId] = useState(null);
  const [selectedPayslips, setSelectedPayslips] = useState(null);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);

  const handleCompute = async (payrunId) => {
    setComputingId(payrunId);
    try {
      await payrollService.computePayrun(payrunId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Computation failed:', err);
    } finally {
      setComputingId(null);
    }
  };

  const handleViewPayslips = (slips) => {
    setSelectedPayslips(slips);
    setPayslipModalOpen(true);
  };

  return (
    <Stack gap="md">
      <Paper
        p="lg"
        radius="md"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Group justify="space-between" mb="md">
          <div>
            <Text fw={700} size="sm" c="#09090B">
              PAYROLL BATCH RUNS & SETTLEMENTS
            </Text>
            <Text size="xs" c="#71717A">
              Deterministic AST salary formula calculation engine with period-correct contract resolution
            </Text>
          </div>
          <Badge size="sm" color="teal" variant="light">
            Formula Engine: Active
          </Badge>
        </Group>

        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr style={{ borderBottom: '1px solid #E2E8F0' }}>
              <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>PAY PERIOD</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>CYCLE</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>STATUS</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>TOTAL GROSS</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>TOTAL NET</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px' }}>SLIPS</Table.Th>
              <Table.Th style={{ color: '#71717A', fontSize: '11px', textAlign: 'right' }}>ACTIONS</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {payruns && payruns.length > 0 ? (
              payruns.map((pr) => (
                <Table.Tr key={pr.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <Table.Td>
                    <Text size="xs" fw={700} c="#09090B">
                      {pr.name}
                    </Text>
                    <Text size="10px" c="#71717A">
                      {new Date(pr.periodStart).toLocaleDateString()} – {new Date(pr.periodEnd).toLocaleDateString()}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs" c="#09090B">
                      {pr.cycle}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Badge
                      size="xs"
                      color={
                        pr.status === 'PAID'
                          ? 'teal'
                          : pr.status === 'COMPUTED'
                          ? 'blue'
                          : 'gray'
                      }
                      variant="light"
                    >
                      {pr.status}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs" fw={600} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      ₹{pr.totalGross ? Number(pr.totalGross).toLocaleString('en-IN') : '0.00'}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs" fw={700} c="#0D9488" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      ₹{pr.totalNet ? Number(pr.totalNet).toLocaleString('en-IN') : '0.00'}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Badge size="xs" variant="outline" color="dark">
                      {pr.payslips?.length || 0} Slips
                    </Badge>
                  </Table.Td>

                  <Table.Td style={{ textAlign: 'right' }}>
                    <Group gap="xs" justify="flex-end">
                      <Button
                        size="xs"
                        variant="default"
                        leftSection={<IconPlayerPlay size={12} />}
                        loading={computingId === pr.id}
                        onClick={() => handleCompute(pr.id)}
                        styles={{
                          root: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', color: '#09090B' },
                        }}
                      >
                        Recompute
                      </Button>

                      {pr.payslips && pr.payslips.length > 0 && (
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewPayslips(pr.payslips)}
                          title="View Payslips"
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      )}

                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="dark"
                        component="a"
                        href={payrollService.exportPdf(pr.id)}
                        target="_blank"
                        title="Download PDF"
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={7} style={{ textAlign: 'center', color: '#71717A', padding: '24px' }}>
                  No payruns available. Click Recompute to generate a live payrun batch.
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Payslip Modal */}
      <Modal
        opened={payslipModalOpen}
        onClose={() => setPayslipModalOpen(false)}
        title={
          <Group gap="xs">
            <IconReceipt2 size={18} color="#09090B" />
            <Text fw={700} size="sm" c="#09090B">
              Detailed Employee Payslip Breakdown
            </Text>
          </Group>
        }
        size="lg"
        styles={{
          content: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
          header: { backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' },
        }}
      >
        <Stack gap="md">
          {selectedPayslips?.map((slip) => (
            <Paper
              key={slip.id}
              p="sm"
              radius="sm"
              style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
            >
              <Group justify="space-between" mb="xs">
                <div>
                  <Text size="xs" fw={700} c="#09090B">
                    {slip.employee?.firstName} {slip.employee?.lastName} ({slip.employee?.employeeNumber})
                  </Text>
                  <Text size="10px" c="#71717A">
                    {slip.employee?.department} • {slip.employee?.jobTitle}
                  </Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text size="11px" fw={700} c="#0D9488" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    Net: ₹{Number(slip.netPay).toLocaleString('en-IN')}
                  </Text>
                  <Text size="9px" c="#71717A">
                    Gross: ₹{Number(slip.grossPay).toLocaleString('en-IN')} | Ded: ₹{Number(slip.totalDeductions).toLocaleString('en-IN')}
                  </Text>
                </div>
              </Group>

              <Divider my={6} color="#E2E8F0" />

              <Group gap="xs" wrap="wrap">
                {slip.lines?.map((line, idx) => (
                  <Badge
                    key={idx}
                    size="xs"
                    variant="outline"
                    color={line.category === 'DEDUCTION' ? 'red' : 'teal'}
                  >
                    {line.code}: ₹{Number(line.total).toLocaleString('en-IN')}
                  </Badge>
                ))}
              </Group>
            </Paper>
          ))}
        </Stack>
      </Modal>
    </Stack>
  );
};
