import rateLimit from 'express-rate-limit';

/**
 * Standard API Rate Limiter
 * Limits each IP to 500 requests per 15 minutes window
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    error: 'TooManyRequests',
    message: 'Too many requests from this IP address, please try again after 15 minutes.',
    retryAfterMinutes: 15,
  },
});

/**
 * Strict Auth Rate Limiter
 * Protects login, registration, and credential verification against brute-force attacks
 * Limits each IP to 25 attempts per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many authentication attempts from this IP address. For your security, please wait 15 minutes before trying again.',
    retryAfterMinutes: 15,
  },
});

/**
 * Strict OTP Resend Limiter
 * Prevents spamming verification emails / OTP dispatch endpoints
 * Limits to 5 OTP resend requests per 15 minutes
 */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many OTP requests. Please wait 15 minutes before requesting another verification code.',
    retryAfterMinutes: 15,
  },
});
