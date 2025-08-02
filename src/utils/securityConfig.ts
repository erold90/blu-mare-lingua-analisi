/**
 * Security configuration and utilities
 */

// Rate limiting configuration
export const RATE_LIMITS = {
  CONTACT_FORM: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  LOGIN_ATTEMPTS: {
    maxAttempts: 3,
    windowMs: 30 * 60 * 1000, // 30 minutes
  },
  QUOTE_REQUESTS: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
};

// Input sanitization patterns
export const SANITIZATION_PATTERNS = {
  HTML_TAGS: /<[^>]*>/g,
  SCRIPT_TAGS: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  SQL_INJECTION: /('|(\')|;|--|\/\*|\*\/|xp_|sp_|exec|execute|union|select|insert|update|delete|drop|create|alter)/gi,
  XSS_PATTERNS: /(javascript:|data:|vbscript:|onload|onerror|onclick)/gi,
};

// Content Security Policy directives
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
  connectSrc: ["'self'", "https://api.resend.com", "https://*.supabase.co"],
  mediaSrc: ["'self'"],
  objectSrc: ["'none'"],
  baseSrc: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: true,
};

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(SANITIZATION_PATTERNS.HTML_TAGS, '')
    .replace(SANITIZATION_PATTERNS.SCRIPT_TAGS, '')
    .replace(SANITIZATION_PATTERNS.XSS_PATTERNS, '')
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Rate limiting utility
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  isRateLimited(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (attempt.count >= maxAttempts) {
      return true;
    }

    attempt.count++;
    return false;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Generate CSP header string
 */
export function generateCSPHeader(): string {
  const directives = Object.entries(CSP_DIRECTIVES)
    .map(([key, value]) => {
      if (key === 'upgradeInsecureRequests') {
        return value ? 'upgrade-insecure-requests' : '';
      }
      const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${directive} ${Array.isArray(value) ? value.join(' ') : value}`;
    })
    .filter(Boolean)
    .join('; ');

  return directives;
}