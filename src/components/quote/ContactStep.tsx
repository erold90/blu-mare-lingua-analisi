
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Download, MessageCircle } from "lucide-react";
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

interface ContactStepProps {
  form: UseFormReturn<FormValues>;
  prevStep: () => void;
  onSubmit: () => void;
  downloadQuote: () => void;
  sendWhatsApp: () => void;
}

const ContactStep: React.FC<ContactStepProps> = ({ 
  form, 
  prevStep, 
  downloadQuote, 
  sendWhatsApp 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Finalizza il preventivo</CardTitle>
        <CardDescription>Inserisci i tuoi dati per ricevere il preventivo personalizzato</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
            onClick={downloadQuote}
          >
            <Download className="h-4 w-4" />
            Scarica preventivo
          </Button>
          <Button 
            type="button"
            className="gap-2 bg-green-600 hover:bg-green-700"
            onClick={sendWhatsApp}
          >
            <MessageCircle className="h-4 w-4" />
            Richiedi su WhatsApp
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ContactStep;
