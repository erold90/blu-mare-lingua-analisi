import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Mail, Phone } from "lucide-react";
import emailjs from 'emailjs-com';
import SEOHead from "@/components/seo/SEOHead";
import { getBreadcrumbSchema } from "@/components/seo/StructuredData";
import { getPageSpecificKeywords } from "@/utils/seo/seoConfig";

const ContactsPage = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Contatti", url: "/contatti" }
  ];

  const structuredData = [getBreadcrumbSchema(breadcrumbItems)];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // EmailJS configuration
      const serviceId = "service_ul8o9ys";
      const templateId = "template_1x33ckb";
      const publicKey = "F6q-jHsB19AHMtNwW";

      console.log("Invio email tramite EmailJS...");
      
      const result = await emailjs.sendForm(
        serviceId,
        templateId,
        event.currentTarget,
        publicKey
      );

      console.log("Risultato invio email:", result);

      if (result.text === "OK") {
        toast.success("Messaggio inviato con successo! Ti risponderemo al più presto.");
        formRef.current?.reset();
      } else {
        throw new Error("Errore nell'invio del messaggio");
      }
    } catch (error) {
      console.error("Errore invio email:", error);
      toast.error("Si è verificato un errore. Puoi contattarci direttamente a macchiaforcato@gmail.com o al +39 3937767749");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-4 py-8 md:py-12">
      <SEOHead
        title="Contatti Villa MareBlu Salento - Affitto Settimanale Puglia | Weekend Romantico Salento"
        description="Contatta Villa MareBlu per il tuo affitto settimanale Puglia o weekend romantico Salento. Info, prenotazioni e disponibilità villa lusso Torre Vado. Tel: +39 3937767749"
        keywords={getPageSpecificKeywords('contact')}
        canonicalUrl="/contatti"
        structuredData={structuredData}
        ogTitle="Contatti Villa MareBlu - Prenota la Tua Vacanza in Salento"
        ogDescription="Contattaci per prenotare la tua villa di lusso in Salento. Affitto settimanale e weekend romantici nel cuore della Puglia"
      />

      <h1 className="text-3xl md:text-4xl font-bold mb-6">Contatti Villa MareBlu</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Informazioni di contatto */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Come Raggiungerci per il Tuo Soggiorno</h2>
          
          <div className="flex flex-col space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-medium">Indirizzo Villa MareBlu</h3>
                <p className="text-muted-foreground">Via Marco Polo 112<br />73053 Patù (LE)<br />Salento, Puglia<br /><em>Villa lusso Salento mare</em></p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-medium">Email per Prenotazioni</h3>
                <p className="text-muted-foreground">macchiaforcato@gmail.com</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <em>Risposta garantita entro 2 ore per affitto settimanale Puglia</em>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-medium">Telefono Villa MareBlu</h3>
                <p className="text-muted-foreground">+39 3937767749</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <em>Disponibile 7/7 per weekend romantico Salento</em>
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Orari di Contatto</h3>
            <div className="grid grid-cols-2 gap-2 bg-primary/5 p-4 rounded-lg">
              <div className="font-medium">Lunedì - Venerdì:</div>
              <div>9:00 - 18:00</div>
              <div className="font-medium">Sabato:</div>
              <div>9:00 - 13:00</div>
              <div className="font-medium">Domenica:</div>
              <div>Su appuntamento</div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              <em>Per emergenze durante il soggiorno, siamo sempre reperibili</em>
            </p>
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
              title="Mappa Villa MareBlu Salento - Via Marco Polo 112, Patù (LE)"
            ></iframe>
          </div>
        </div>
        
        {/* Form di contatto */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Richiedi Informazioni per la Tua Vacanza</h2>
          <p className="text-muted-foreground mb-6">
            Compila il modulo per ricevere informazioni dettagliate sul nostro <strong>affitto settimanale Puglia</strong> 
            o per organizzare il tuo <strong>weekend romantico Salento</strong>. Ti risponderemo entro 2 ore!
          </p>
          
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome *</Label>
                <Input 
                  id="firstName" 
                  name="firstName"
                  placeholder="Il tuo nome" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Cognome *</Label>
                <Input 
                  id="lastName" 
                  name="lastName"
                  placeholder="Il tuo cognome" 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
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
              <Label htmlFor="subject">Oggetto *</Label>
              <Input 
                id="subject" 
                name="subject"
                placeholder="Es: Preventivo weekend romantico Salento" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Messaggio *</Label>
              <Textarea 
                id="message" 
                name="message"
                placeholder="Descrivi la tua richiesta: date preferite, numero ospiti, servizi desiderati..." 
                rows={5}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Invio in corso..." : "Invia Richiesta di Prenotazione"}
            </Button>
            
            <p className="text-xs text-muted-foreground mt-2">
              Inviando questo modulo, accetti la nostra <Link to="/privacy-policy" className="text-primary underline">Privacy Policy</Link>.
              <br />
              <em>Garantiamo risposta entro 2 ore per tutte le richieste di affitto settimanale Puglia.</em>
            </p>
          </form>
        </div>
      </div>

      {/* Sezione info aggiuntive */}
      <div className="mt-16 bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center text-primary">
          Perché Prenotare Direttamente con Noi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold mb-2">Miglior Prezzo Garantito</h3>
            <p className="text-sm text-muted-foreground">
              Nessuna commissione aggiuntiva per il tuo affitto settimanale Puglia
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2">Servizio Personalizzato</h3>
            <p className="text-sm text-muted-foreground">
              Assistenza dedicata per il tuo weekend romantico Salento
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2">Risposta Rapida</h3>
            <p className="text-sm text-muted-foreground">
              Conferma disponibilità entro 2 ore dalla richiesta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
