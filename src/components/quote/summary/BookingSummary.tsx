
import React from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { Apartment } from "@/data/apartments";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MessageCircle, Calendar, Euro, Users, Home, Info } from "lucide-react";

// Import nuovi componenti organizzati
import BookingDates from "./sections/BookingDates";
import GuestSummary from "./sections/GuestSummary";
import ApartmentsSummary from "./sections/ApartmentsSummary";
import PricingBreakdown from "./sections/PricingBreakdown";
import BookingActions from "./sections/BookingActions";

interface BookingSummaryProps {
  form: UseFormReturn<FormValues>;
  apartments: Apartment[];
  prevStep: () => void;
  sendWhatsApp: () => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  form,
  apartments,
  prevStep,
  sendWhatsApp
}) => {
  const formValues = form.getValues();
  
  // Get selected apartments
  const selectedApartmentIds = formValues.selectedApartments || 
    (formValues.selectedApartment ? [formValues.selectedApartment] : []);
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  // Check if all required data is present
  const hasValidData = formValues.checkIn && formValues.checkOut && selectedApartments.length > 0;
  
  if (!hasValidData) {
    return (
      <div className="max-w-2xl mx-auto border border-border/50 p-12 text-center">
        <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Dati insufficienti</h3>
        <p className="text-muted-foreground mb-6">
          Completa tutti i passaggi precedenti per visualizzare il riepilogo
        </p>
        <Button onClick={prevStep} variant="ghost" className="px-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna indietro
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-border/50 pb-6 mb-8">
        <h2 className="text-2xl font-light mb-2">Riepilogo</h2>
        <p className="text-muted-foreground font-light">
          Verifica i dettagli prima di inviare la richiesta
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Informazioni booking */}
        <div className="space-y-8">
          <BookingDates formValues={formValues} />
          <GuestSummary formValues={formValues} />
          <ApartmentsSummary 
            selectedApartments={selectedApartments}
            formValues={formValues}
          />
        </div>

        {/* Prezzi */}
        <div>
          <PricingBreakdown
            formValues={formValues}
            selectedApartments={selectedApartments}
            apartments={apartments}
          />
        </div>
      </div>

      {/* Note section */}
      {formValues.notes && formValues.notes.trim() && (
        <div className="mt-8 pt-8 border-t border-border/50">
          <div className="border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Note</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">{formValues.notes}</p>
          </div>
        </div>
      )}

      <div className="border-t border-border/50 pt-8 mt-8">
        <BookingActions 
          prevStep={prevStep}
          sendWhatsApp={sendWhatsApp}
        />
      </div>
    </div>
  );
};

export default BookingSummary;
