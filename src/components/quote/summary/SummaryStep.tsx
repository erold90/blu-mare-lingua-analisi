
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import BookingSummary from "./BookingSummary";

interface SummaryStepProps {
  form: UseFormReturn<FormValues>;
  apartments: Apartment[];
  prevStep: () => void;
  sendWhatsApp: () => void;
}

const SummaryStep: React.FC<SummaryStepProps> = (props) => {
  return <BookingSummary {...props} />;
};

export default SummaryStep;
