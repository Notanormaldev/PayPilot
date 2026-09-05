import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Advaith', 'Aaryav', 'Dhruv', 'Kabir', 'Rudra', 'Ananya',
  'Diya', 'Gauri', 'Isha', 'Kavya', 'Khushi', 'Mira', 'Navya', 'Pari', 'Prisha', 'Riya',
  'Saanvi', 'Shanaya', 'Sneha', 'Tanya', 'Vanya', 'Zoya', 'Aditi', 'Ahana', 'Avni', 'Chhavi',
  'Devika', 'Divya', 'Eesha', 'Garima', 'Gayatri', 'Hamsini', 'Harini', 'Hema', 'Himani', 'Indira',
  'Jahnvi', 'Jaya', 'Jyoti', 'Kalyani', 'Kamala', 'Kanika', 'Kareena', 'Karishma', 'Kashvi', 'Ketaki',
  'Kiran', 'Komal', 'Krithika', 'Kumari', 'Lakshmi', 'Lalita', 'Lavanya', 'Lekha', 'Leela', 'Madhavi',
  'Madhuri', 'Malini', 'Manju', 'Manorama', 'Maya', 'Meena', 'Meera', 'Menaka', 'Minal', 'Mohini',
  'Monika', 'Mrinalini', 'Mukta', 'Mythili', 'Nandini', 'Nandita', 'Naveena', 'Neela', 'Neelam', 'Neeta',
  'Neha', 'Netra', 'Nidhi', 'Nikita', 'Nilima', 'Nirmala', 'Nisha', 'Nishita', 'Nita', 'Nitya',
  'Padma', 'Padmini', 'Pallavi', 'Parvati', 'Pavithra', 'Pooja', 'Poonam', 'Prabhavati', 'Pratibha', 'Pratima',
  'Preeti', 'Prema', 'Priyanka', 'Pushpa', 'Radha', 'Radhika', 'Ragini', 'Rajani', 'Rajeshwari', 'Rakhi',
  'Rani', 'Rashmi', 'Ratna', 'Reena', 'Rekha', 'Renuka', 'Revathi', 'Richa', 'Rina', 'Ritu',
  'Rohini', 'Roshni', 'Roopa', 'Rupa', 'Sabita', 'Sadhana', 'Sakshi', 'Saloni', 'Samiksha', 'Sandhya',
  'Sangeeta', 'Sanika', 'Santhi', 'Sapna', 'Sarada', 'Sarala', 'Saraswati', 'Sarika', 'Sarita', 'Saroja',
  'Shalini', 'Shanti', 'Sharada', 'Sharmila', 'Shashi', 'Sheetal', 'Shikha', 'Shilpa', 'Shobha', 'Shraddha',
  'Shreya', 'Shruti', 'Shubha', 'Simran', 'Smita', 'Smitha', 'Smriti', 'Sobhana', 'Soma', 'Sonali',
  'Abhishek', 'Adarsh', 'Ajay', 'Akash', 'Alok', 'Amit', 'Anand', 'Anil', 'Ankit', 'Anshuman',
  'Arun', 'Ashish', 'Ashok', 'Avinash', 'Balaji', 'Bharat', 'Bhaskar', 'Brijesh', 'Chetan', 'Chirag',
  'Deepak', 'Dinesh', 'Ganesh', 'Gaurav', 'Girish', 'Harish', 'Harsh', 'Hemant', 'Hiten', 'Jagdish',
  'Jayant', 'Jitendra', 'Kailash', 'Kalyan', 'Kamal', 'Karan', 'Kartik', 'Ketan', 'Kishore', 'Kuldeep',
  'Lalit', 'Madhav', 'Mahesh', 'Manish', 'Manoj', 'Mayank', 'Mitesh', 'Mohan', 'Mohit', 'Mukesh',
  'Naresh', 'Naveen', 'Nikhil', 'Nilesh', 'Nitin', 'Pankaj', 'Parag', 'Paresh', 'Pawan', 'Pradeep',
  'Prakash', 'Prashant', 'Praveen', 'Raghav', 'Rahul', 'Raj', 'Rajeev', 'Rajendra', 'Rajesh', 'Rajnish',
  'Rakesh', 'Ramesh', 'Ranjan', 'Ranjit', 'Ravi', 'Ritesh', 'Rohit', 'Sachin', 'Sameer', 'Sandip',
  'Sanjay', 'Sanjeev', 'Santosh', 'Sarvesh', 'Satish', 'Saurabh', 'Sharad', 'Shashi', 'Shashank', 'Shekhar',
  'Shirish', 'Shravan', 'Shrikant', 'Siddharth', 'Somesh', 'Subhash', 'Sudhir', 'Suhas', 'Sumit', 'Sunil',
  'Suraj', 'Suresh', 'Swapnil', 'Tarun', 'Tejas', 'Uday', 'Umesh', 'Utkarsh', 'Varun', 'Vasant',
  'Venkatesh', 'Vijay', 'Vikas', 'Vikram', 'Vinay', 'Vinod', 'Vipul', 'Virendra', 'Vishal', 'Yogesh'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Gupta', 'Mehta', 'Nair', 'Iyer', 'Joshi', 'Reddy', 'Menon',
  'Singhania', 'Kapoor', 'Rao', 'Bhat', 'Deshmukh', 'Kulkarni', 'Malhotra', 'Banerjee', 'Chatterjee', 'Das',
  'Bose', 'Sen', 'Dutta', 'Ghosh', 'Mukherjee', 'Roy', 'Saha', 'Sarkar', 'Mitra', 'Chowdhury',
  'Chauhan', 'Thakur', 'Rathore', 'Solanki', 'Parmar', 'Bhattacharya', 'Dubey', 'Trivedi', 'Pandey', 'Mishra',
  'Shukla', 'Tiwari', 'Chaubey', 'Agrawal', 'Goyal', 'Bansal', 'Mittal', 'Singhal', 'Khandelwal', 'Maheshwari',
  'Soni', 'Seth', 'Saxena', 'Srivastava', 'Sinha', 'Nigam', 'Mathur', 'Johari', 'Bhatnagar', 'Kulshrestha',
  'Rastogi', 'Varshney', 'Poddar', 'Jain', 'Shah', 'Dalal', 'Parekh', 'Vakil', 'Merchant', 'Zaveri',
  'Desai', 'Modi', 'Nanavati', 'Munshi', 'Amin', 'Chokshi', 'Choksi', 'Barot', 'Panchal', 'Gajjar',
  'Suthar', 'Soni', 'Darji', 'Mistry', 'Luhar', 'Kansara', 'Kapadia', 'Gandhi', 'Chitnis', 'Gokhale',
  'Bapat', 'Kharche', 'Pawar', 'Gaikwad', 'Shinde', 'Bhosale', 'Jadhav', 'Kadam', 'Sawant', 'More'
];

const DEPARTMENTS = [
  { name: 'Engineering', roles: ['VP of Engineering', 'Lead Architect', 'Staff Software Engineer', 'Senior Backend Engineer', 'Frontend Engineer', 'Full Stack Developer', 'QA Automation Lead', 'DevOps Specialist', 'Systems Engineer'] },
  { name: 'Product & Design', roles: ['Head of Product', 'Principal Product Manager', 'Senior Product Manager', 'Associate PM', 'Lead UX Designer', 'Product Designer', 'Design Systems Specialist', 'User Researcher'] },
  { name: 'Data & AI', roles: ['Chief Data Officer', 'Principal Data Scientist', 'AI/ML Research Engineer', 'Data Platform Engineer', 'BI Analytics Lead', 'Data Engineer', 'Quantitative Analyst'] },
  { name: 'HR & People', roles: ['Chief People Officer', 'HR Director', 'Senior HRBP', 'People Operations Lead', 'Talent Acquisition Lead', 'Technical Recruiter', 'HR Coordinator', 'Workplace Culture Specialist'] },
  { name: 'Payroll & Compliance', roles: ['Head of Payroll', 'Senior Payroll Specialist', 'Compensation & Benefits Lead', 'Statutory Compliance Auditor', 'Taxation Analyst', 'Payroll Operations Associate'] },
  { name: 'Finance & Accounts', roles: ['Chief Financial Officer', 'Director of Finance', 'Financial Controller', 'Senior FP&A Analyst', 'Accounts Payable Lead', 'Treasury Specialist', 'Internal Audit Manager'] },
  { name: 'Sales & Growth', roles: ['VP of Global Sales', 'Enterprise Account Director', 'Regional Sales Manager', 'Account Executive', 'Sales Development Rep', 'Solutions Consultant', 'Strategic Deal Desk Specialist'] },
  { name: 'Marketing', roles: ['Chief Marketing Officer', 'Growth Marketing Director', 'Brand Strategy Lead', 'Performance Marketing Specialist', 'Content Marketing Lead', 'SEO & Lifecycle Strategist', 'Communications Manager'] },
  { name: 'Customer Success', roles: ['VP of Customer Experience', 'Enterprise CS Director', 'Senior Customer Success Manager', 'Implementation Consultant', 'Technical Account Manager', 'Client Support Lead'] },
  { name: 'Legal & Governance', roles: ['General Counsel', 'Legal Affairs Director', 'Corporate Governance Lead', 'Data Privacy Officer', 'Contract Specialist', 'Regulatory Affairs Manager'] },
  { name: 'Operations & Infra', roles: ['Director of Operations', 'Global Workplace Lead', 'Cloud Infrastructure Architect', 'Site Reliability Engineer', 'Procurement Specialist', 'IT Systems Administrator'] }
];

const BANK_IFSC_PREFIXES = ['HDFC000', 'ICIC000', 'SBIN000', 'UTIB000', 'KKBK000', 'YESB000', 'PUNB000', 'BARB000', 'INDB000', 'AXIS000'];
const BANK_NAMES = ['HDFC Bank Ltd', 'ICICI Bank Ltd', 'State Bank of India', 'Axis Bank Ltd', 'Kotak Mahindra Bank', 'Yes Bank Ltd', 'Punjab National Bank', 'Bank of Baroda', 'IndusInd Bank', 'Federal Bank'];

async function seed250Employees() {
  console.log('🚀 [Seed 250+] Starting generation of 260+ employees with realistic salaries and contracts...');

  // 1. Ensure Organization
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'PayPilot Global Inc.',
        timezone: 'Asia/Kolkata',
      },
    });
  }

  // 2. Ensure Working Schedule
  let schedule = await prisma.workingSchedule.findFirst({
    where: { orgId: org.id },
  });
  if (!schedule) {
    schedule = await prisma.workingSchedule.create({
      data: {
        name: 'Standard 40h (Mon-Fri 09:00 - 18:00)',
        orgId: org.id,
        isActive: true,
      },
    });
  }

  // 3. Ensure Salary Structure
  let structure = await prisma.salaryStructure.findFirst({
    include: { rules: true },
  });
  if (!structure) {
    structure = await prisma.salaryStructure.create({
      data: {
        name: 'Standard Indian Statutory Compensation (2026)',
        isActive: true,
      },
      include: { rules: true },
    });
  }

  // 4. Generate 260 Employees
  const targetCount = 265;
  const existingEmployees = await prisma.employee.findMany({ select: { workEmail: true } });
  const existingEmails = new Set(existingEmployees.map((e) => e.workEmail.toLowerCase()));

  console.log(`ℹ️ Current employees in DB: ${existingEmployees.length}`);

  let createdCount = 0;
  const usedCombos = new Set();

  for (let i = 0; i < targetCount; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 3 + Math.floor(i / FIRST_NAMES.length)) % LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;

    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@paypilot.internal`;
    if (existingEmails.has(email) || usedCombos.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@paypilot.internal`;
    }
    usedCombos.add(email);
    existingEmails.add(email);

    const deptObj = DEPARTMENTS[i % DEPARTMENTS.length];
    const deptName = deptObj.name;
    const roleName = deptObj.roles[i % deptObj.roles.length];

    // Salary range between 45k to 2.8 Lakhs / month
    const baseWages = [45000, 55000, 68000, 82000, 95000, 110000, 125000, 140000, 165000, 185000, 210000, 245000, 280000, 320000];
    const wage = baseWages[i % baseWages.length] + ((i * 500) % 8000);

    // Bank
    const bankIdx = i % BANK_NAMES.length;
    const bankName = BANK_NAMES[bankIdx];
    const ifsc = `${BANK_IFSC_PREFIXES[bankIdx]}${1000 + (i % 9000)}`;
    const bankAccount = `50100${String(10000000 + i * 789).slice(0, 8)}`;
    const bankVerificationStatus = i % 15 === 0 ? 'PENDING' : 'VERIFIED';

    // Status: 92% ACTIVE, 5% ON_LEAVE, 3% INACTIVE
    let status = 'ACTIVE';
    if (i % 25 === 0) status = 'ON_LEAVE';
    else if (i % 40 === 0) status = 'INACTIVE';

    try {
      let emp = await prisma.employee.findUnique({ where: { workEmail: email } });
      if (!emp) {
        emp = await prisma.employee.create({
          data: {
            name: fullName,
            workEmail: email,
            department: deptName,
            jobPosition: roleName,
            scheduleId: schedule.id,
            orgId: org.id,
            status,
            bankAccount,
            bankName,
            ifscCode: ifsc,
            accountHolderName: fullName,
            bankBranch: 'Main Corporate Hub Branch',
            bankVerificationStatus,
          },
        });

        // Create Running Contract
        await prisma.contract.create({
          data: {
            employeeId: emp.id,
            startDate: new Date(2025, (i % 12), 1),
            wage,
            department: deptName,
            jobPosition: roleName,
            salaryStructureId: structure.id,
            status: status === 'INACTIVE' ? 'EXPIRED' : 'RUNNING',
          },
        });

        createdCount++;
        if (createdCount % 25 === 0) {
          console.log(`✅ Seeded ${createdCount} employees so far...`);
        }
      }
    } catch (err) {
      console.warn(`Warning on employee ${email}:`, err.message);
    }
  }

  const finalTotal = await prisma.employee.count();
  console.log(`🎉 [Done] Seeded ${createdCount} new employees! Total employees in database now: ${finalTotal}`);
  await prisma.$disconnect();
}

seed250Employees()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  });
