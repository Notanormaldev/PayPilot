// Indian Statutory and Corporate Holiday Calendar Dataset for 2026
// Aligned with Ministry of Personnel, Public Grievances and Pensions (DoPT) & Enterprise HR Standards

export const INDIAN_HOLIDAYS_2026 = [
  // --- Q1: JAN - MAR ---
  {
    id: 'hol-2026-01-01',
    name: "New Year's Day",
    date: '2026-01-01',
    day: 'Thursday',
    month: 1,
    quarter: 'Q1',
    type: 'RESTRICTED',
    category: 'Cultural & Modern',
    locations: ['ALL', 'BENGALURU', 'MUMBAI', 'DELHI_NCR', 'HYDERABAD', 'PUNE'],
    description: 'First day of the Gregorian year 2026. Celebrated worldwide with new beginnings.',
    isLongWeekend: false,
    longWeekendTip: 'Take Friday (Jan 02) off to enjoy a 4-day start to the year!',
  },
  {
    id: 'hol-2026-01-14',
    name: 'Makar Sankranti / Pongal / Magh Bihu',
    date: '2026-01-14',
    day: 'Wednesday',
    month: 1,
    quarter: 'Q1',
    type: 'RESTRICTED',
    category: 'Harvest Festival',
    locations: ['ALL', 'BENGALURU', 'HYDERABAD', 'MUMBAI', 'CHENNAI'],
    description: 'Major pan-Indian harvest festival marking the transition of the Sun into Makara Rashi.',
    isLongWeekend: false,
  },
  {
    id: 'hol-2026-01-26',
    name: 'Republic Day',
    date: '2026-01-26',
    day: 'Monday',
    month: 1,
    quarter: 'Q1',
    type: 'GAZETTED',
    category: 'National Holiday',
    locations: ['ALL'],
    description: 'National holiday honoring the date on which the Constitution of India came into effect in 1950.',
    isLongWeekend: true,
    longWeekendTip: '3-Day Long Weekend (Sat, Jan 24 – Mon, Jan 26)!',
  },
  {
    id: 'hol-2026-02-15',
    name: 'Maha Shivratri',
    date: '2026-02-15',
    day: 'Sunday',
    month: 2,
    quarter: 'Q1',
    type: 'GAZETTED',
    category: 'Religious Observance',
    locations: ['ALL'],
    description: 'Auspicious Hindu festival dedicated to the devotion and reverence of Lord Shiva.',
    isLongWeekend: false,
  },
  {
    id: 'hol-2026-03-04',
    name: 'Holi (Festival of Colors / Dhulandi)',
    date: '2026-03-04',
    day: 'Wednesday',
    month: 3,
    quarter: 'Q1',
    type: 'GAZETTED',
    category: 'Cultural & Spring Festival',
    locations: ['ALL'],
    description: 'The festival of colors celebrating the victory of good over evil and the arrival of spring.',
    isLongWeekend: false,
    longWeekendTip: 'Take Thu & Fri (Mar 05-06) off for a 5-day spring getaway!',
  },
  {
    id: 'hol-2026-03-19',
    name: 'Ugadi / Gudi Padwa',
    date: '2026-03-19',
    day: 'Thursday',
    month: 3,
    quarter: 'Q1',
    type: 'REGIONAL',
    category: 'Regional New Year',
    locations: ['BENGALURU', 'HYDERABAD', 'MUMBAI', 'PUNE'],
    description: 'Traditional New Year celebrated across Karnataka, Andhra Pradesh, Telangana, and Maharashtra.',
    isLongWeekend: false,
    longWeekendTip: 'Take Friday (Mar 20) off for a 4-day festive break!',
  },
  {
    id: 'hol-2026-03-20',
    name: 'Id-ul-Fitr (Ramzan Eid)',
    date: '2026-03-20',
    day: 'Friday',
    month: 3,
    quarter: 'Q1',
    type: 'GAZETTED',
    category: 'Islamic Observance',
    locations: ['ALL'],
    description: 'Islamic festival marking the end of the holy month of Ramadan (subject to moon sighting).',
    isLongWeekend: true,
    longWeekendTip: '3-Day Long Weekend (Fri, Mar 20 – Sun, Mar 22)!',
  },
  {
    id: 'hol-2026-03-31',
    name: 'Mahavir Jayanti',
    date: '2026-03-31',
    day: 'Tuesday',
    month: 3,
    quarter: 'Q1',
    type: 'GAZETTED',
    category: 'Jain Observance',
    locations: ['ALL'],
    description: 'Birth anniversary of Lord Mahavira, the twenty-fourth and last Tirthankara of Jainism.',
    isLongWeekend: false,
  },

  // --- Q2: APR - JUN ---
  {
    id: 'hol-2026-04-03',
    name: 'Good Friday',
    date: '2026-04-03',
    day: 'Friday',
    month: 4,
    quarter: 'Q2',
    type: 'GAZETTED',
    category: 'Christian Observance',
    locations: ['ALL'],
    description: 'Christian holiday commemorating the crucifixion of Jesus Christ at Calvary.',
    isLongWeekend: true,
    longWeekendTip: '3-Day Long Weekend (Fri, Apr 03 – Sun, Apr 05)!',
  },
  {
    id: 'hol-2026-04-14',
    name: 'Dr. B.R. Ambedkar Jayanti / Tamil New Year',
    date: '2026-04-14',
    day: 'Tuesday',
    month: 4,
    quarter: 'Q2',
    type: 'RESTRICTED',
    category: 'National Commemoration',
    locations: ['ALL', 'CHENNAI', 'MUMBAI', 'DELHI_NCR'],
    description: 'Birth anniversary of Dr. Bhimrao Ramji Ambedkar, chief architect of the Indian Constitution.',
    isLongWeekend: false,
  },
  {
    id: 'hol-2026-05-01',
    name: 'May Day / Maharashtra Day / Buddha Purnima',
    date: '2026-05-01',
    day: 'Friday',
    month: 5,
    quarter: 'Q2',
    type: 'GAZETTED',
    category: 'Statutory & Cultural',
    locations: ['ALL'],
    description: 'International Workers’ Day, Maharashtra Foundation Day, and Buddha Purnima celebration.',
    isLongWeekend: true,
    longWeekendTip: '3-Day Long Weekend (Fri, May 01 – Sun, May 03)!',
  },
  {
    id: 'hol-2026-05-27',
    name: 'Id-ul-Zuha (Bakrid)',
    date: '2026-05-27',
    day: 'Wednesday',
    month: 5,
    quarter: 'Q2',
    type: 'GAZETTED',
    category: 'Islamic Observance',
    locations: ['ALL'],
    description: 'Feast of the Sacrifice honoring the willingness of Ibrahim to sacrifice his son.',
    isLongWeekend: false,
  },
  {
    id: 'hol-2026-06-02',
    name: 'Telangana Formation Day',
    date: '2026-06-02',
    day: 'Tuesday',
    month: 6,
    quarter: 'Q2',
    type: 'REGIONAL',
    category: 'State Holiday',
    locations: ['HYDERABAD'],
    description: 'Commemorates the official formation of the state of Telangana in 2014.',
    isLongWeekend: false,
  },
  {
    id: 'hol-2026-06-25',
    name: 'Muharram (Ashura)',
    date: '2026-06-25',
    day: 'Thursday',
    month: 6,
    quarter: 'Q2',
    type: 'GAZETTED',
    category: 'Islamic Observance',
    locations: ['ALL'],
    description: 'Tenth day of Muharram, marking the day of Ashura.',
    isLongWeekend: false,
    longWeekendTip: 'Take Friday (Jun 26) off for a 4-day monsoon break!',
  },

  // --- Q3: JUL - SEP ---
  {
    id: 'hol-2026-08-15',
    name: 'Independence Day',
    date: '2026-08-15',
    day: 'Saturday',
    month: 8,
    quarter: 'Q3',
    type: 'GAZETTED',
    category: 'National Holiday',
    locations: ['ALL'],
    description: 'National holiday commemorating the nation’s independence from the British Empire in 1947.',
    isLongWeekend: false,
  },
  {
    id: 'hol-2026-08-25',
    name: 'Milad-un-Nabi (Id-e-Milad)',
    date: '2026-08-25',
    day: 'Tuesday',
    month: 8,
    quarter: 'Q3',
    type: 'GAZETTED',
    category: 'Islamic Observance',
    locations: ['ALL'],
    description: 'Observance of the birthday of the Islamic prophet Muhammad.',
    isLongWeekend: false,
  },
  {
    id: 'hol-2026-08-28',
    name: 'Raksha Bandhan',
    date: '2026-08-28',
    day: 'Friday',
    month: 8,
    quarter: 'Q3',
    type: 'RESTRICTED',
    category: 'Cultural Festival',
    locations: ['ALL', 'DELHI_NCR', 'MUMBAI', 'PUNE'],
    description: 'Traditional Hindu ceremony centering around the tying of a sacred thread of protection.',
    isLongWeekend: true,
    longWeekendTip: '3-Day Long Weekend (Fri, Aug 28 – Sun, Aug 30) if applying RH!',
  },
  {
    id: 'hol-2026-09-04',
    name: 'Janmashtami (Gokulashtami)',
    date: '2026-09-04',
    day: 'Friday',
    month: 9,
    quarter: 'Q3',
    type: 'RESTRICTED',
    category: 'Hindu Observance',
    locations: ['ALL', 'MUMBAI', 'DELHI_NCR', 'BENGALURU'],
    description: 'Annual Hindu festival celebrating the birth of Lord Krishna, the eighth avatar of Vishnu.',
    isLongWeekend: true,
    longWeekendTip: '3-Day Long Weekend (Fri, Sep 04 – Sun, Sep 06) if applying RH!',
  },
  {
    id: 'hol-2026-09-14',
    name: 'Ganesh Chaturthi (Vinayaka Chavithi)',
    date: '2026-09-14',
    day: 'Monday',
    month: 9,
    quarter: 'Q3',
    type: 'REGIONAL',
    category: 'Cultural & Religious',
    locations: ['MUMBAI', 'PUNE', 'HYDERABAD', 'BENGALURU'],
    description: 'Grand festival commemorating the arrival of Lord Ganesha to earth from Kailash Parvat.',
    isLongWeekend: true,
    longWeekendTip: '3-Day Long Weekend (Sat, Sep 12 – Mon, Sep 14) for West & South hubs!',
  },

  // --- Q4: OCT - DEC ---
  {
    id: 'hol-2026-10-02',
    name: 'Mahatma Gandhi Jayanti',
    date: '2026-10-02',
    day: 'Friday',
    month: 10,
    quarter: 'Q4',
    type: 'GAZETTED',
    category: 'National Holiday',
    locations: ['ALL'],
    description: 'National holiday honoring the birth anniversary of Mohandas Karamchand Gandhi (Father of the Nation).',
    isLongWeekend: true,
    longWeekendTip: '3-Day Long Weekend (Fri, Oct 02 – Sun, Oct 04)!',
  },
  {
    id: 'hol-2026-10-20',
    name: 'Dussehra (Maha Navami / Vijayadashami)',
    date: '2026-10-20',
    day: 'Tuesday',
    month: 10,
    quarter: 'Q4',
    type: 'GAZETTED',
    category: 'Major Hindu Festival',
    locations: ['ALL'],
    description: 'Major Hindu festival celebrating the victory of Good over Evil (Lord Rama over Ravana / Durga over Mahishasura).',
    isLongWeekend: false,
    longWeekendTip: 'Take Monday (Oct 19) off for a 4-Day extended Dussehra vacation!',
  },
  {
    id: 'hol-2026-10-28',
    name: 'Karva Chauth',
    date: '2026-10-28',
    day: 'Wednesday',
    month: 10,
    quarter: 'Q4',
    type: 'RESTRICTED',
    category: 'Cultural Observance',
    locations: ['ALL', 'DELHI_NCR', 'MUMBAI'],
    description: 'Fasting and prayer ritual observed by married women for safety and longevity of husbands.',
    isLongWeekend: false,
  },
  {
    id: 'hol-2026-11-01',
    name: 'Kannada Rajyotsava (Karnataka Formation Day)',
    date: '2026-11-01',
    day: 'Sunday',
    month: 11,
    quarter: 'Q4',
    type: 'REGIONAL',
    category: 'State Holiday',
    locations: ['BENGALURU'],
    description: 'Celebrated across Karnataka to commemorate the merging of Kannada speaking regions into one state in 1956.',
    isLongWeekend: false,
  },
  {
    id: 'hol-2026-11-08',
    name: 'Diwali (Deepavali / Lakshmi Puja)',
    date: '2026-11-08',
    day: 'Sunday',
    month: 11,
    quarter: 'Q4',
    type: 'GAZETTED',
    category: 'Festival of Lights',
    locations: ['ALL'],
    description: 'Grand pan-Indian festival of lights symbolizing spiritual victory of light over darkness and knowledge over ignorance.',
    isLongWeekend: false,
  },
  {
    id: 'hol-2026-11-09',
    name: 'Govardhan Puja / New Year (Vikram Samvat)',
    date: '2026-11-09',
    day: 'Monday',
    month: 11,
    quarter: 'Q4',
    type: 'RESTRICTED',
    category: 'Religious Celebration',
    locations: ['ALL', 'DELHI_NCR', 'MUMBAI'],
    description: 'Commemoration of Lord Krishna lifting Govardhan Hill to protect Gokul residents from torrential rains.',
    isLongWeekend: true,
    longWeekendTip: '3-Day Post-Diwali Weekend (Sat, Nov 07 – Mon, Nov 09) if taking RH!',
  },
  {
    id: 'hol-2026-11-10',
    name: 'Bhai Dooj / Yama Dwitiya',
    date: '2026-11-10',
    day: 'Tuesday',
    month: 11,
    quarter: 'Q4',
    type: 'RESTRICTED',
    category: 'Family Festival',
    locations: ['ALL', 'DELHI_NCR', 'MUMBAI', 'PUNE'],
    description: 'Celebration of the sacred bond between brothers and sisters following Diwali festivities.',
    isLongWeekend: false,
  },
  {
    id: 'hol-2026-11-15',
    name: 'Chhath Puja (Surya Shashthi)',
    date: '2026-11-15',
    day: 'Sunday',
    month: 11,
    quarter: 'Q4',
    type: 'RESTRICTED',
    category: 'Vedic Sun Worship',
    locations: ['ALL', 'DELHI_NCR', 'MUMBAI'],
    description: 'Ancient Hindu festival dedicated to the Solar deity Surya and Chhathi Maiya.',
    isLongWeekend: false,
  },
  {
    id: 'hol-2026-11-24',
    name: 'Guru Nanak Jayanti (Gurpurab)',
    date: '2026-11-24',
    day: 'Tuesday',
    month: 11,
    quarter: 'Q4',
    type: 'GAZETTED',
    category: 'Sikh Observance',
    locations: ['ALL'],
    description: 'Birth anniversary of Guru Nanak Dev Ji, the first Sikh Guru and founder of Sikhism.',
    isLongWeekend: false,
  },
  {
    id: 'hol-2026-12-25',
    name: 'Christmas Day',
    date: '2026-12-25',
    day: 'Friday',
    month: 12,
    quarter: 'Q4',
    type: 'GAZETTED',
    category: 'Christian Celebration',
    locations: ['ALL'],
    description: 'Annual festival commemorating the birth of Jesus Christ, celebrated globally and across India.',
    isLongWeekend: true,
    longWeekendTip: '3-Day Long Weekend (Fri, Dec 25 – Sun, Dec 27)!',
  },
];

export const OFFICE_LOCATIONS = [
  { value: 'ALL', label: 'All Offices (Pan-India Statutory)' },
  { value: 'BENGALURU', label: 'Bengaluru Tech Park (Karnataka)' },
  { value: 'MUMBAI', label: 'Mumbai Corporate HQ (Maharashtra)' },
  { value: 'DELHI_NCR', label: 'Delhi NCR Hub (Gurugram)' },
  { value: 'HYDERABAD', label: 'Hyderabad HITEC City (Telangana)' },
  { value: 'PUNE', label: 'Pune Innovation Center (Maharashtra)' },
  { value: 'CHENNAI', label: 'Chennai OMR Center (Tamil Nadu)' },
];

export const HOLIDAY_TYPES = [
  { value: 'ALL', label: 'All Types', count: INDIAN_HOLIDAYS_2026.length },
  {
    value: 'GAZETTED',
    label: 'Gazetted (Mandatory)',
    badgeColor: 'indigo',
    count: INDIAN_HOLIDAYS_2026.filter((h) => h.type === 'GAZETTED').length,
  },
  {
    value: 'RESTRICTED',
    label: 'Restricted / Optional (RH)',
    badgeColor: 'orange',
    count: INDIAN_HOLIDAYS_2026.filter((h) => h.type === 'RESTRICTED').length,
  },
  {
    value: 'REGIONAL',
    label: 'Regional / State',
    badgeColor: 'teal',
    count: INDIAN_HOLIDAYS_2026.filter((h) => h.type === 'REGIONAL').length,
  },
  {
    value: 'LONG_WEEKEND',
    label: '🌴 Long Weekends',
    badgeColor: 'grape',
    count: INDIAN_HOLIDAYS_2026.filter((h) => h.isLongWeekend).length,
  },
];

/**
 * Filter holidays by selected location and type
 */
export const filterIndianHolidays = ({ location = 'ALL', type = 'ALL', quarter = 'ALL', search = '' } = {}) => {
  return INDIAN_HOLIDAYS_2026.filter((hol) => {
    // Location match
    if (location !== 'ALL' && !hol.locations.includes('ALL') && !hol.locations.includes(location)) {
      return false;
    }

    // Type match
    if (type === 'LONG_WEEKEND') {
      if (!hol.isLongWeekend) return false;
    } else if (type !== 'ALL' && hol.type !== type) {
      return false;
    }

    // Quarter match
    if (quarter !== 'ALL' && hol.quarter !== quarter) {
      return false;
    }

    // Search query match
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      const matchName = hol.name.toLowerCase().includes(q);
      const matchCat = hol.category.toLowerCase().includes(q);
      const matchDesc = hol.description.toLowerCase().includes(q);
      const matchDate = hol.date.includes(q);
      if (!matchName && !matchCat && !matchDesc && !matchDate) return false;
    }

    return true;
  });
};

/**
 * Get upcoming holidays relative to a specific date (defaults to current date or 2026 simulation)
 */
export const getUpcomingIndianHolidays = (referenceDateStr = '2026-09-06', limit = 5) => {
  const refDate = new Date(referenceDateStr);
  return INDIAN_HOLIDAYS_2026.filter((h) => new Date(h.date) >= refDate).slice(0, limit);
};

/**
 * Calculate countdown days string
 */
export const getHolidayCountdown = (holidayDateStr, referenceDateStr = '2026-09-06') => {
  const holDate = new Date(holidayDateStr);
  const refDate = new Date(referenceDateStr);
  const diffTime = holDate.getTime() - refDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today 🎉';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return `In ${diffDays} days`;
};

/**
 * Generate standard iCalendar (.ics) format file content for export
 */
export const generateHolidaysIcs = (holidays = INDIAN_HOLIDAYS_2026) => {
  const pad = (n) => String(n).padStart(2, '0');
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PayPilot HRMS//Indian Statutory Holiday Calendar 2026//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:PayPilot 2026 Indian Statutory Holidays',
    'X-WR-TIMEZONE:Asia/Kolkata',
  ];

  holidays.forEach((h) => {
    const cleanDate = h.date.replace(/-/g, '');
    const nextDateObj = new Date(h.date);
    nextDateObj.setDate(nextDateObj.getDate() + 1);
    const cleanNextDate = `${nextDateObj.getFullYear()}${pad(nextDateObj.getMonth() + 1)}${pad(nextDateObj.getDate())}`;

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:${h.id}@paypilot.internal`);
    icsContent.push(`DTSTAMP:20260101T000000Z`);
    icsContent.push(`DTSTART;VALUE=DATE:${cleanDate}`);
    icsContent.push(`DTEND;VALUE=DATE:${cleanNextDate}`);
    icsContent.push(`SUMMARY:${h.name} (${h.type === 'GAZETTED' ? 'Gazetted' : h.type === 'RESTRICTED' ? 'RH' : 'Regional'})`);
    icsContent.push(`DESCRIPTION:${h.description.replace(/,/g, '\\,')}`);
    icsContent.push(`LOCATION:India - ${h.locations.join('/')}`);
    icsContent.push(`STATUS:CONFIRMED`);
    icsContent.push('TRANSP:TRANSPARENT');
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
};

/**
 * Trigger browser file download for .ics
 */
export const downloadIcsCalendar = (holidays = INDIAN_HOLIDAYS_2026) => {
  const icsData = generateHolidaysIcs(holidays);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'PayPilot_2026_Indian_Holiday_Calendar.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
