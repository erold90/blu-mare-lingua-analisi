import { useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPrice } from "@/utils/quoteCalculator";
import { apartments } from "@/data/apartments";
import { useSupabaseActivityLog } from "@/hooks/activity/useActivityLog";
import { v4 as uuidv4 } from 'uuid';
import { useAdvancedTracking } from '@/hooks/analytics/useAdvancedTracking';

export function useQuoteActions() {
  const { getValues, setValue } = useFormContext<FormValues>();
  const [step, setStep] = useState(1);
  const { addQuoteLog } = useSupabaseActivityLog();
  
  const { trackInteraction } = useAdvancedTracking();

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
      
      // Traccia progresso nel form
      trackInteraction({
        interaction_type: 'quote_progress',
        additional_data: {
          step: step + 1,
          step_name: getStepName(step + 1),
        }
      });
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const formValues = getValues();
      const quoteId = uuidv4();
      const totalPrice = calculateTotalPrice(formValues, apartments).totalPrice;

      // Save quote log
      await addQuoteLog({
        id: quoteId,
        form_values: formValues,
        step: step,
        completed: true,
      });
      
      // Traccia completamento preventivo
      trackInteraction({
        interaction_type: 'quote_completed',
        additional_data: {
          total_price: calculateTotalPrice(formValues, apartments).totalPrice,
          apartments_count: formValues.selectedApartments?.length || 0,
          adults: formValues.adults,
          children: formValues.children,
        }
      });

      // Reset form
      Object.keys(formValues).forEach(key => {
        setValue(key as keyof FormValues, undefined);
      });
      setStep(1);
      
      alert(`Preventivo salvato con successo! ID: ${quoteId} - Totale: ${totalPrice}€`);
    } catch (error) {
      console.error("Errore durante il salvataggio del preventivo:", error);
      alert("Si è verificato un errore durante il salvataggio del preventivo.");
    }
  };

  const getStepName = (stepNumber: number) => {
    const stepNames = {
      1: 'guest_info',
      2: 'dates',
      3: 'apartments',
      4: 'services',
      5: 'summary'
    };
    return stepNames[stepNumber as keyof typeof stepNames] || 'unknown';
  };

  return {
    step,
    handleNext,
    handlePrevious,
    handleSubmit
  };
}
