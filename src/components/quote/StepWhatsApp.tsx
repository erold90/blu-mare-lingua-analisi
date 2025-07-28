import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Mail, Phone, Send } from 'lucide-react';
import { QuoteFormData } from '@/hooks/useMultiStepQuote';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface StepWhatsAppProps {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  onPrev: () => void;
  getNights: () => number;
  getBedsNeeded: () => number;
  calculatePrice: () => any;
}

export const StepWhatsApp: React.FC<StepWhatsAppProps> = ({
  formData,
  updateFormData,
  onPrev,
  getNights,
  getBedsNeeded,
  calculatePrice
}) => {
  const [isSending, setIsSending] = useState(false);
  
  const nights = getNights();
  const bedsNeeded = getBedsNeeded();
  const priceCalculation = calculatePrice();

  const canSend = () => {
    return formData.guestName && formData.email;
  };

  const sendWhatsApp = () => {
    if (!canSend()) return;
    
    setIsSending(true);
    
    const apartmentNames = {
      "appartamento-1": "Appartamento 1 (6 posti)",
      "appartamento-2": "Appartamento 2 (8 posti)", 
      "appartamento-3": "Appartamento 3 (4 posti)",
      "appartamento-4": "Appartamento 4 (5 posti)"
    };

    const message = `🏖️ *RICHIESTA PREVENTIVO VILLA MAREBLU*

📅 *SOGGIORNO:*
Check-in: ${format(new Date(formData.checkIn), 'dd/MM/yyyy (EEEE)', { locale: it })}
Check-out: ${format(new Date(formData.checkOut), 'dd/MM/yyyy (EEEE)', { locale: it })}
Durata: ${nights} notti

👥 *OSPITI:*
Adulti: ${formData.adults}
Bambini: ${formData.children}${formData.children > 0 ? ` (di cui ${formData.childrenWithParents.filter(Boolean).length} non occupano posto letto)` : ''}
Totale posti letto: ${bedsNeeded}

🏠 *APPARTAMENTI:*
${formData.selectedApartments.map(aptId => {
  const apt = priceCalculation.apartmentPrices.find((p: any) => p.apartmentId === aptId);
  return `• ${apartmentNames[aptId as keyof typeof apartmentNames]} - Occupazione: ${apt?.occupation}`;
}).join('\n')}

${formData.hasPets ? `🐕 *ANIMALE:* Sì${formData.petApartment ? ` - ${apartmentNames[formData.petApartment as keyof typeof apartmentNames]}` : ''}` : '🐕 *ANIMALE:* No'}
${formData.requestLinen ? `🛏️ *BIANCHERIA:* Sì - ${bedsNeeded} ospiti` : '🛏️ *BIANCHERIA:* No'}

💰 *PREVENTIVO:*
Prezzo base: €${priceCalculation.apartmentPrices.reduce((sum: number, apt: any) => sum + apt.basePrice, 0)}
Sconti occupazione: -€${priceCalculation.apartmentPrices.reduce((sum: number, apt: any) => sum + apt.discountAmount, 0)}
Servizi extra: €${priceCalculation.servicesTotal}
TOTALE: €${priceCalculation.total}

💳 *PAGAMENTO:*
Caparra (30%): €${priceCalculation.deposit}
Saldo arrivo: €${priceCalculation.balance}

👤 *CONTATTI:*
Nome: ${formData.guestName}
Email: ${formData.email}
${formData.phone ? `Telefono: ${formData.phone}` : ''}

*Preventivo senza impegno - Valido 7 giorni*`;

    const whatsappUrl = `https://wa.me/393937767749?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    setTimeout(() => setIsSending(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Invia il preventivo</h2>
        <p className="text-muted-foreground">
          Compila i tuoi dati e invia la richiesta via WhatsApp
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            I tuoi dati
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guestName">Nome e Cognome *</Label>
              <Input
                id="guestName"
                value={formData.guestName}
                onChange={(e) => updateFormData({ guestName: e.target.value })}
                placeholder="Il tuo nome completo"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="tua@email.com"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="phone">Telefono (opzionale)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              placeholder="+39 123 456 7890"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Riepilogo finale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Badge variant="outline" className="text-lg py-2 px-4 mb-4">
              Totale: €{priceCalculation.total}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Il preventivo verrà inviato automaticamente via WhatsApp
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onPrev} size="lg">
          Indietro
        </Button>
        <Button
          onClick={sendWhatsApp}
          disabled={!canSend() || isSending}
          size="lg"
          className="min-w-[200px]"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSending ? 'Invio...' : 'Invia su WhatsApp'}
        </Button>
      </div>
    </div>
  );
};