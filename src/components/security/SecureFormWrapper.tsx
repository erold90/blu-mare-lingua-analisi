import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { sanitizeInput, rateLimiter, RATE_LIMITS } from '@/utils/securityConfig';
import { validateSecureForm, advancedRateLimiter, getBrowserFingerprint, SecurityMonitor } from '@/utils/securityMiddleware';

interface SecureFormWrapperProps {
  children: React.ReactNode;
  onSubmit: (formData: FormData) => Promise<void>;
  formType: 'contact' | 'quote' | 'login';
  className?: string;
}

/**
 * Secure form wrapper with rate limiting and input sanitization
 */
export const SecureFormWrapper: React.FC<SecureFormWrapperProps> = ({
  children,
  onSubmit,
  formType,
  className = '',
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRateLimitConfig = useCallback(() => {
    switch (formType) {
      case 'contact':
        return RATE_LIMITS.CONTACT_FORM;
      case 'quote':
        return RATE_LIMITS.QUOTE_REQUESTS;
      case 'login':
        return RATE_LIMITS.LOGIN_ATTEMPTS;
      default:
        return RATE_LIMITS.CONTACT_FORM;
    }
  }, [formType]);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (isSubmitting) return;

    // Enhanced rate limiting with browser fingerprinting
    const browserFingerprint = getBrowserFingerprint();
    const userKey = `${formType}_${browserFingerprint}`;
    const rateConfig = getRateLimitConfig();
    
    // Use both old and new rate limiting for extra security
    if (rateLimiter.isRateLimited(userKey, rateConfig.maxAttempts, rateConfig.windowMs) ||
        advancedRateLimiter.isRateLimited(browserFingerprint, formType, rateConfig.maxAttempts, rateConfig.windowMs)) {
      SecurityMonitor.logViolation('RATE_LIMIT_EXCEEDED', `Form: ${formType}, User: ${browserFingerprint}`);
      return; // Error already shown by rate limiter
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      
      // Advanced form validation and sanitization
      const validation = validateSecureForm(formData);
      
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error));
        setIsSubmitting(false);
        return;
      }
      
      // Create sanitized FormData from validated data
      const sanitizedData = new FormData();
      Object.entries(validation.sanitizedData).forEach(([key, value]) => {
        sanitizedData.set(key, value);
      });

      await onSubmit(sanitizedData);
    } catch (error) {
      console.error(`${formType} form submission error:`, error);
      toast.error('Si è verificato un errore. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, formType, onSubmit, getRateLimitConfig]);

  return (
    <form 
      onSubmit={handleSubmit} 
      className={className}
      noValidate // We handle validation ourselves
    >
      {children}
      {isSubmitting && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Invio in corso...</div>
        </div>
      )}
    </form>
  );
};