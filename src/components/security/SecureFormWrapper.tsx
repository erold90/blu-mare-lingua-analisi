import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { sanitizeInput, rateLimiter, RATE_LIMITS } from '@/utils/securityConfig';

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

    // Rate limiting check
    const userKey = `${formType}_${window.navigator.userAgent}_${Date.now()}`;
    const rateConfig = getRateLimitConfig();
    
    if (rateLimiter.isRateLimited(userKey, rateConfig.maxAttempts, rateConfig.windowMs)) {
      toast.error('Troppi tentativi. Riprova più tardi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      
      // Sanitize all form inputs
      const sanitizedData = new FormData();
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          sanitizedData.set(key, sanitizeInput(value));
        } else {
          sanitizedData.set(key, value);
        }
      }

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