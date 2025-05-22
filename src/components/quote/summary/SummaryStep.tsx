
import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPrice } from "@/utils/price/priceCalculator";
import { v4 as uuidv4 } from "uuid";
import { useActivityLog } from "@/hooks/useActivityLog";
import { Download, Send, FileText, WhatsApp } from "lucide-react";

// Componenti separati per ogni sezione
import DateDurationInfo from "./DateDurationInfo";
import GuestInfo from "./GuestInfo";
import PriceSummary from "./PriceSummary";
import ApartmentList from "./ApartmentList";

interface SummaryStepProps {
  form: UseFormReturn<FormValues>;
  apartments: Apartment[];
  prevStep: () => void;
  downloadQuote: (name?: string) => void;
  sendWhatsApp: () => void;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ 
  form, 
  apartments, 
  prevStep,
  downloadQuote,
  sendWhatsApp
}) => {
  const formValues = form.getValues();
  const priceInfo = calculateTotalPrice(formValues, apartments);
  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  const { addQuoteLog } = useActivityLog();
  
  // If only one apartment is selected, make sure it's the main selectedApartment
  useEffect(() => {
    if (selectedApartmentIds.length === 1 && formValues.selectedApartment !== selectedApartmentIds[0]) {
      form.setValue("selectedApartment", selectedApartmentIds[0]);
    }
  }, [selectedApartmentIds, form, formValues.selectedApartment]);
  
  // Log the quote when this component mounts
  useEffect(() => {
    const quoteLogId = localStorage.getItem('currentQuoteLogId') || uuidv4();
    
    // Save the quote log
    addQuoteLog({
      id: quoteLogId,
      timestamp: new Date().toISOString(),
      formValues: formValues,
      step: 5, // We're on step 5
      completed: true // Now marking as completed since this is the final step
    });
    
    // Save the ID for later use
    localStorage.setItem('currentQuoteLogId', quoteLogId);
  }, [addQuoteLog, formValues]);
  
  const handleDownloadPdf = () => {
    // Prima di scaricare, assicuriamoci che i dati di contatto siano presenti
    if (!formValues.name) {
      // Se il nome non è presente, mostriamo un form per inserirlo
      const name = window.prompt("Inserisci il tuo nome per personalizzare il preventivo:", "");
      if (name) {
        form.setValue("name", name);
        downloadQuote(name);
      } else {
        downloadQuote();
      }
    } else {
      downloadQuote(formValues.name);
    }
  };
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl">Riepilogo prenotazione</CardTitle>
        <CardDescription>Verifica i dettagli del tuo preventivo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          {/* Sezione sinistra: Informazioni soggiorno */}
          <div className="space-y-5">
            <Card>
              <CardContent className="pt-5 pb-5">
                <h3 className="text-lg font-semibold mb-3">Date del soggiorno</h3>
                <DateDurationInfo 
                  checkIn={formValues.checkIn}
                  checkOut={formValues.checkOut}
                  nights={priceInfo.nights}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-5 pb-5">
                <h3 className="text-lg font-semibold mb-3">Ospiti</h3>
                <GuestInfo formValues={formValues} />
              </CardContent>
            </Card>
          </div>
          
          {/* Sezione destra: Appartamenti e prezzi */}
          <div className="space-y-5">
            <Card>
              <CardContent className="pt-5 pb-5">
                <h3 className="text-lg font-semibold mb-3">Appartamenti selezionati</h3>
                <ApartmentList
                  apartments={apartments}
                  selectedApartments={selectedApartments}
                  formValues={formValues}
                  priceInfo={priceInfo}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-5 pb-5">
                <PriceSummary 
                  priceInfo={priceInfo}
                  formValues={formValues}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Form per email e telefono */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <h3 className="text-lg font-semibold mb-3">I tuoi dati di contatto</h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="text-sm font-medium mb-1 block">Nome</label>
                <input
                  id="name"
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Inserisci il tuo nome"
                  value={formValues.name || ""}
                  onChange={(e) => form.setValue("name", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium mb-1 block">Email</label>
                <input
                  id="email"
                  type="email"
                  className="w-full p-2 border rounded-md"
                  placeholder="Inserisci la tua email"
                  value={formValues.email || ""}
                  onChange={(e) => form.setValue("email", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium mb-1 block">Telefono</label>
                <input
                  id="phone"
                  type="tel"
                  className="w-full p-2 border rounded-md"
                  placeholder="Inserisci il tuo numero di telefono"
                  value={formValues.phone || ""}
                  onChange={(e) => form.setValue("phone", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="notes" className="text-sm font-medium mb-1 block">Note</label>
                <textarea
                  id="notes"
                  className="w-full p-2 border rounded-md"
                  placeholder="Eventuali note o richieste speciali"
                  value={formValues.notes || ""}
                  onChange={(e) => form.setValue("notes", e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
      <CardFooter className="flex flex-col md:flex-row gap-4 justify-between pt-3 pb-6">
        <Button type="button" variant="outline" onClick={prevStep}>
          Indietro
        </Button>
        <div className="flex gap-3 flex-col md:flex-row w-full md:w-auto">
          <Button
            type="button"
            className="w-full md:w-auto"
            onClick={handleDownloadPdf}
            variant="secondary"
          >
            <FileText className="mr-2" />
            Scarica preventivo PDF
          </Button>
          <Button
            type="button"
            className="w-full md:w-auto"
            onClick={sendWhatsApp}
          >
            <WhatsApp className="mr-2" />
            Invia preventivo via WhatsApp
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SummaryStep;
