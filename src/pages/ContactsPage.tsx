
import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Mail, Phone } from "lucide-react";
import emailjs from 'emailjs-com';

const ContactsPage = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Replace these with your actual EmailJS service ID, template ID, and user ID
      // You'll need to create an EmailJS account and set up a template
      const serviceId = "service_id"; // Replace with your service ID
      const templateId = "template_id"; // Replace with your template ID
      const userId = "user_id"; // Replace with your user ID

      const result = await emailjs.sendForm(
        serviceId,
        templateId,
        event.currentTarget,
        userId
      );

      if (result.text === "OK") {
        toast.success("Messaggio inviato con successo! Ti risponderemo al più presto.");
        formRef.current?.reset();
      } else {
        throw new Error("Errore nell'invio del messaggio");
      }
    } catch (error) {
      console.error("Email error:", error);
      toast.error("Si è verificato un errore. Riprova più tardi o contattaci direttamente.");
    } finally {
      setIsSubmitting(false);
    }
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
                <p className="text-muted-foreground">Via Marco Polo 112<br />73053 Patù (LE)<br />Salento, Puglia</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground">macchiaforcato@gmail.com</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-medium">Telefono</h3>
                <p className="text-muted-foreground">+39 3937767749</p>
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
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2286008529195!2d18.29282087704548!3d39.82353447131548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13442aef4bc92ee3%3A0xc5a77b4b7764eed3!2sVia%20Marco%20Polo%2C%20112%2C%2073053%20Pat%C3%B9%20LE!5e0!3m2!1sit!2sit!4v1716927634793!5m2!1sit!2sit" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
              title="Mappa Villa Mare Blu"
            ></iframe>
          </div>
        </div>
        
        {/* Form di contatto */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Scrivici</h2>
          <p className="text-muted-foreground mb-6">
            Compila il modulo sottostante per inviarci un messaggio. Ti risponderemo al più presto.
          </p>
          
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input 
                  id="firstName" 
                  name="firstName"
                  placeholder="Il tuo nome" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Cognome</Label>
                <Input 
                  id="lastName" 
                  name="lastName"
                  placeholder="Il tuo cognome" 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="La tua email" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input 
                id="phone" 
                name="phone"
                type="tel" 
                placeholder="Il tuo numero di telefono" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Oggetto</Label>
              <Input 
                id="subject" 
                name="subject"
                placeholder="Oggetto del messaggio" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Messaggio</Label>
              <Textarea 
                id="message" 
                name="message"
                placeholder="Scrivi qui il tuo messaggio..." 
                rows={5}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              size="lg" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Invio in corso..." : "Invia Messaggio"}
            </Button>
            
            <p className="text-xs text-muted-foreground mt-2">
              Inviando questo modulo, accetti la nostra <Link to="/privacy-policy" className="text-primary underline">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
