
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/utils/quoteFormSchema";

export function useStepManagement(form: UseFormReturn<FormValues>) {
  const [step, setStep] = useState(1);
  const totalSteps = 5; // Ridotto da 6 a 5 step
  
  // Step navigation
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      form.setValue("step", step + 1);
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      form.setValue("step", step - 1);
    }
  };

  return {
    step,
    totalSteps,
    nextStep,
    prevStep
  };
}
