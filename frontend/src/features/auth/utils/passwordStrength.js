/**
 * Frontend Password Strength Evaluation Utility
 */
export const getPasswordStrength = (password = '') => {
  const pwd = String(password || '');

  const requirements = [
    { label: 'At least 8 characters', met: pwd.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(pwd) },
    { label: 'One number (0-9)', met: /[0-9]/.test(pwd) },
    { label: 'One special symbol (!@#$%^&*)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd) },
  ];

  const metCount = requirements.filter((r) => r.met).length;

  let strengthLabel = 'Very Weak';
  let color = '#EF4444'; // red
  let percent = 10;

  if (metCount === 0) {
    strengthLabel = 'Empty';
    color = '#E2E8F0';
    percent = 0;
  } else if (metCount <= 2) {
    strengthLabel = 'Weak';
    color = '#EF4444'; // Red
    percent = 25;
  } else if (metCount === 3) {
    strengthLabel = 'Fair';
    color = '#F59E0B'; // Amber
    percent = 50;
  } else if (metCount === 4) {
    strengthLabel = 'Good';
    color = '#3B82F6'; // Blue
    percent = 75;
  } else if (metCount === 5) {
    strengthLabel = 'Strong';
    color = '#10B981'; // Emerald Green
    percent = 100;
  }

  const isStrong = metCount === 5;

  return {
    score: metCount,
    percent,
    strengthLabel,
    color,
    isStrong,
    requirements,
  };
};
