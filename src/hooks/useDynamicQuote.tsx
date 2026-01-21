import { useState, useCallback } from 'react';
import { PricingService, QuoteParams, QuoteResult, AvailabilityResult } from '@/services/supabase/dynamicPricingService';
import { toast } from 'sonner';

export const useDynamicQuote = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);

  const calculateQuote = useCallback(async (params: QuoteParams): Promise<QuoteResult | null> => {
    try {
      setLoading(true);
      setError(null);
      
      
      const result = await PricingService.calculateQuote(params);
      setQuoteResult(result);
      
      return result;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Errore nel calcolo del preventivo';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAvailability = useCallback(async (
    apartmentId: number,
    checkin: string,
    checkout: string
  ): Promise<boolean> => {
    try {
      return await PricingService.checkAvailability(apartmentId, checkin, checkout);
    } catch (err: any) {
      return false;
    }
  }, []);

  const checkAvailabilityDetailed = useCallback(async (
    apartmentId: number,
    checkin: string,
    checkout: string
  ): Promise<AvailabilityResult> => {
    try {
      return await PricingService.checkAvailabilityDetailed(apartmentId, checkin, checkout);
    } catch (err: any) {
      return { available: false, conflicts: [], suggestion: null };
    }
  }, []);

  const checkMultipleAvailability = useCallback(async (
    apartmentIds: number[], 
    checkin: string, 
    checkout: string
  ): Promise<Record<number, boolean>> => {
    try {
      const results = await Promise.all(
        apartmentIds.map(async id => ({
          id,
          available: await PricingService.checkAvailability(id, checkin, checkout)
        }))
      );
      
      return results.reduce((acc, { id, available }) => {
        acc[id] = available;
        return acc;
      }, {} as Record<number, boolean>);
      
    } catch (err: any) {
      return {};
    }
  }, []);

  const saveQuote = useCallback(async (
    params: QuoteParams & {
      guestName?: string;
      guestEmail?: string;
      guestPhone?: string;
    }
  ): Promise<number | null> => {
    if (!quoteResult) {
      toast.error('Nessun preventivo da salvare');
      return null;
    }

    try {
      const quoteId = await PricingService.saveQuoteRequest(params, quoteResult);
      toast.success('Preventivo salvato con successo');
      return quoteId;
    } catch (err: any) {
      toast.error('Errore nel salvataggio del preventivo');
      return null;
    }
  }, [quoteResult]);

  const getPriceForPeriod = useCallback(async (
    apartmentId: number,
    checkin: string,
    checkout: string
  ): Promise<number | null> => {
    try {
      return await PricingService.getPriceForPeriod(apartmentId, checkin, checkout);
    } catch (err: any) {
      return null;
    }
  }, []);

  const resetQuote = useCallback(() => {
    setQuoteResult(null);
    setError(null);
  }, []);

  const invalidateCache = useCallback(() => {
    PricingService.invalidateCache();
    toast.success('Cache prezzi aggiornata');
  }, []);

  return {
    loading,
    error,
    quoteResult,
    calculateQuote,
    checkAvailability,
    checkAvailabilityDetailed,
    checkMultipleAvailability,
    saveQuote,
    getPriceForPeriod,
    resetQuote,
    invalidateCache
  };
};