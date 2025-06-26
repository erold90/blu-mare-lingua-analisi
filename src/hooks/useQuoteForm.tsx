import { useState, useCallback } from 'react';
import { FormValues } from '@/utils/quoteFormSchema';
import { useAnalytics } from '@/hooks/analytics/useAnalytics';

export const useQuoteForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState<FormValues>({
    checkIn: '',
    checkOut: '',
    guests: 1,
    apartments: [],
    services: [],
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: ''
    }
  });

  const { saveQuoteLog } = useAnalytics();

  const updateFormValues = useCallback((values: Partial<FormValues>) => {
    setFormValues(prev => ({ ...prev, ...values }));
  }, []);

  const getTotalPrice = useCallback(() => {
    // Calculate total price based on form values
    let total = 0;
    
    // Add apartment prices
    formValues.apartments.forEach(apt => {
      total += apt.price || 0;
    });
    
    // Add service prices
    formValues.services.forEach(service => {
      total += service.price || 0;
    });
    
    return total;
  }, [formValues]);

  const saveFormData = useCallback(async (completed: boolean = false) => {
    try {
      const quoteData = {
        id: `quote_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        form_data: formValues,
        step: currentStep,
        completed,
        total_price: completed ? getTotalPrice() : undefined,
        user_session: sessionStorage.getItem('analytics_session') || undefined
      };

      await saveQuoteLog(quoteData);
      console.log('✅ Quote form data saved');
      
    } catch (error) {
      console.error('❌ Error saving quote form data:', error);
    }
  }, [formValues, currentStep, saveQuoteLog, getTotalPrice]);

  const nextStep = useCallback(() => {
    if (currentStep < 6) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      // Salva progresso ad ogni step
      saveFormData(false);
    }
  }, [currentStep, saveFormData]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 6) {
      setCurrentStep(step);
    }
  }, []);

  const completeQuote = useCallback(async () => {
    await saveFormData(true);
    // Additional completion logic can be added here
    console.log('✅ Quote completed');
  }, [saveFormData]);

  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setFormValues({
      checkIn: '',
      checkOut: '',
      guests: 1,
      apartments: [],
      services: [],
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
      }
    });
  }, []);

  const isStepValid = useCallback((step: number) => {
    switch (step) {
      case 1:
        return formValues.checkIn && formValues.checkOut && formValues.guests > 0;
      case 2:
        return formValues.apartments.length > 0;
      case 3:
        return true; // Services are optional
      case 4:
        return formValues.personalInfo.firstName && 
               formValues.personalInfo.lastName && 
               formValues.personalInfo.email;
      case 5:
        return true; // Review step
      case 6:
        return true; // Confirmation step
      default:
        return false;
    }
  }, [formValues]);

  return {
    currentStep,
    formValues,
    updateFormValues,
    nextStep,
    prevStep,
    goToStep,
    completeQuote,
    resetForm,
    isStepValid,
    getTotalPrice,
    saveFormData
  };
};
