import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Receipt, 
  Calendar, 
  Users, 
  Home, 
  Heart, 
  Bed, 
  Euro,
  CreditCard,
  Banknote
} from 'lucide-react';
import { QuoteFormData } from '@/hooks/useMultiStepQuote';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface StepSummaryProps {
  formData: QuoteFormData;
  onNext: () => void;
  onPrev: () => void;
  getNights: () => number;
  getBedsNeeded: () => number;
  calculatePrice: () => any;
}

const apartmentNames = {
  "appartamento-1": "Appartamento 1 (6 posti letto)",
  "appartamento-2": "Appartamento 2 (8 posti letto)", 
  "appartamento-3": "Appartamento 3 (4 posti letto)",
  "appartamento-4": "Appartamento 4 (5 posti letto)"
};

export const StepSummary: React.FC<StepSummaryProps> = ({
  formData,
  onNext,
  onPrev,
  getNights,
  getBedsNeeded,
  calculatePrice
}) => {
  const [priceCalculation, setPriceCalculation] = useState({
    apartmentPrices: [],
    servicesTotal: 0,
    subtotal: 0,
    finalDiscount: 0,
    total: 0,
    deposit: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPriceCalculation = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await calculatePrice();
        setPriceCalculation(result);
      } catch (err) {
        console.error('Errore nel calcolo prezzi:', err);
        setError('Non è possibile calcolare il preventivo. Alcune date potrebbero non essere disponibili.');
      } finally {
        setLoading(false);
      }
    };

    loadPriceCalculation();
  }, [formData.checkIn, formData.checkOut, formData.selectedApartments]);

  const nights = getNights();
  const bedsNeeded = getBedsNeeded();

  const sendWhatsApp = () => {
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

*Preventivo senza impegno - Valido 7 giorni*`;

    const whatsappUrl = `https://wa.me/393937767749?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <Receipt className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Riepilogo Preventivo</h2>
          <p className="text-muted-foreground">
            Villa MareBlu - Torre Vado, Salento
          </p>
        </div>
        
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Calcolando il tuo preventivo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <Receipt className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Errore nel Preventivo</h2>
          <p className="text-muted-foreground">
            Villa MareBlu - Torre Vado, Salento
          </p>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Impossibile calcolare il preventivo</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={onPrev}>
              Torna indietro e modifica le date
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Receipt className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Riepilogo Preventivo</h2>
        <p className="text-muted-foreground">
          Villa MareBlu - Torre Vado, Salento
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Dettagli Soggiorno */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dettagli soggiorno
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Check-in</div>
                <div className="font-semibold">
                  {format(new Date(formData.checkIn), 'dd MMM yyyy', { locale: it })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(formData.checkIn), 'EEEE', { locale: it })}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Check-out</div>
                <div className="font-semibold">
                  {format(new Date(formData.checkOut), 'dd MMM yyyy', { locale: it })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(formData.checkOut), 'EEEE', { locale: it })}
                </div>
              </div>
            </div>
            
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{nights}</div>
              <div className="text-sm text-muted-foreground">notti di soggiorno</div>
            </div>
          </CardContent>
        </Card>

        {/* Ospiti */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ospiti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{formData.adults}</div>
                <div className="text-sm text-muted-foreground">Adulti</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{formData.children}</div>
                <div className="text-sm text-muted-foreground">Bambini</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{bedsNeeded}</div>
                <div className="text-sm text-muted-foreground">Posti letto</div>
              </div>
            </div>

            {formData.children > 0 && (
              <div className="text-sm text-muted-foreground">
                <div className="font-semibold mb-1">Dettagli bambini:</div>
                {formData.childrenWithParents.map((withParents, index) => (
                  <div key={index} className="flex justify-between">
                    <span>Bambino {index + 1}:</span>
                    <span>{withParents ? 'Con genitori/culla' : 'Posto letto proprio'}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Appartamenti Selezionati */}
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Appartamenti selezionati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priceCalculation.apartmentPrices.map((apt: any) => (
              <div key={apt.apartmentId} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{apt.name}</h4>
                    <div className="text-sm text-muted-foreground">
                      Occupazione: {apt.occupation} posti ({apt.occupationPercent}%)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">€{apt.finalPrice}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Prezzo base:</span>
                    <span className="float-right">€{apt.basePrice}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sconto occupazione ({apt.discount}%):</span>
                    <span className="float-right text-green-600">-€{apt.discountAmount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Servizi Aggiuntivi */}
      {(formData.hasPets || formData.requestLinen) && (
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle>Servizi aggiuntivi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.hasPets && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>Animale domestico</span>
                  {formData.selectedApartments.length > 1 && formData.petApartment && (
                    <Badge variant="outline" className="ml-2">
                      {apartmentNames[formData.petApartment as keyof typeof apartmentNames]}
                    </Badge>
                  )}
                </div>
                <span className="font-semibold">€50</span>
              </div>
            )}
            
            {formData.requestLinen && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  <span>Biancheria ({bedsNeeded} ospiti)</span>
                </div>
                <span className="font-semibold">€{15 * bedsNeeded}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Riepilogo Prezzi */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Riepilogo prezzi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Totale appartamenti:</span>
              <span className="font-semibold">
                €{(priceCalculation.apartmentPrices || []).reduce((sum: number, apt: any) => sum + apt.finalPrice, 0).toFixed(2)}
              </span>
            </div>
            
            {priceCalculation.servicesTotal > 0 && (
              <div className="flex justify-between">
                <span>Servizi aggiuntivi:</span>
                <span className="font-semibold">€{(priceCalculation.servicesTotal || 0).toFixed(2)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between">
              <span>Totale parziale:</span>
              <span className="font-semibold">€{(priceCalculation.subtotal || 0).toFixed(2)}</span>
            </div>
            
            {priceCalculation.finalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Sconto finale:</span>
                <span className="font-semibold">-€{(priceCalculation.finalDiscount || 0).toFixed(2)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between text-xl font-bold text-primary">
              <span>TOTALE FINALE:</span>
              <span>€{(priceCalculation.total || 0).toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {/* Condizioni Pagamento */}
          <div className="space-y-3">
            <h4 className="font-semibold">Condizioni di pagamento</h4>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span className="text-blue-900 dark:text-blue-100">Caparra (30%)</span>
              </div>
              <span className="font-bold text-blue-900 dark:text-blue-100">€{priceCalculation.deposit}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-green-600" />
                <span className="text-green-900 dark:text-green-100">Saldo all'arrivo</span>
              </div>
              <span className="font-bold text-green-900 dark:text-green-100">€{priceCalculation.balance}</span>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="text-yellow-900 dark:text-yellow-100 font-semibold">
                Cauzione: €200
              </div>
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                (restituita al check-out se non ci sono danni)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onPrev} size="lg">
          Indietro
        </Button>
        <Button onClick={sendWhatsApp} size="lg" className="min-w-[200px]" disabled={loading}>
          {loading ? 'Caricamento...' : 'Invia su WhatsApp'}
        </Button>
      </div>
    </div>
  );
};