
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Download, MessageCircle, FileText, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { calculateTotalPrice } from "@/utils/quoteCalculator";
import { Separator } from "@/components/ui/separator";
import QuoteConfirmationDialog from "./QuoteConfirmationDialog";

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
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Finalizza il preventivo</CardTitle>
          <CardDescription>Inserisci i tuoi dati per ricevere il preventivo personalizzato</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Riepilogo generale del prezzo */}
          <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-medium">Riepilogo del preventivo</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Periodo:</span>
                <span className="font-medium">
                  {formValues.checkIn && formValues.checkOut ? 
                    `${formValues.checkIn.toLocaleDateString('it-IT')} - ${formValues.checkOut.toLocaleDateString('it-IT')}` :
                    '-'}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Durata:</span>
                <span className="font-medium">{priceInfo.nights} notti</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Ospiti:</span>
                <span className="font-medium">
                  {formValues.adults} adulti{formValues.children > 0 ? `, ${formValues.children} bambini` : ''}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Appartamenti:</span>
                <span className="font-medium">
                  {(formValues.selectedApartments || [formValues.selectedApartment]).length}
                </span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between items-center font-semibold">
                <span>Totale:</span>
                <span className="text-primary text-lg">{priceInfo.totalAfterDiscount}€</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Caparra (30%):</span>
                <span>{priceInfo.deposit}€</span>
              </div>
            </div>
          </div>
          
          {/* Dati di contatto */}
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome e cognome</FormLabel>
                  <FormControl>
                    <Input placeholder="Mario Rossi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="mario.rossi@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefono</FormLabel>
                  <FormControl>
                    <Input placeholder="+39 123 456 7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note e richieste speciali</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Inserisci eventuali richieste speciali o informazioni aggiuntive" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row gap-4 justify-between">
          <Button type="button" variant="outline" onClick={prevStep}>Indietro</Button>
          <div className="flex flex-col md:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="gap-2"
              onClick={() => setShowPdfDialog(true)}
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
