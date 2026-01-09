import { useState, useCallback, useRef } from 'react';

interface UseSubmitProtectionOptions {
  /** Tempo minimo tra submit in millisecondi (default: 1000ms) */
  debounceMs?: number;
  /** Resetta automaticamente dopo il submit (default: true) */
  autoReset?: boolean;
  /** Timeout per reset automatico in millisecondi (default: 5000ms) */
  resetTimeoutMs?: number;
}

interface UseSubmitProtectionReturn {
  /** Se il form è in fase di submit */
  isSubmitting: boolean;
  /** Se il submit è stato bloccato (doppio click) */
  wasBlocked: boolean;
  /** Wrapper per la funzione di submit */
  protectedSubmit: <T>(submitFn: () => Promise<T>) => Promise<T | undefined>;
  /** Reset manuale dello stato */
  reset: () => void;
}

/**
 * Hook per proteggere i form da doppio submit
 * Previene invii multipli accidentali e gestisce lo stato di loading
 */
export function useSubmitProtection(
  options: UseSubmitProtectionOptions = {}
): UseSubmitProtectionReturn {
  const {
    debounceMs = 1000,
    autoReset = true,
    resetTimeoutMs = 5000
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasBlocked, setWasBlocked] = useState(false);
  const lastSubmitTime = useRef<number>(0);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setWasBlocked(false);
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  const protectedSubmit = useCallback(
    async <T>(submitFn: () => Promise<T>): Promise<T | undefined> => {
      const now = Date.now();

      // Blocca se già in submit o se è passato troppo poco tempo
      if (isSubmitting || (now - lastSubmitTime.current < debounceMs)) {
        setWasBlocked(true);
        return undefined;
      }

      // Pulisci eventuali timeout precedenti
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }

      setIsSubmitting(true);
      setWasBlocked(false);
      lastSubmitTime.current = now;

      try {
        const result = await submitFn();
        return result;
      } finally {
        if (autoReset) {
          // Reset dopo un breve delay per evitare flash UI
          resetTimeoutRef.current = setTimeout(() => {
            setIsSubmitting(false);
          }, 100);
        }

        // Timeout di sicurezza per reset
        setTimeout(() => {
          reset();
        }, resetTimeoutMs);
      }
    },
    [isSubmitting, debounceMs, autoReset, resetTimeoutMs, reset]
  );

  return {
    isSubmitting,
    wasBlocked,
    protectedSubmit,
    reset
  };
}
