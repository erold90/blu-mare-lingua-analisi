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

interface StepSummaryProps {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  getNights: () => number;
  getBedsNeeded: () => number;
  calculatePrice: () => any;
}

export const StepSummary: React.FC<StepSummaryProps> = ({
  formData,
  updateFormData,
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
  const [isSending, setIsSending] = useState(false);

  // Refs per evitare calcoli e salvataggi duplicati
  const hasCalculated = React.useRef(false);
  const hasSaved = React.useRef(false);
  const lastCalculationKey = React.useRef('');

  const calculationKey = `${formData.checkIn}-${formData.checkOut}-${formData.selectedApartments.join(',')}`;

  useEffect(() => {
    // Se la chiave è cambiata, resetta i flag
    if (lastCalculationKey.current !== calculationKey) {
      hasCalculated.current = false;
      hasSaved.current = false;
      lastCalculationKey.current = calculationKey;
    }

    // Evita calcoli duplicati
    if (hasCalculated.current) return;
    hasCalculated.current = true;

    const loadPriceCalculation = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await calculatePrice();
        setPriceCalculation(result);

        // Auto-salvataggio (una sola volta)
        if (result && !hasSaved.current) {
          hasSaved.current = true;
          await saveQuoteToDatabase(result);
        }
      } catch (err) {
        setError('Non è possibile calcolare il preventivo. Alcune date potrebbero non essere disponibili.');
        hasCalculated.current = false; // Permetti retry su errore
      } finally {
        setLoading(false);
      }
    };

    loadPriceCalculation();
  }, [calculationKey]); // Rimosso quoteSaved!

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

  const canSend = () => {
    return !isSending && !loading;
  };

  const sendWhatsApp = async () => {
    if (!canSend()) return;

    setIsSending(true);
    // Costruisci sezioni opzionali
    const servicesLines = [];
    if (formData.hasPets) {
      servicesLines.push(`🐕 Animali: ${formData.petCount || 1}`);
    }
    if (formData.requestLinen) {
      servicesLines.push(`🛏 Biancheria: ${bedsNeeded} ospiti`);
    }

    const cauzioneTotal = formData.selectedApartments.length * 200;
    const cauzioneText = formData.selectedApartments.length > 1
      ? `€${cauzioneTotal} (€200 × ${formData.selectedApartments.length})`
      : `€200`;

    const message = `🏖 *RICHIESTA PREVENTIVO VILLA MAREBLU*

📅 *SOGGIORNO:*
Check-in: ${format(new Date(formData.checkIn), 'dd/MM/yyyy (EEEE)', { locale: it })}
Check-out: ${format(new Date(formData.checkOut), 'dd/MM/yyyy (EEEE)', { locale: it })}
Durata: ${nights} notti

👥 *OSPITI:*
Adulti: ${formData.adults}
Bambini: ${formData.children}${formData.children > 0 ? ` (${formData.childrenWithParents.filter(Boolean).length} con genitori)` : ''}
Posti letto: ${bedsNeeded}

🏠 *APPARTAMENTI:*
${formData.selectedApartments.map((aptId) => {
  const apt = priceCalculation.apartmentPrices.find((p: any) => p.apartmentId === aptId.toString());
  return `• Appartamento ${aptId} (${apt?.occupation || 'N/D'} posti)`;
}).join('\n')}
${servicesLines.length > 0 ? `\n*SERVIZI:*\n${servicesLines.join('\n')}` : ''}

💰 *PREVENTIVO:*
Appartamenti: €${priceCalculation.apartmentPrices.reduce((sum: number, apt: any) => sum + apt.basePrice, 0)}${priceCalculation.finalDiscount > 0 ? `\n${priceCalculation.discountType === 'occupancy' ? 'Sconto occupazione' : 'Arrotondamento'}: -€${priceCalculation.finalDiscount}` : ''}${priceCalculation.servicesTotal > 0 ? `\nServizi extra: €${priceCalculation.servicesTotal}` : ''}
*TOTALE: €${priceCalculation.total}*

💳 *PAGAMENTO:*
Caparra (30%): €${priceCalculation.deposit}
Saldo arrivo: €${priceCalculation.balance}
Cauzione (contanti): ${cauzioneText}

_Preventivo senza impegno - Valido 7 giorni_`;

    const whatsappUrl = `https://wa.me/393780038730?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Aggiorna il preventivo più recente nel database come "inviato"
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase
        .from('quote_requests')
        .update({
          whatsapp_sent: true
        })
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

    setTimeout(() => setIsSending(false), 1000);
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

  const handleRetry = () => {
    hasCalculated.current = false;
    hasSaved.current = false;
    setError(null);
    setLoading(true);

    const loadPriceCalculation = async () => {
      try {
        const result = await calculatePrice();
        setPriceCalculation(result);
        if (result && !hasSaved.current) {
          hasSaved.current = true;
          await saveQuoteToDatabase(result);
        }
      } catch (err) {
        setError('Non è possibile calcolare il preventivo. Riprova o contattaci direttamente.');
      } finally {
        setLoading(false);
      }
    };

    loadPriceCalculation();
  };

  const openWhatsAppDirect = () => {
    const message = `Salve, ho provato a calcolare un preventivo sul sito ma ho riscontrato un errore.

Vorrei un preventivo per:
📅 Check-in: ${formData.checkIn}
📅 Check-out: ${formData.checkOut}
👥 Adulti: ${formData.adults}
👶 Bambini: ${formData.children}
🏠 Appartamenti: ${formData.selectedApartments.join(', ')}

Grazie!`;

    window.open(`https://wa.me/393780038730?text=${encodeURIComponent(message)}`, '_blank');
  };

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
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Impossibile calcolare il preventivo</h3>
            <p className="text-muted-foreground mb-6">
              Si è verificato un problema tecnico. Puoi riprovare o contattarci direttamente su WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button onClick={handleRetry} className="gap-2">
                <Send className="h-4 w-4" />
                Riprova
              </Button>
              <Button variant="outline" onClick={openWhatsAppDirect} className="gap-2 text-green-600 border-green-600 hover:bg-green-50">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contattaci su WhatsApp
              </Button>
            </div>

            <Separator className="my-4" />

            <Button variant="ghost" onClick={onPrev} size="sm">
              ← Torna indietro e modifica i dati
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

            {formData.children > 0 && (() => {
              const withParentsCount = formData.childrenWithParents.filter(Boolean).length;
              const ownBedCount = formData.children - withParentsCount;
              return (
                <div className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-lg">
                  {ownBedCount > 0 && withParentsCount > 0 ? (
                    <span>{ownBedCount} con posto letto, {withParentsCount} con genitori</span>
                  ) : ownBedCount > 0 ? (
                    <span>Tutti con posto letto proprio</span>
                  ) : (
                    <span>Tutti con genitori/culla</span>
                  )}
                </div>
              );
            })()}
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
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Inclusi:</span>
              <Badge variant="secondary" className="font-normal">Utenze</Badge>
              <Badge variant="secondary" className="font-normal">Pulizia</Badge>
              <Badge variant="secondary" className="font-normal">Tassa di Soggiorno</Badge>
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
                    : 'Arrotondamento:'}
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
              
              <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-950/20 rounded">
                <span className="flex items-center gap-1">
                  <Banknote className="h-3 w-3" />
                  Cauzione (contanti):
                </span>
                <span className="font-semibold">
                  €{formData.selectedApartments.length * 200}.00
                  {formData.selectedApartments.length > 1 && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      (€200 × {formData.selectedApartments.length})
                    </span>
                  )}
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
        <Button
          onClick={sendWhatsApp}
          size="lg"
          className="min-w-[200px]"
          disabled={!canSend()}
        >
          <Send className="h-4 w-4 mr-2" />
          {isSending ? 'Invio...' : 'Invia su WhatsApp'}
        </Button>
      </div>
    </div>
  );
};