/**
 * List of easily guessable / insecure common passwords to reject
 */
const COMMON_WEAK_PASSWORDS = new Set([
  'password',
  'password123',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'admin123',
  'administrator',
  'welcome123',
  'paypilot123',
  'pass1234',
  'letmein123',
  'iloveyou',
  'monkey123',
  'dragon123',
  'sunshine',
  'princess',
]);

/**
 * Validates whether a given password meets strong security standards:
 * - At least 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special symbol (!@#$%^&*...)
 * - Not a commonly used weak password
 *
 * @param {string} password
 * @returns {{ isValid: boolean, error?: string, score: number, requirements: object }}
 */
export function validateStrongPassword(password) {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      error: 'Password is required.',
      score: 0,
      requirements: { minLength: false, uppercase: false, lowercase: false, number: false, specialChar: false },
    };
  }

  const trimmed = password.trim();
  const minLength = trimmed.length >= 8 && trimmed.length <= 128;
  const hasUppercase = /[A-Z]/.test(trimmed);
  const hasLowercase = /[a-z]/.test(trimmed);
  const hasNumber = /[0-9]/.test(trimmed);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(trimmed);
  const isCommon = COMMON_WEAK_PASSWORDS.has(trimmed.toLowerCase());

  const requirements = {
    minLength,
    uppercase: hasUppercase,
    lowercase: hasLowercase,
    number: hasNumber,
    specialChar: hasSpecialChar,
  };

  let score = 0;
  if (minLength) score += 1;
  if (hasUppercase) score += 1;
  if (hasLowercase) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecialChar) score += 1;

  if (isCommon) {
    return {
      isValid: false,
      error: 'This password is too common and easily guessable. Please choose a more unique password.',
      score: 1,
      requirements,
    };
  }

  if (!minLength) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long.',
      score,
      requirements,
    };
  }

  if (!hasUppercase) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter (A-Z).',
      score,
      requirements,
    };
  }

  if (!hasLowercase) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter (a-z).',
      score,
      requirements,
    };
  }

  if (!hasNumber) {
    return {
      isValid: false,
      error: 'Password must contain at least one numeric digit (0-9).',
      score,
      requirements,
    };
  }

  if (!hasSpecialChar) {
    return {
      isValid: false,
      error: 'Password must contain at least one special character (!@#$%^&*...).',
      score,
      requirements,
    };
  }

  return {
    isValid: true,
    score: 5,
    requirements,
  };
}
