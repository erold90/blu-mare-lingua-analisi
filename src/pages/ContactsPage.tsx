
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { MapPin, Mail, Phone } from "lucide-react";

const ContactsPage = () => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      title: "Messaggio inviato",
      description: "Ti risponderemo al più presto. Grazie per averci contattato!"
    });
  };

  return (
    <div className="container px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Contatti</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Informazioni di contatto */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Come raggiungerci</h2>
          
          <div className="flex flex-col space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-medium">Indirizzo</h3>
                <p className="text-muted-foreground">Via del Mare, 123<br />07026 Olbia (SS)<br />Sardegna, Italia</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground">info@villamareblu.it<br />prenotazioni@villamareblu.it</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-medium">Telefono</h3>
                <p className="text-muted-foreground">+39 0789 12345<br />+39 345 6789012 (Cellulare)</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Orari</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>Lunedì - Venerdì:</div>
              <div>9:00 - 18:00</div>
              <div>Sabato:</div>
              <div>9:00 - 13:00</div>
              <div>Domenica:</div>
              <div>Chiuso</div>
            </div>
          </div>
          
          <div className="mt-8 h-64 md:h-80 bg-muted rounded-lg">
            {/* Qui si potrebbe inserire una mappa */}
            <div className="w-full h-full flex items-center justify-center bg-blue-100 rounded-lg">
              <span className="text-muted-foreground">Mappa</span>
            </div>
          </div>
        </div>
        
        {/* Form di contatto */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Scrivici</h2>
          <p className="text-muted-foreground mb-6">
            Compila il modulo sottostante per inviarci un messaggio. Ti risponderemo al più presto.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input id="firstName" placeholder="Il tuo nome" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Cognome</Label>
                <Input id="lastName" placeholder="Il tuo cognome" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="La tua email" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" type="tel" placeholder="Il tuo numero di telefono" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Oggetto</Label>
              <Input id="subject" placeholder="Oggetto del messaggio" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Messaggio</Label>
              <Textarea 
                id="message" 
                placeholder="Scrivi qui il tuo messaggio..." 
                rows={5}
                required
              />
            </div>
            
            <Button type="submit" size="lg" className="w-full">
              Invia Messaggio
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
