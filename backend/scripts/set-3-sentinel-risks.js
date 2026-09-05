import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function setThreeSentinelRisks() {
  console.log('🔄 Setting up exactly 3 active Sentinel risk flags for employee banking audits...');

  // 1. Ensure 'employee' has missing bank details
  let emp1 = await prisma.employee.findFirst({
    where: { name: { contains: 'employee' } },
  });
  if (emp1) {
    await prisma.employee.update({
      where: { id: emp1.id },
      data: { bankAccount: null, bankName: null, ifscCode: null },
    });
    console.log(`✔ Flag 1: ${emp1.name} (${emp1.id}) set to missing bank details.`);
  }

  // 2. Ensure 'aditya.joshi' or another staff employee has missing bank details
  let emp2 = await prisma.employee.findFirst({
    where: { workEmail: { contains: 'aditya.joshi' } },
  });
  if (!emp2) {
    emp2 = await prisma.employee.findFirst({
      where: { status: 'ACTIVE', bankAccount: { not: null } },
    });
  }
  if (emp2) {
    await prisma.employee.update({
      where: { id: emp2.id },
      data: { bankAccount: null, bankName: null, ifscCode: null },
    });
    console.log(`✔ Flag 2: ${emp2.name} (${emp2.id}) set to missing bank details.`);
  }

  // 3. Ensure 'pooja.menon' or another staff employee has missing bank details
  let emp3 = await prisma.employee.findFirst({
    where: { workEmail: { contains: 'pooja.menon' } },
  });
  if (!emp3) {
    emp3 = await prisma.employee.findMany({
      where: { status: 'ACTIVE', bankAccount: { not: null } },
    }).then(list => list.find(e => e.id !== emp1?.id && e.id !== emp2?.id));
  }
  if (emp3) {
    await prisma.employee.update({
      where: { id: emp3.id },
      data: { bankAccount: null, bankName: null, ifscCode: null },
    });
    console.log(`✔ Flag 3: ${emp3.name} (${emp3.id}) set to missing bank details.`);
  }

  // Set all other active staff employees to have valid bank details so there are exactly 3 risks total
  const otherEmps = await prisma.employee.findMany({
    where: {
      id: { notIn: [emp1?.id, emp2?.id, emp3?.id].filter(Boolean) },
    },
  });

  for (const other of otherEmps) {
    if (!other.bankAccount || other.bankAccount.trim() === '') {
      await prisma.employee.update({
        where: { id: other.id },
        data: {
          bankAccount: `AC-99${Math.floor(100000 + Math.random() * 900000)}`,
          bankName: 'HDFC Bank Ltd',
          ifscCode: 'HDFC0001829',
        },
      });
    }
  }

  console.log('🎉 Successfully configured exactly 3 active employee risk flags!');
}

setThreeSentinelRisks()
  .catch((e) => {
    console.error('❌ Error setting 3 sentinel risks:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
