import { validateStrongPassword } from './src/utils/passwordValidator.js';

const tests = [
  { pwd: '123', shouldPass: false, name: 'Too short' },
  { pwd: 'password', shouldPass: false, name: 'Common weak password' },
  { pwd: 'password123', shouldPass: false, name: 'No uppercase or symbol' },
  { pwd: 'Password123', shouldPass: false, name: 'No special character' },
  { pwd: 'Password@123', shouldPass: true, name: 'Valid strong password' },
  { pwd: 'SuperSecure#2026PayPilot!', shouldPass: true, name: 'Very strong password' },
];

let allPassed = true;
for (const t of tests) {
  const res = validateStrongPassword(t.pwd);
  const pass = res.isValid === t.shouldPass;
  console.log(`${pass ? '✅' : '❌'} Test: ${t.name} -> isValid: ${res.isValid} (score: ${res.score}/5) - error: ${res.error || 'None'}`);
  if (!pass) allPassed = false;
}

if (allPassed) {
  console.log('\n🎉 All password strength security tests passed successfully!');
} else {
  console.error('\n❌ Some tests failed.');
  process.exit(1);
}
