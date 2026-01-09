import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Home, Users, MapPin, Eye, AlertCircle, CheckCircle2, Euro } from 'lucide-react';
import { QuoteFormData } from '@/hooks/useMultiStepQuote';
import { useDynamicQuote } from '@/hooks/useDynamicQuote';
import { PricingService } from '@/services/supabase/dynamicPricingService';

interface StepApartmentsProps {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  getBedsNeeded: () => number;
  isApartmentAvailable: (apartmentId: string, checkIn: string, checkOut: string) => Promise<boolean>;
  prenotazioni: any[];
}

const apartments = [
  {
    id: "1",
    name: "Appartamento 1",
    capacity: 6,
    floor: "piano terra",
    features: ["veranda"],
    description: "Due camere da letto con accesso privato",
    image: "/images/apartments/appartamento-1/image1.jpg"
  },
  {
    id: "2", 
    name: "Appartamento 2",
    capacity: 8,
    floor: "primo piano",
    features: ["terrazza vista mare"],
    description: "Tre camere da letto per un massimo di 8 ospiti",
    image: "/images/apartments/appartamento-2/image1.jpg"
  },
  {
    id: "3",
    name: "Appartamento 3", 
    capacity: 4,
    floor: "piano terra",
    features: ["terrazza vista mare"],
    description: "Una camera con letto matrimoniale e letto a castello",
    image: "/images/apartments/appartamento-3/image1.jpg"
  },
  {
    id: "4",
    name: "Appartamento 4",
    capacity: 5,
    floor: "primo piano", 
    features: ["veranda attrezzata"],
    description: "Due camere da letto con accesso indipendente",
    image: "/images/apartments/appartamento-4/image1.jpg"
  }
];

export default function StepApartments({ formData, updateFormData, onNext, onPrev, getBedsNeeded, isApartmentAvailable, prenotazioni }: StepApartmentsProps) {
  const [availabilityStatus, setAvailabilityStatus] = useState<Record<string, boolean>>({});
  const [apartmentPrices, setApartmentPrices] = useState<Record<string, number>>({});
  const bedsNeeded = getBedsNeeded();
  const { getPriceForPeriod } = useDynamicQuote();

  // Controlla la disponibilità dinamicamente per tutti gli appartamenti
  useEffect(() => {
    const checkAllAvailability = async () => {
      
      if (!formData.checkIn || !formData.checkOut) {
        return;
      }
      
      // Invalida la cache dei prezzi per ottenere dati aggiornati
      PricingService.invalidateCache();
      
      const newStatus: Record<string, boolean> = {};
      const newPrices: Record<string, number> = {};
      
      for (const apartment of apartments) {
        try {
          const available = await isApartmentAvailable(apartment.id, formData.checkIn, formData.checkOut);
          newStatus[apartment.id] = available;
          
          // Calcola il prezzo solo se l'appartamento è disponibile
          if (available) {
            const price = await getPriceForPeriod(parseInt(apartment.id), formData.checkIn, formData.checkOut);
            if (price) {
              // Calcola prezzo per notte
              const checkIn = new Date(formData.checkIn);
              const checkOut = new Date(formData.checkOut);
              const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
              const pricePerNight = Math.round(price / nights);
              // Applica sconto del 10% (per sconti finali e arrotondamenti)
              const discountedPrice = Math.round(pricePerNight * 0.9);
              newPrices[apartment.id] = discountedPrice;
            }
          }
        } catch (error) {
          newStatus[apartment.id] = false;
        }
      }
      
      setAvailabilityStatus(newStatus);
      setApartmentPrices(newPrices);
    };

    checkAllAvailability();
  }, [formData.checkIn, formData.checkOut, isApartmentAvailable, getPriceForPeriod]);
  
  const handleApartmentToggle = (apartmentId: string) => {
    const isSelected = formData.selectedApartments.includes(apartmentId);
    let newSelection;
    
    if (isSelected) {
      newSelection = formData.selectedApartments.filter(id => id !== apartmentId);
    } else {
      newSelection = [...formData.selectedApartments, apartmentId];
    }
    
    updateFormData({ selectedApartments: newSelection });
  };

  const getTotalCapacity = () => {
    return formData.selectedApartments.reduce((total, aptId) => {
      const apt = apartments.find(a => a.id === aptId);
      return total + (apt?.capacity || 0);
    }, 0);
  };

  const canProceed = () => {
    return formData.selectedApartments.length > 0 && getTotalCapacity() >= bedsNeeded;
  };

  const getBookingInfo = (apartmentId: string) => {
    return prenotazioni.find(p => 
      p.apt === apartmentId && 
      formData.checkIn && 
      formData.checkOut &&
      (new Date(formData.checkIn) < new Date(p.checkout) && 
       new Date(formData.checkOut) > new Date(p.checkin))
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Home className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Scegli i tuoi appartamenti</h2>
        <p className="text-muted-foreground">
          Periodo: {formData.checkIn} - {formData.checkOut}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Posti letto necessari: {bedsNeeded}
        </p>
      </div>

      {/* Summary */}
      <Card className="max-w-2xl mx-auto mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{getTotalCapacity()}</div>
              <div className="text-sm text-muted-foreground">Posti totali selezionati</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{bedsNeeded}</div>
              <div className="text-sm text-muted-foreground">Posti necessari</div>
            </div>
          </div>
          {getTotalCapacity() > 0 && (
            <div className="mt-3 text-center">
              <Badge 
                variant={getTotalCapacity() >= bedsNeeded ? "default" : "destructive"}
                className="text-sm"
              >
                {getTotalCapacity() >= bedsNeeded ? "✓ Capacità sufficiente" : "✗ Capacità insufficiente"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apartments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {apartments.map(apartment => {
          // Usa la disponibilità dinamica dal database
          const isAvailable = availabilityStatus[apartment.id] ?? true;
          
          const isSelected = formData.selectedApartments.includes(apartment.id);
          const bookingInfo = getBookingInfo(apartment.id);

          return (
            <Card 
              key={apartment.id}
              className={`relative transition-all duration-200 ${
                !isAvailable 
                  ? 'opacity-50 grayscale' 
                  : isSelected 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:shadow-md cursor-pointer'
              }`}
              onClick={() => isAvailable && handleApartmentToggle(apartment.id)}
            >
              {!isAvailable && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="destructive" className="font-bold">
                    PRENOTATO
                  </Badge>
                </div>
              )}

              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img 
                  src={apartment.image}
                  alt={apartment.name}
                  className="w-full h-full object-cover"
                />
                {isSelected && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Selezionato
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isAvailable ? (
                      <Checkbox 
                        checked={isSelected}
                        onChange={() => {}} // Controlled by card click
                      />
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                    {apartment.name}
                  </div>
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {apartment.capacity} posti
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-muted-foreground">{apartment.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    <MapPin className="h-3 w-3 mr-1" />
                    {apartment.floor}
                  </Badge>
                  {apartment.features.map(feature => (
                    <Badge key={feature} variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      {feature}
                    </Badge>
                  ))}
                </div>

                {!isAvailable && bookingInfo && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-semibold">Non disponibile</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dal {bookingInfo.checkin} al {bookingInfo.checkout}
                    </p>
                  </div>
                )}

                {isAvailable && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Disponibile</span>
                    </div>
                    {apartmentPrices[apartment.id] && (
                      <div className="flex items-center gap-1 text-primary font-semibold">
                        <Euro className="h-4 w-4" />
                        <span>{apartmentPrices[apartment.id]}/notte</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Validation */}
      {formData.selectedApartments.length > 0 && getTotalCapacity() < bedsNeeded && (
        <Card className="max-w-2xl mx-auto border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Capacità insufficiente</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Gli appartamenti selezionati hanno {getTotalCapacity()} posti letto, 
              ma ne servono {bedsNeeded}. Seleziona appartamenti aggiuntivi.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onPrev} size="lg">
          Indietro
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed()}
          size="lg"
          className="min-w-[200px]"
        >
          Continua
        </Button>
      </div>
    </div>
  );
};