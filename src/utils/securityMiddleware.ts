/**
 * Security Middleware and Advanced Security Utilities
 */

import { toast } from 'sonner';

// Content Security Policy configuration
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'", 
    "'unsafe-inline'", 
    "https://www.googletagmanager.com", 
    "https://www.google-analytics.com",
    "https://static.cloudflareinsights.com"
  ],
  'style-src': [
    "'self'", 
    "'unsafe-inline'", 
    "https://fonts.googleapis.com"
  ],
  'font-src': [
    "'self'", 
    "https://fonts.gstatic.com"
  ],
  'img-src': [
    "'self'", 
    "data:", 
    "https:", 
    "blob:"
  ],
  'connect-src': [
    "'self'", 
    "https://api.resend.com", 
    "https://*.supabase.co",
    "https://fgeeeivbmfrwrieyzhel.supabase.co"
  ],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

// Generate CSP header
export function generateCSPHeader(): string {
  return Object.entries(CSP_CONFIG)
    .map(([directive, sources]) => {
      const key = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
      if (sources.length === 0) {
        return directive === 'upgrade-insecure-requests' ? 'upgrade-insecure-requests' : '';
      }
      return `${key} ${sources.join(' ')}`;
    })
    .filter(Boolean)
    .join('; ');
}

// Advanced input validation
interface ValidationRule {
  pattern: RegExp;
  message: string;
  severity: 'error' | 'warning';
}

const SECURITY_PATTERNS: Record<string, ValidationRule> = {
  SQL_INJECTION: {
    pattern: /('|(\')|;|--|\/\*|\*\/|xp_|sp_|exec|execute|union|select|insert|update|delete|drop|create|alter|script|javascript)/gi,
    message: 'Input contiene pattern potenzialmente pericolosi',
    severity: 'error'
  },
  XSS_ATTEMPT: {
    pattern: /(javascript:|data:|vbscript:|onload|onerror|onclick|onmouseover|onfocus|onblur)/gi,
    message: 'Rilevato tentativo di XSS',
    severity: 'error'
  },
  HTML_INJECTION: {
    pattern: /<script|<iframe|<object|<embed|<link|<meta/gi,
    message: 'Rilevato tentativo di iniezione HTML',
    severity: 'error'
  },
  SUSPICIOUS_URLS: {
    pattern: /(https?:\/\/[^\s]+\.(tk|ml|ga|cf|gq|bit\.ly|tinyurl|t\.co))/gi,
    message: 'URL sospetto rilevato',
    severity: 'warning'
  }
};

// Enhanced input sanitization
export function advancedSanitize(input: string, context: 'email' | 'text' | 'url' | 'phone' = 'text'): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input.trim();

  // Context-specific sanitization
  switch (context) {
    case 'email':
      // Only allow valid email characters
      sanitized = sanitized.replace(/[^a-zA-Z0-9@._-]/g, '');
      break;
    case 'phone':
      // Only allow phone number characters
      sanitized = sanitized.replace(/[^0-9+\-\(\)\s]/g, '');
      break;
    case 'url':
      // Basic URL sanitization
      sanitized = sanitized.replace(/[<>"']/g, '');
      break;
    case 'text':
    default:
      // Remove HTML tags and dangerous patterns
      sanitized = sanitized
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '');
  }

  // Check for security violations
  Object.entries(SECURITY_PATTERNS).forEach(([key, rule]) => {
    if (rule.pattern.test(sanitized)) {
      if (rule.severity === 'error') {
        toast.error(rule.message);
        // Return empty string for dangerous content
        sanitized = '';
      } else {
        toast.warning(rule.message);
      }
    }
  });

  return sanitized;
}

// Security headers for requests
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

// Rate limiting with Redis-like behavior (using localStorage)
class AdvancedRateLimiter {
  private getKey(identifier: string, action: string): string {
    return `rate_limit_${action}_${identifier}`;
  }

  private getAttempts(key: string): { count: number; resetTime: number } {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : { count: 0, resetTime: 0 };
    } catch {
      return { count: 0, resetTime: 0 };
    }
  }

  private setAttempts(key: string, data: { count: number; resetTime: number }): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Storage failed, continue without rate limiting
    }
  }

  isRateLimited(
    identifier: string, 
    action: string, 
    maxAttempts: number, 
    windowMs: number
  ): boolean {
    const key = this.getKey(identifier, action);
    const now = Date.now();
    const attempts = this.getAttempts(key);

    // Reset if window expired
    if (now > attempts.resetTime) {
      this.setAttempts(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    // Check if limit exceeded
    if (attempts.count >= maxAttempts) {
      toast.error(`Troppi tentativi. Riprova tra ${Math.ceil((attempts.resetTime - now) / 60000)} minuti.`);
      return true;
    }

    // Increment counter
    this.setAttempts(key, { count: attempts.count + 1, resetTime: attempts.resetTime });
    return false;
  }

  reset(identifier: string, action: string): void {
    const key = this.getKey(identifier, action);
    localStorage.removeItem(key);
  }
}

export const advancedRateLimiter = new AdvancedRateLimiter();

// Security monitoring
export class SecurityMonitor {
  private static violations: Array<{
    type: string;
    data: string;
    timestamp: number;
    userAgent: string;
  }> = [];

  static logViolation(type: string, data: string): void {
    this.violations.push({
      type,
      data: data.substring(0, 100), // Limit data length
      timestamp: Date.now(),
      userAgent: navigator.userAgent.substring(0, 100)
    });

    // Keep only last 100 violations
    if (this.violations.length > 100) {
      this.violations = this.violations.slice(-100);
    }

    // Log to console for debugging
  }

  static getViolations(): typeof SecurityMonitor.violations {
    return [...this.violations];
  }

  static clearViolations(): void {
    this.violations = [];
  }
}

// Secure form validation
export function validateSecureForm(formData: FormData): {
  isValid: boolean;
  errors: string[];
  sanitizedData: Record<string, string>;
} {
  const errors: string[] = [];
  const sanitizedData: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      const context = key.includes('email') ? 'email' : 
                    key.includes('phone') ? 'phone' : 
                    key.includes('url') ? 'url' : 'text';
      
      const sanitized = advancedSanitize(value, context);
      
      if (value !== sanitized && sanitized === '') {
        errors.push(`Campo ${key} contiene contenuto non sicuro`);
        SecurityMonitor.logViolation('FORM_SECURITY_VIOLATION', `${key}: ${value}`);
      }
      
      sanitizedData[key] = sanitized;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

// Browser fingerprinting for security
export function getBrowserFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
}
