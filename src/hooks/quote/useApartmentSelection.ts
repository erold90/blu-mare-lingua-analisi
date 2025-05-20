
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/utils/quoteFormSchema";

export function useApartmentSelection(form: UseFormReturn<FormValues>) {
  const [apartmentDialog, setApartmentDialog] = useState<string | null>(null);
  
  // Apartment dialog management
  const openApartmentDialog = (id: string) => {
    setApartmentDialog(id);
  };
  
  const closeApartmentDialog = () => {
    setApartmentDialog(null);
  };
  
  const selectApartment = (id: string) => {
    // Add to selectedApartments array if not already there
    const currentSelectedApts = form.getValues("selectedApartments") || [];
    if (!currentSelectedApts.includes(id)) {
      form.setValue("selectedApartments", [...currentSelectedApts, id]);
    }
    
    // Set as the main selected apartment
    form.setValue("selectedApartment", id);
    closeApartmentDialog();
  };

  return {
    apartmentDialog,
    openApartmentDialog,
    closeApartmentDialog,
    selectApartment
  };
}
