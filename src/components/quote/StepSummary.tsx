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
  Banknote,
  Send
} from 'lucide-react';
import { QuoteFormData } from '@/hooks/useMultiStepQuote';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { PricingService } from '@/services/supabase/dynamicPricingService';
import { APARTMENT_NAMES } from '@/config/apartments';

interface StepSummaryProps {
  formData: QuoteFormData;
  onNext: () => void;
  onPrev: () => void;
  getNights: () => number;
  getBedsNeeded: () => number;
  calculatePrice: () => any;
}

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
    discountType: 'none' as 'occupancy' | 'courtesy' | 'none',
    total: 0,
    deposit: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quoteSaved, setQuoteSaved] = useState(false);
  const [savingQuote, setSavingQuote] = useState(false);

  useEffect(() => {
    const loadPriceCalculation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Invalida la cache dei prezzi per ottenere dati aggiornati
        PricingService.invalidateCache();
        
        const result = await calculatePrice();
        setPriceCalculation(result);
        
        // Auto-salvataggio del preventivo quando arriva allo step 6
        if (result && !quoteSaved && !savingQuote) {
          setSavingQuote(true);
          await saveQuoteToDatabase(result);
          setQuoteSaved(true);
          setSavingQuote(false);
        }
      } catch (err) {
        setError('Non è possibile calcolare il preventivo. Alcune date potrebbero non essere disponibili.');
        setSavingQuote(false);
      } finally {
        setLoading(false);
      }
    };

    loadPriceCalculation();
  }, [formData.checkIn, formData.checkOut, formData.selectedApartments]);

  const saveQuoteToDatabase = async (priceData: any) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('quote_requests')
        .insert({
          checkin_date: formData.checkIn,
          checkout_date: formData.checkOut,
          adults: formData.adults,
          children: formData.children,
          children_no_bed: formData.childrenWithParents.filter(Boolean).length,
          selected_apartments: formData.selectedApartments,
          has_pet: formData.hasPets,
          pet_apartment: null,
          linen_requested: formData.requestLinen,
          base_total: priceData.apartmentPrices?.reduce((sum: number, apt: any) => sum + apt.basePrice, 0) || 0,
          discount_total: priceData.apartmentPrices?.reduce((sum: number, apt: any) => sum + apt.discountAmount, 0) || 0,
          extras_total: priceData.servicesTotal || 0,
          final_total: priceData.total || 0,
          whatsapp_sent: false
        } as any)
        .select('id');

      if (error) {
        // Errore silenzioso nel salvataggio
      }
    } catch (err) {
      // Errore silenzioso nel salvataggio automatico
    }
  };

  const nights = getNights();
  const bedsNeeded = getBedsNeeded();

  const sendWhatsApp = async () => {
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
  return `• ${APARTMENT_NAMES[aptId] || `Appartamento ${aptId}`} - Occupazione: ${apt?.occupation}`;
}).join('\n')}

${formData.hasPets ? `🐕 *ANIMALE:* Sì - ${formData.petCount || 1} animale${(formData.petCount || 1) > 1 ? 'i' : ''}` : '🐕 *ANIMALE:* No'}
${formData.requestLinen ? `🛏️ *BIANCHERIA:* Sì - ${bedsNeeded} ospiti` : '🛏️ *BIANCHERIA:* No'}

💰 *PREVENTIVO:*
Prezzo base: €${priceCalculation.apartmentPrices.reduce((sum: number, apt: any) => sum + apt.basePrice, 0)}
${priceCalculation.finalDiscount > 0 ? `${priceCalculation.discountType === 'occupancy' ? 'Sconto occupazione' : 'Arrotondamento cortesia'}: -€${priceCalculation.finalDiscount}` : ''}
Servizi extra: €${priceCalculation.servicesTotal}
TOTALE: €${priceCalculation.total}

💳 *PAGAMENTO:*
💰 Caparra (30%): €${priceCalculation.deposit}
💰 Saldo arrivo: €${priceCalculation.balance}
🔐 Cauzione al Check-in (contanti): 200 €${formData.selectedApartments.length > 1 ? ` per appartamento (${formData.selectedApartments.length * 200} € totali)` : ''}

*Preventivo senza impegno - Valido 7 giorni*`;

    const whatsappUrl = `https://wa.me/393780038730?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Aggiorna il preventivo più recente nel database come "inviato"
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase
        .from('quote_requests')
        .update({ whatsapp_sent: true })
        .eq('checkin_date', formData.checkIn)
        .eq('checkout_date', formData.checkOut)
        .eq('adults', formData.adults)
        .eq('children', formData.children)
        .eq('whatsapp_sent', false)
        .order('created_at', { ascending: false })
        .limit(1);
      
    } catch (err) {
      // Errore silenzioso nell'aggiornamento
    }
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
                
                <div className="text-sm text-muted-foreground">
                  Prezzo settimanale: €{apt.basePrice}
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
                  <span>Animali domestici ({formData.petCount || 1})</span>
                </div>
                <span className="font-semibold">€{(formData.petCount || 1) * 50}</span>
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
            
            
            {/* Costi Inclusi */}
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Costi Inclusi</h4>
              <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                <div className="flex items-center gap-2">
                  <span>•</span>
                  <span>Utenze</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>•</span>
                  <span>Spese di Pulizia</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>•</span>
                  <span>Tassa di Soggiorno</span>
                </div>
              </div>
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
                <span>
                  {priceCalculation.discountType === 'occupancy'
                    ? 'Sconto occupazione:'
                    : 'Arrotondamento cortesia:'}
                </span>
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
            <h4 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Condizioni di pagamento
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                <span>Caparra (30%):</span>
                <span className="font-semibold">€{(priceCalculation.deposit || 0).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
                <span>Saldo all'arrivo:</span>
                <span className="font-semibold">€{(priceCalculation.balance || 0).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                <span className="flex items-center gap-1">
                  <Banknote className="h-3 w-3" />
                  🔐 Cauzione al Check-in (contanti):
                </span>
                <span className="font-semibold">
                  200 €{formData.selectedApartments.length > 1 ? ` per appartamento (${formData.selectedApartments.length * 200} € totali)` : ''}
                </span>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>• La caparra del 30% è richiesta per confermare la prenotazione</p>
              <p>• Il saldo è dovuto il giorno dell'arrivo</p>
              <p>• La cauzione in contanti è a garanzia dell'appartamento</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onPrev} size="lg">
          Indietro
        </Button>
        <Button onClick={sendWhatsApp} size="lg" className="min-w-[200px]">
          <Send className="h-4 w-4 mr-2" />
          Invia su WhatsApp
        </Button>
      </div>
    </div>
  );
};