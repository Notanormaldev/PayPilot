import React, { useState } from 'react';
import { Paper, Stack, Group, Text, Badge, Button, Table, ActionIcon } from '@mantine/core';
import { IconDownload, IconPlayerPlay } from '@tabler/icons-react';
import { fetchApi } from '../lib/api';

interface PayrunViewProps {
  payruns: any[];
  onRefresh: () => void;
}

export const PayrunView: React.FC<PayrunViewProps> = ({ payruns, onRefresh }) => {
  const [computing, setComputing] = useState(false);
  const [selectedPayrunId, setSelectedPayrunId] = useState<string | null>(payruns[0]?.id || null);
  const [payrunDetail, setPayrunDetail] = useState<any>(null);

  React.useEffect(() => {
    if (payruns.length > 0 && !selectedPayrunId) {
      setSelectedPayrunId(payruns[0].id);
    }
  }, [payruns, selectedPayrunId]);

  React.useEffect(() => {
    if (selectedPayrunId) {
      fetchApi<{ data: any }>(`/payruns/${selectedPayrunId}`)
        .then((res) => setPayrunDetail(res.data))
        .catch(() => {});
    }
  }, [selectedPayrunId]);

  const handleCompute = async () => {
    if (!selectedPayrunId) return;
    setComputing(true);
    try {
      await fetchApi(`/payruns/${selectedPayrunId}/compute`, { method: 'POST' });
      onRefresh();
      const res = await fetchApi<{ data: any }>(`/payruns/${selectedPayrunId}`);
      setPayrunDetail(res.data);
    } catch (err: any) {
      alert(`Computation error: ${err.message}`);
    } finally {
      setComputing(false);
    }
  };

  const handleDownloadPdf = (payslipId: string) => {
    const token = localStorage.getItem('paypilot_auth_token') || 'dev-admin-token';
    window.open(`/api/payruns/payslips/${payslipId}/pdf?token=${token}`, '_blank');
  };

  const currentPayrun = payruns.find((p) => p.id === selectedPayrunId) || payruns[0];

  return (
    <Stack gap="md">
      {/* Payrun Header Card */}
      <Paper p="md" radius="sm">
        <Group justify="space-between" align="center">
          <div>
            <Group gap="xs" mb={4}>
              <Text size="lg" fw={700} c="#09090B">
                {currentPayrun?.name || 'Monthly Payrun'}
              </Text>
              <Badge color="blue" variant="filled">
                {currentPayrun?.status || 'COMPUTED'}
              </Badge>
            </Group>
            <Text size="xs" c="#71717A">
              Period: {currentPayrun ? `${new Date(currentPayrun.periodStart).toLocaleDateString()} – ${new Date(currentPayrun.periodEnd).toLocaleDateString()}` : 'Current Month'}
            </Text>
          </div>

          <Group gap="sm">
            <Button
              size="sm"
              color="dark"
              leftSection={<IconPlayerPlay size={14} />}
              loading={computing}
              onClick={handleCompute}
            >
              Recompute Batch
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Payslips Table */}
      <Paper p="md" radius="sm">
        <Text size="xs" fw={700} c="#71717A" mb="md" style={{ letterSpacing: '0.04em' }}>
          INDIVIDUAL PAYSLIPS & LINE BREAKDOWNS ({payrunDetail?.payslips?.length || 0})
        </Text>

        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>EMPLOYEE</Table.Th>
              <Table.Th>WORKED DAYS</Table.Th>
              <Table.Th>BASIC</Table.Th>
              <Table.Th>GROSS</Table.Th>
              <Table.Th>DEDUCTIONS</Table.Th>
              <Table.Th>NET PAY</Table.Th>
              <Table.Th>SENTINEL AUDIT</Table.Th>
              <Table.Th>PDF</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {payrunDetail?.payslips?.map((slip: any) => {
              const basicLine = slip.lines?.find((l: any) => l.code === 'BASIC');
              const grossLine = slip.lines?.find((l: any) => l.code === 'GROSS');
              const netLine = slip.lines?.find((l: any) => l.code === 'NET');
              const pfLine = slip.lines?.find((l: any) => l.code === 'PF');
              const ptLine = slip.lines?.find((l: any) => l.code === 'PT');
              const totalDeductions = (pfLine ? Number(pfLine.amount) : 0) + (ptLine ? Number(ptLine.amount) : 0);
              const openFlags = slip.flags?.filter((f: any) => f.status === 'OPEN') || [];

              return (
                <Table.Tr key={slip.id}>
                  <Table.Td>
                    <Text size="sm" fw={600} c="#09090B">
                      {slip.employee.name}
                    </Text>
                    <Text size="xs" c="#71717A">
                      {slip.employee.department}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs" c="#52525B" style={{ fontFamily: 'JetBrains Mono' }}>
                      {slip.workedDays} days
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs" c="#3F3F46" style={{ fontFamily: 'JetBrains Mono' }}>
                      ₹{basicLine ? Number(basicLine.amount).toLocaleString('en-IN') : '0'}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs" c="#3F3F46" style={{ fontFamily: 'JetBrains Mono' }}>
                      ₹{grossLine ? Number(grossLine.amount).toLocaleString('en-IN') : '0'}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs" c="#DC2626" style={{ fontFamily: 'JetBrains Mono' }}>
                      -₹{totalDeductions.toLocaleString('en-IN')}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Text size="sm" fw={700} c="#059669" style={{ fontFamily: 'JetBrains Mono' }}>
                      ₹{netLine ? Number(netLine.amount).toLocaleString('en-IN') : '0'}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    {openFlags.length > 0 ? (
                      <Badge size="xs" color="red" variant="filled">
                        {openFlags.length} Flagged
                      </Badge>
                    ) : (
                      <Badge size="xs" color="teal" variant="light">
                        Clear
                      </Badge>
                    )}
                  </Table.Td>

                  <Table.Td>
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="blue"
                      onClick={() => handleDownloadPdf(slip.id)}
                    >
                      <IconDownload size={14} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
};
