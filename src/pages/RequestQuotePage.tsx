import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useMultiStepQuote } from '@/hooks/useMultiStepQuote';
import { StepGuests } from '@/components/quote/StepGuests';
import { StepDates } from '@/components/quote/StepDates';
import { StepApartments } from '@/components/quote/StepApartments';
import { StepPets } from '@/components/quote/StepPets';
import { StepLinen } from '@/components/quote/StepLinen';
import { StepSummary } from '@/components/quote/StepSummary';
import { StepWhatsApp } from '@/components/quote/StepWhatsApp';
import SEOHead from '@/components/seo/SEOHead';

export default function RequestQuotePage() {
  const {
    currentStep,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    getBedsNeeded,
    getNights,
    isApartmentAvailable,
    isValidDay,
    calculatePrice,
    prenotazioni
  } = useMultiStepQuote();

  const steps = [
    'Ospiti', 
    'Date', 
    'Appartamenti', 
    'Animali', 
    'Biancheria', 
    'Riepilogo', 
    'Invio'
  ];

  const getSelectedApartment = () => {
    return apartments.find(apt => apt.id === formData.apartment_ids[0]);
  };

  const calculateEstimatedPrice = async () => {
    const apartment = getSelectedApartment();
    if (!formData.start_date || !formData.end_date || !apartment) {
      setEstimatedPrice(0);
      return;
    }
    
    try {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      const dynamicPrice = await calculatePriceForStay(apartment.id, startDate, endDate);
      const cleaningFee = apartment.cleaningFee || 0;
      const linenFee = formData.linen_option === 'extra' ? 20 : 0;
      
      const totalPrice = dynamicPrice + cleaningFee + linenFee;
      setEstimatedPrice(totalPrice);
    } catch (error) {
      console.error('Error calculating price:', error);
      // Fallback to static pricing
      const nights = calculateNights();
      const basePrice = apartment.price * nights;
      const cleaningFee = apartment.cleaningFee || 0;
      const linenFee = formData.linen_option === 'extra' ? 20 : 0;
      const totalPrice = basePrice + cleaningFee + linenFee;
      setEstimatedPrice(totalPrice);
    }
  };

  // Check apartment availability when dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (formData.start_date && formData.end_date) {
        const checkIn = new Date(formData.start_date);
        const checkOut = new Date(formData.end_date);
        
        const availabilityChecks = await Promise.all(
          apartments.map(async apartment => {
            const isAvailable = await checkAvailabilityForDateRange(apartment.id, checkIn, checkOut);
            return isAvailable ? apartment : null;
          })
        );
        
        const available = availabilityChecks.filter(apt => apt !== null);
        setAvailableApartments(available);
        
        // Reset apartment selection if currently selected apartment is not available
        if (formData.apartment_ids.length > 0 && 
            !available.some(apt => apt.id === formData.apartment_ids[0])) {
          setFormData(prev => ({ ...prev, apartment_ids: [] }));
        }
      } else {
        setAvailableApartments([]);
      }
    };

    checkAvailability();
  }, [formData.start_date, formData.end_date, checkAvailabilityForDateRange]);

  // Recalculate price when relevant data changes
  useEffect(() => {
    calculateEstimatedPrice();
  }, [formData.start_date, formData.end_date, formData.apartment_ids, formData.linen_option]);

  const canProceedToStep = (step: number) => {
    switch(step) {
      case 2:
        return formData.start_date && formData.end_date && calculateNights() > 0;
      case 3:
        return formData.apartment_ids.length > 0;
      case 4:
        return formData.guest_name && formData.email && formData.privacy_accepted;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (canProceedToStep(currentStep + 1)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Completa tutti i campi richiesti per continuare');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const sendWhatsAppMessage = () => {
    const apartment = getSelectedApartment();
    const nights = calculateNights();
    const price = estimatedPrice;
    
    const message = `🏖️ *RICHIESTA PREVENTIVO VILLA MAREBLU*
    
👤 *Nome:* ${formData.guest_name}
📧 *Email:* ${formData.email}
📱 *Telefono:* ${formData.phone || 'Non fornito'}

📅 *Periodo:* ${formData.start_date} - ${formData.end_date} (${nights} notti)
🏠 *Appartamento:* ${apartment?.name}
👥 *Ospiti:* ${formData.adults} adulti${formData.children > 0 ? `, ${formData.children} bambini` : ''}
${formData.cribs > 0 ? `🍼 *Lettini:* ${formData.cribs}` : ''}
${formData.has_pets ? '🐾 *Con animali domestici*' : ''}

💰 *Prezzo stimato:* €${price}

${formData.notes ? `📝 *Note:* ${formData.notes}` : ''}

_Preventivo automatico da villamareblu.it_`;

    const whatsappUrl = `https://wa.me/393333333333?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.privacy_accepted) {
      toast.error('Devi accettare la privacy policy per continuare');
      return;
    }

    if (!formData.guest_name || !formData.email || !formData.start_date || !formData.end_date || formData.apartment_ids.length === 0) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalPrice = estimatedPrice;
      
      const reservationData = {
        id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        guest_name: formData.guest_name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        apartment_ids: formData.apartment_ids,
        adults: formData.adults,
        children: formData.children,
        cribs: formData.cribs,
        has_pets: formData.has_pets,
        linen_option: formData.linen_option,
        final_price: finalPrice,
        deposit_amount: 0,
        payment_status: 'notPaid',
        payment_method: '',
        notes: `Preventivo richiesto via web. Email: ${formData.email}, Tel: ${formData.phone || 'non fornito'}. Note: ${formData.notes || 'nessuna'}`
      };

      const result = await addReservation(reservationData);

      if (result.error) {
        toast.error('Errore nell\'invio del preventivo: ' + result.error);
      } else {
        toast.success('Preventivo salvato! Ora puoi inviarlo su WhatsApp.');
        // Auto-send WhatsApp message
        sendWhatsAppMessage();
        setSubmitted(true);
      }
    } catch (error) {
      toast.error('Errore nell\'invio del preventivo');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto py-8">
        <SEOHead
          title="Preventivo Inviato - Villa MareBlu Puglia"
          description="Preventivo inviato con successo. Ti contatteremo presto per la tua vacanza in Salento."
        />
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h1 className="text-2xl font-bold mb-4">Preventivo Inviato su WhatsApp!</h1>
            <p className="text-muted-foreground mb-6">
              Il tuo preventivo è stato inviato automaticamente su WhatsApp. Ti risponderemo il prima possibile per confermare la disponibilità e tutti i dettagli.
            </p>
            <div className="space-y-3">
              <Button onClick={sendWhatsAppMessage} className="mr-4">
                Invia di Nuovo su WhatsApp
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Torna alla Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Quando vuoi soggiornare?</h2>
              <p className="text-muted-foreground">Seleziona le date per verificare la disponibilità</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <div>
                <Label htmlFor="start_date">Data Check-in *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">Data Check-out *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {formData.start_date && formData.end_date && (
              <div className="text-center">
                <Badge variant="outline" className="text-lg py-2 px-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  {calculateNights()} notti
                </Badge>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Scegli il tuo appartamento</h2>
              <p className="text-muted-foreground">
                Appartamenti disponibili dal {formData.start_date} al {formData.end_date}
              </p>
            </div>

            {availableApartments.length === 0 ? (
              <div className="text-center py-8">
                <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nessun appartamento disponibile</h3>
                <p className="text-muted-foreground">
                  Purtroppo non ci sono appartamenti disponibili per le date selezionate. 
                  Prova con date diverse.
                </p>
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="mt-4">
                  Cambia Date
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {availableApartments.map(apartment => (
                  <Card 
                    key={apartment.id} 
                    className={`cursor-pointer transition-all ${
                      formData.apartment_ids.includes(apartment.id) 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, apartment_ids: [apartment.id] }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{apartment.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{apartment.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline">
                              <Users className="h-3 w-3 mr-1" />
                              {apartment.capacity} ospiti
                            </Badge>
                            <Badge variant="outline">
                              {apartment.bedrooms} camera{apartment.bedrooms > 1 ? 'e' : 'a'}
                            </Badge>
                            {apartment.hasVeranda && <Badge variant="outline">Veranda</Badge>}
                            {apartment.hasTerrace && <Badge variant="outline">Terrazza</Badge>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">€{apartment.price}</div>
                          <div className="text-sm text-muted-foreground">per notte</div>
                          {formData.apartment_ids.includes(apartment.id) && (
                            <Check className="h-6 w-6 text-primary mx-auto mt-2" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Dettagli del soggiorno</h2>
              <p className="text-muted-foreground">Quanti ospiti e che servizi desideri?</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="adults">Adulti</Label>
                  <Input
                    id="adults"
                    type="number"
                    min="1"
                    max={getSelectedApartment()?.capacity || 8}
                    value={formData.adults}
                    onChange={(e) => setFormData(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="children">Bambini</Label>
                  <Input
                    id="children"
                    type="number"
                    min="0"
                    value={formData.children}
                    onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cribs">Lettini</Label>
                  <Input
                    id="cribs"
                    type="number"
                    min="0"
                    max="2"
                    value={formData.cribs}
                    onChange={(e) => setFormData(prev => ({ ...prev, cribs: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_pets"
                    checked={formData.has_pets}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_pets: !!checked }))}
                  />
                  <Label htmlFor="has_pets">Viaggio con animali domestici</Label>
                </div>

                <div>
                  <Label htmlFor="linen_option">Biancheria</Label>
                  <Select 
                    value={formData.linen_option} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, linen_option: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">Non necessaria</SelectItem>
                      <SelectItem value="yes">Inclusa nel prezzo</SelectItem>
                      <SelectItem value="extra">A pagamento (+€20)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Note o richieste speciali</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Es: piano terra preferito, check-in tardivo, ecc..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">I tuoi dati</h2>
              <p className="text-muted-foreground">Ultimi dettagli per inviarti il preventivo</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <Label htmlFor="guest_name">Nome Completo *</Label>
                <Input
                  id="guest_name"
                  value={formData.guest_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, guest_name: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="la-tua-email@esempio.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+39 XXX XXX XXXX"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="privacy"
                  checked={formData.privacy_accepted}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, privacy_accepted: !!checked }))}
                />
                <Label htmlFor="privacy" className="text-sm">
                  Accetto la <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a> *
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <SEOHead
        title="Richiedi Preventivo - Villa MareBlu Puglia Salento"
        description="Richiedi un preventivo personalizzato per la tua vacanza negli appartamenti Vista Mare in Salento. Calcola il tuo soggiorno a Santa Maria di Leuca."
      />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Richiedi Preventivo</h1>
          <p className="text-muted-foreground">
            Configura il tuo soggiorno in pochi semplici passaggi
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm
                  ${currentStep >= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {step}
                </div>
                {step < 4 && (
                  <ChevronRight className={`h-4 w-4 mx-2 ${
                    currentStep > step ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {renderStepContent()}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Indietro
                  </Button>
                  
                  {currentStep < 4 ? (
                    <Button 
                      onClick={nextStep}
                      disabled={!canProceedToStep(currentStep + 1)}
                      className="flex items-center gap-2"
                    >
                      Avanti
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit}
                      disabled={!canProceedToStep(4) || isSubmitting}
                      className="flex items-center gap-2"
                    >
                      {isSubmitting ? 'Invio in corso...' : 'Invia su WhatsApp'}
                      <span className="text-lg">📱</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Riepilogo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.start_date && formData.end_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(formData.start_date).toLocaleDateString('it-IT')} - {' '}
                      {new Date(formData.end_date).toLocaleDateString('it-IT')}
                      <br />
                      <span className="font-medium">{calculateNights()} notti</span>
                    </span>
                  </div>
                )}
                
                {(formData.adults > 0 || formData.children > 0) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>
                      {formData.adults} adulti
                      {formData.children > 0 && `, ${formData.children} bambini`}
                      {formData.cribs > 0 && `, ${formData.cribs} lettini`}
                    </span>
                  </div>
                )}

                {getSelectedApartment() && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{getSelectedApartment()?.name}</span>
                  </div>
                )}

                {formData.has_pets && (
                  <div className="text-sm text-amber-600">
                    🐾 Con animali domestici
                  </div>
                )}

                {estimatedPrice > 0 && (
                  <div className="border-t pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Pernottamenti:</span>
                        <span>€{getSelectedApartment()?.price || 0} x {calculateNights()}</span>
                      </div>
                      {getSelectedApartment()?.cleaningFee && (
                        <div className="flex justify-between">
                          <span>Pulizia finale:</span>
                          <span>€{getSelectedApartment()?.cleaningFee}</span>
                        </div>
                      )}
                      {formData.linen_option === 'extra' && (
                        <div className="flex justify-between">
                          <span>Biancheria:</span>
                          <span>€20</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t mt-2 pt-2">
                      <div className="text-lg font-bold flex justify-between">
                        <span>Totale:</span>
                        <span>€{estimatedPrice}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      * Prezzo indicativo, soggetto a conferma
                    </div>
                  </div>
                )}

                {currentStep === 2 && availableApartments.length > 0 && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    ✅ {availableApartments.length} appartament{availableApartments.length === 1 ? 'o disponibile' : 'i disponibili'}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Il preventivo finale potrebbe variare in base alla disponibilità e alle condizioni specifiche del soggiorno.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}