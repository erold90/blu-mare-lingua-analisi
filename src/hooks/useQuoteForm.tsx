// Simple quote form hook
import { useState } from 'react';

export const useQuoteForm = () => {
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  return {
    formData,
    currentStep,
    updateFormData,
    nextStep,
    prevStep,
  };
};