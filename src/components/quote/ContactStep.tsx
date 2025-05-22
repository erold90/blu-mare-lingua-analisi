import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Download, MessageCircle, FileText, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { calculateTotalPrice } from "@/utils/price/priceCalculator";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface ContactStepProps {
  form: UseFormReturn<FormValues>;
  apartments: Apartment[];
  prevStep: () => void;
  onSubmit: () => void;
  sendWhatsApp: () => void;
}

const ContactStep: React.FC<ContactStepProps> = ({ 
  form, 
  apartments,
  prevStep, 
  onSubmit,
  sendWhatsApp 
}) => {
  const formValues = form.getValues();
  const priceInfo = calculateTotalPrice(formValues, apartments);
  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Finalizza il preventivo</CardTitle>
          <CardDescription>Rivedi il tuo preventivo personalizzato</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Colonna sinistra: riepilogo generale */}
            <div className="space-y-3">
              <div className="border rounded-md p-3">
                <h3 className="font-medium mb-2">Riepilogo del preventivo</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
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
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Durata:
                    </span>
                    <span className="font-medium">{priceInfo.nights} notti</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 1 0 7.75" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      Ospiti:
                    </span>
                    <span className="font-medium">
                      {formValues.adults} adulti{formValues.children > 0 ? `, ${formValues.children} bambini` : ''}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
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
                        ({selectedApartments.map(apt => apt.name.split(" ")[1]).join(', ')})
                      </span>
                    </div>
                  </div>
                  
                  <Separator className="my-1.5" />
                  
                  <div className="flex justify-between items-center font-semibold">
                    <span>Totale:</span>
                    <span className="text-primary text-lg">{priceInfo.totalAfterDiscount}€</span>
                  </div>
                </div>
              </div>
              
              {/* Lista degli appartamenti */}
              <div className="border rounded-md p-3">
                <h3 className="font-medium mb-2">Appartamenti</h3>
                <div className="space-y-2 text-sm">
                  {selectedApartments.map((apartment, index) => {
                    const apartmentPrice = priceInfo.apartmentPrices?.[apartment.id] || 0;
                    const isLastItem = index === selectedApartments.length - 1;
                    
                    return (
                      <div key={apartment.id} className={`${!isLastItem ? 'pb-2 border-b' : ''}`}>
                        <div className="flex justify-between items-center">
                          <span>{apartment.name}</span>
                          <span className="font-medium">{apartmentPrice}€</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Colonna destra: dettagli del prezzo e azioni */}
            <div className="space-y-3">
              <div className="border rounded-md p-3">
                <h3 className="font-medium mb-2">Dettagli prezzo</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Prezzo base:</span>
                    <span>{priceInfo.basePrice}€</span>
                  </div>
                  
                  {priceInfo.extras > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Extra:</span>
                      <span>{priceInfo.extras}€</span>
                    </div>
                  )}
                  
                  {priceInfo.discount > 0 && (
                    <div className="flex justify-between items-center text-green-500">
                      <span>Sconto:</span>
                      <span>-{priceInfo.discount}€</span>
                    </div>
                  )}
                  
                  <Separator className="my-1.5" />
                  
                  <div className="flex justify-between items-center font-bold">
                    <span>Totale:</span>
                    <span>{priceInfo.totalAfterDiscount}€</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Caparra (30%):</span>
                    <span>{priceInfo.deposit}€</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Cauzione:</span>
                    <span>200€ <span className="text-xs text-muted-foreground">(restituibile)</span></span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-3 bg-muted/30">
                <h3 className="font-medium mb-2">Azioni disponibili</h3>
                <div className="flex flex-col gap-2">
                  <Button 
                    type="button"
                    className="justify-start gap-2 bg-green-600 hover:bg-green-700 text-sm"
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
                    className="justify-start gap-2 text-sm"
                    onClick={onSubmit}
                  >
                    <Send className="h-4 w-4" />
                    Finalizza e richiedi disponibilità
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={prevStep}>Indietro</Button>
          <Button 
            type="button"
            onClick={onSubmit}
          >
            Finalizza
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default ContactStep;
