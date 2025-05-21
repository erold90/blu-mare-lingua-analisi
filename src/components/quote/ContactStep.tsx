
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Download, MessageCircle, FileText, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { calculateTotalPrice } from "@/utils/price/priceCalculator";
import { Separator } from "@/components/ui/separator";
import QuoteConfirmationDialog from "./QuoteConfirmationDialog";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface ContactStepProps {
  form: UseFormReturn<FormValues>;
  apartments: Apartment[];
  prevStep: () => void;
  onSubmit: () => void;
  downloadQuote: (name?: string) => void;
  sendWhatsApp: () => void;
}

const ContactStep: React.FC<ContactStepProps> = ({ 
  form, 
  apartments,
  prevStep, 
  onSubmit,
  downloadQuote, 
  sendWhatsApp 
}) => {
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const formValues = form.getValues();
  const priceInfo = calculateTotalPrice(formValues, apartments);
  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  // Function to handle PDF download directly
  const handleDownloadClick = () => {
    setShowPdfDialog(true);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Finalizza il preventivo</CardTitle>
          <CardDescription>Rivedi il tuo preventivo personalizzato</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Riepilogo generale del prezzo */}
          <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-medium">Riepilogo del preventivo</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days">
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                    <path d="M8 14h.01" />
                    <path d="M12 14h.01" />
                    <path d="M16 14h.01" />
                    <path d="M8 18h.01" />
                    <path d="M12 18h.01" />
                    <path d="M16 18h.01" />
                  </svg>
                  Periodo:
                </span>
                <span className="font-medium">
                  {formValues.checkIn && formValues.checkOut ? 
                    `${format(formValues.checkIn, 'dd/MM/yyyy', { locale: it })} - ${format(formValues.checkOut, 'dd/MM/yyyy', { locale: it })}` :
                    '-'}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Durata:
                </span>
                <span className="font-medium">{priceInfo.nights} notti</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Ospiti:
                </span>
                <span className="font-medium">
                  {formValues.adults} adulti{formValues.children > 0 ? `, ${formValues.children} bambini` : ''}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Appartamenti:
                </span>
                <div className="font-medium flex flex-col items-end">
                  <span>{selectedApartments.length}</span>
                  <span className="text-xs text-muted-foreground">
                    ({selectedApartments.map(apt => apt.name).join(', ')})
                  </span>
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between items-center font-semibold">
                <span>Totale:</span>
                <span className="text-primary text-lg">{priceInfo.totalAfterDiscount}€</span>
              </div>
              
              {priceInfo.discount > 0 && (
                <div className="flex justify-between items-center text-sm text-green-500">
                  <span>Sconto:</span>
                  <span>{priceInfo.discount}€</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-piggy-bank">
                    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z" />
                    <path d="M2 9v1c0 1.1.9 2 2 2h1" />
                    <path d="M16 11h0" />
                  </svg>
                  Caparra (30%):
                </span>
                <span>{priceInfo.deposit}€</span>
              </div>
            </div>
          </div>
          
          {/* Lista degli appartamenti */}
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-3">Appartamenti selezionati</h3>
            <div className="space-y-3">
              {selectedApartments.map((apartment, index) => {
                const apartmentPrice = priceInfo.apartmentPrices?.[apartment.id] || 0;
                const isLastItem = index === selectedApartments.length - 1;
                
                return (
                  <div key={apartment.id} className={`${!isLastItem ? 'pb-3 border-b' : ''}`}>
                    <div className="flex justify-between items-center">
                      <span>{apartment.name}</span>
                      <span className="font-medium">{apartmentPrice}€</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row gap-4 justify-between">
          <Button type="button" variant="outline" onClick={prevStep}>Indietro</Button>
          <div className="flex flex-col md:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="gap-2"
              onClick={handleDownloadClick}
            >
              <FileText className="h-4 w-4" />
              Scarica preventivo PDF
            </Button>
            <Button 
              type="button"
              className="gap-2 bg-green-600 hover:bg-green-700"
              onClick={sendWhatsApp}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="lucide lucide-whatsapp"
              >
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                <path d="M9.5 13.5c.5 1 1.5 1 2.5 1s2-.5 2.5-1" />
              </svg>
              Invia su WhatsApp
            </Button>
            <Button 
              type="button"
              onClick={onSubmit}
            >
              Finalizza
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <QuoteConfirmationDialog 
        open={showPdfDialog} 
        onOpenChange={setShowPdfDialog}
        onConfirm={(name) => {
          downloadQuote(name);
          setShowPdfDialog(false);
        }}
        onSkip={() => {
          downloadQuote();
          setShowPdfDialog(false);
        }}
      />
    </>
  );
};

export default ContactStep;
