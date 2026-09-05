import React, { useState } from 'react';
import { Paper, Grid, Text, Group, Box, Anchor, UnstyledButton } from '@mantine/core';
import { IconBuildingBank, IconShieldCheck, IconPercentage, IconChevronRight } from '@tabler/icons-react';
import { StatutoryDeductionModal } from './StatutoryDeductionModal';

export const DeductionSummary = ({ kpis, employeesCount = 301 }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('EPF');

  const epfAmount = kpis?.statutoryDeductions?.epf || 3973913.00;
  const esiAmount = kpis?.statutoryDeductions?.esi || 91010.00;
  const tdsAmount = kpis?.statutoryDeductions?.tds || 11589089.00;

  const handleOpenModal = (tab) => {
    setSelectedTab(tab);
    setModalOpen(true);
  };

  return (
    <>
      <Grid>
        {/* EPF */}
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Paper
            p="md"
            radius="md"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              height: '100%',
              transition: 'all 0.15s ease',
            }}
          >
            <Group justify="space-between" mb="xs">
              <Text size="11px" fw={700} c="#71717A" style={{ letterSpacing: '0.5px' }}>
                EPF (PROVIDENT FUND)
              </Text>
              <IconBuildingBank size={16} color="#64748B" />
            </Group>
            <Text size="18px" fw={800} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              ₹{Number(epfAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <UnstyledButton
              onClick={() => handleOpenModal('EPF')}
              style={{ display: 'inline-flex', alignItems: 'center', marginTop: '8px', cursor: 'pointer' }}
            >
              <Text size="11px" c="#2563EB" fw={600} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                View Details <IconChevronRight size={12} />
              </Text>
            </UnstyledButton>
          </Paper>
        </Grid.Col>

        {/* ESI */}
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Paper
            p="md"
            radius="md"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              height: '100%',
              transition: 'all 0.15s ease',
            }}
          >
            <Group justify="space-between" mb="xs">
              <Text size="11px" fw={700} c="#71717A" style={{ letterSpacing: '0.5px' }}>
                ESI (INSURANCE)
              </Text>
              <IconShieldCheck size={16} color="#64748B" />
            </Group>
            <Text size="18px" fw={800} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              ₹{Number(esiAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <UnstyledButton
              onClick={() => handleOpenModal('ESI')}
              style={{ display: 'inline-flex', alignItems: 'center', marginTop: '8px', cursor: 'pointer' }}
            >
              <Text size="11px" c="#2563EB" fw={600} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                View Details <IconChevronRight size={12} />
              </Text>
            </UnstyledButton>
          </Paper>
        </Grid.Col>

        {/* TDS Deduction */}
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Paper
            p="md"
            radius="md"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              height: '100%',
              transition: 'all 0.15s ease',
            }}
          >
            <Group justify="space-between" mb="xs">
              <Text size="11px" fw={700} c="#71717A" style={{ letterSpacing: '0.5px' }}>
                TDS DEDUCTION (TAX)
              </Text>
              <IconPercentage size={16} color="#64748B" />
            </Group>
            <Text size="18px" fw={800} c="#09090B" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              ₹{Number(tdsAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <UnstyledButton
              onClick={() => handleOpenModal('TDS')}
              style={{ display: 'inline-flex', alignItems: 'center', marginTop: '8px', cursor: 'pointer' }}
            >
              <Text size="11px" c="#2563EB" fw={600} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                View Details <IconChevronRight size={12} />
              </Text>
            </UnstyledButton>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Drilldown Modal */}
      <StatutoryDeductionModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={selectedTab}
        kpis={kpis}
      />
    </>
  );
};

