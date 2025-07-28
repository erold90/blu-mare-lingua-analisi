import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, Euro } from 'lucide-react';
import { apartments } from '@/data/apartments';
import { useReservations } from '@/hooks/useReservations';
import { toast } from 'sonner';
import SEOHead from '@/components/seo/SEOHead';

export default function RequestQuotePage() {
  const { addReservation } = useReservations();
  
  const [formData, setFormData] = useState({
    guest_name: '',
    email: '',
    phone: '',
    start_date: '',
    end_date: '',
    apartment_ids: [] as string[],
    adults: 1,
    children: 0,
    cribs: 0,
    has_pets: false,
    linen_option: 'no',
    notes: '',
    privacy_accepted: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const calculateNights = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSelectedApartment = () => {
    return apartments.find(apt => apt.id === formData.apartment_ids[0]);
  };

  const calculateEstimatedPrice = () => {
    const nights = calculateNights();
    const apartment = getSelectedApartment();
    if (!nights || !apartment?.price) return 0;
    
    const basePrice = apartment.price * nights;
    const cleaningFee = apartment.cleaningFee || 0;
    return basePrice + cleaningFee;
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
      const estimatedPrice = calculateEstimatedPrice();
      
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
        final_price: estimatedPrice,
        deposit_amount: 0,
        payment_status: 'notPaid',
        payment_method: '',
        notes: `Preventivo richiesto via web. Email: ${formData.email}, Tel: ${formData.phone || 'non fornito'}. Note: ${formData.notes || 'nessuna'}`
      };

      const result = await addReservation(reservationData);

      if (result.error) {
        toast.error('Errore nell\'invio del preventivo: ' + result.error);
      } else {
        toast.success('Preventivo inviato con successo! Ti contatteremo presto.');
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
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-4">Preventivo Inviato!</h1>
            <p className="text-muted-foreground mb-6">
              Grazie per aver richiesto un preventivo. Ti contatteremo entro 24 ore per confermare la disponibilità e fornirti tutti i dettagli.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Torna alla Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Compila il modulo per ricevere un preventivo personalizzato per il tuo soggiorno
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Dati della Prenotazione</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Guest Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Data Check-in *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
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
                        required
                      />
                    </div>
                  </div>

                  {/* Apartment */}
                  <div>
                    <Label htmlFor="apartment">Appartamento *</Label>
                    <Select 
                      value={formData.apartment_ids[0] || ''} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, apartment_ids: [value] }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona l'appartamento che preferisci" />
                      </SelectTrigger>
                      <SelectContent>
                        {apartments.map(apt => (
                          <SelectItem key={apt.id} value={apt.id}>
                            {apt.name} - {apt.capacity} ospiti - €{apt.price}/notte
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Guests */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="adults">Adulti</Label>
                      <Input
                        id="adults"
                        type="number"
                        min="1"
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
                        value={formData.cribs}
                        onChange={(e) => setFormData(prev => ({ ...prev, cribs: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  {/* Additional Options */}
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
                          <SelectItem value="extra">A pagamento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Note Aggiuntive</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Richieste speciali, domande o note aggiuntive..."
                      rows={3}
                    />
                  </div>

                  {/* Privacy */}
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

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Invio in corso...' : 'Richiedi Preventivo'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
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
                    <span>{calculateNights()} notti</span>
                  </div>
                )}
                
                {formData.adults > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>
                      {formData.adults} adulti
                      {formData.children > 0 && `, ${formData.children} bambini`}
                    </span>
                  </div>
                )}

                {getSelectedApartment() && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{getSelectedApartment()?.name}</span>
                  </div>
                )}

                {calculateEstimatedPrice() > 0 && (
                  <div className="border-t pt-4">
                    <div className="text-lg font-bold">
                      Prezzo Stimato: €{calculateEstimatedPrice()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      * Prezzo indicativo, soggetto a conferma
                    </div>
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