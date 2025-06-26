
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
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <div className="mb-6">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dati insufficienti</h3>
            <p className="text-muted-foreground">
              Completa tutti i passaggi precedenti per visualizzare il riepilogo
            </p>
          </div>
          <Button onClick={prevStep} variant="outline" size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna indietro
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
          <Euro className="h-5 w-5 text-primary" />
          <span className="text-primary font-medium">Riepilogo Prenotazione</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Controlla i dettagli della tua prenotazione
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Verifica tutti i dettagli prima di inviare la richiesta. 
          Non sarai impegnato fino alla conferma scritta.
        </p>
      </div>

      {/* Main Content - Layout a due colonne */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Colonna sinistra - Informazioni booking */}
        <div className="lg:col-span-2 space-y-6">
          <BookingDates formValues={formValues} />
          <GuestSummary formValues={formValues} />
        </div>

        {/* Colonna destra - Appartamenti e prezzi */}
        <div className="lg:col-span-3 space-y-6">
          <ApartmentsSummary 
            selectedApartments={selectedApartments}
            formValues={formValues}
          />
          <PricingBreakdown
            formValues={formValues}
            selectedApartments={selectedApartments}
            apartments={apartments}
          />
        </div>
      </div>

      {/* Note section */}
      {formValues.notes && formValues.notes.trim() && (
        <div className="mt-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Note aggiuntive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 leading-relaxed">{formValues.notes}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Separator className="my-8" />

      {/* Actions */}
      <BookingActions 
        prevStep={prevStep}
        sendWhatsApp={sendWhatsApp}
      />
    </div>
  );
};

export default BookingSummary;
