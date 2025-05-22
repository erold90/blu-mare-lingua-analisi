
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import SummaryStep from "./summary/SummaryStep";

interface SummaryStepProps {
  form: UseFormReturn<FormValues>;
  apartments: Apartment[];
  prevStep: () => void;
  nextStep: () => void;
}

// Questo è solo un wrapper che indirizza al nuovo componente
const SummaryStepWrapper: React.FC<SummaryStepProps> = ({ 
  form, 
  apartments, 
  prevStep, 
  nextStep
}) => {
  return (
    <SummaryStep
      form={form}
      apartments={apartments}
      prevStep={prevStep}
      // Questi metodi devono essere forniti dal parent
      downloadQuote={() => {}}
      sendWhatsApp={() => {}}
    />
  );
};

export default SummaryStepWrapper;
