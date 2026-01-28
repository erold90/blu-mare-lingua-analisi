import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Home, Users, MapPin, Eye, AlertCircle, CheckCircle2, Euro, Images, Loader2, Lightbulb } from 'lucide-react';
import { QuoteFormData } from '@/hooks/useMultiStepQuote';
import { useDynamicQuote } from '@/hooks/useDynamicQuote';
import { PricingService, AvailabilityResult } from '@/services/supabase/dynamicPricingService';
import { ApartmentDetailsModal } from '@/components/apartments/ApartmentDetailsModal';
import { apartments as apartmentsData, Apartment } from '@/data/apartments';
import { useApartmentImages } from '@/hooks/apartments/useApartmentImages';

interface StepApartmentsProps {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  getBedsNeeded: () => number;
  isApartmentAvailable: (apartmentId: string, checkIn: string, checkOut: string) => Promise<boolean>;
  isApartmentAvailableDetailed: (apartmentId: string, checkIn: string, checkOut: string) => Promise<AvailabilityResult>;
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
    floor: "primo piano",
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

// Funzioni di mappatura ID
const toFullId = (shortId: string) => `appartamento-${shortId}`;
const toShortId = (fullId: string) => fullId.replace('appartamento-', '');

export default function StepApartments({ formData, updateFormData, onNext, onPrev, getBedsNeeded, isApartmentAvailable, isApartmentAvailableDetailed, prenotazioni }: StepApartmentsProps) {
  const [availabilityStatus, setAvailabilityStatus] = useState<Record<string, AvailabilityResult>>({});
  const [apartmentPrices, setApartmentPrices] = useState<Record<string, number>>({});
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(true); // Inizia in loading
  const [selectedApartmentForDetails, setSelectedApartmentForDetails] = useState<Apartment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const bedsNeeded = getBedsNeeded();
  const { getPriceForPeriod } = useDynamicQuote();
  const { apartmentImages } = useApartmentImages();

  // Refs per evitare chiamate duplicate
  const hasCheckedAvailability = useRef(false);
  const lastAvailabilityKey = useRef('');
  const availabilityKey = `${formData.checkIn}-${formData.checkOut}`;

  // Controlla la disponibilità dinamicamente per tutti gli appartamenti - IN PARALLELO
  useEffect(() => {
    if (!formData.checkIn || !formData.checkOut) {
      return;
    }

    // Se la chiave è cambiata, resetta il flag e lo stato
    if (lastAvailabilityKey.current !== availabilityKey) {
      hasCheckedAvailability.current = false;
      lastAvailabilityKey.current = availabilityKey;
      setIsCheckingAvailability(true); // Resetta loading quando cambiano le date
      setAvailabilityStatus({}); // Resetta lo stato
    }

    // Evita chiamate duplicate
    if (hasCheckedAvailability.current) return;
    hasCheckedAvailability.current = true;

    const checkAllAvailability = async () => {
      setIsCheckingAvailability(true);

      try {
        // Esegui TUTTI i controlli in PARALLELO con dettagli
        const availabilityPromises = apartments.map(async (apartment) => {
          try {
            const result = await isApartmentAvailableDetailed(apartment.id, formData.checkIn, formData.checkOut);
            return { id: apartment.id, result };
          } catch {
            return { id: apartment.id, result: { available: false, conflicts: [], suggestion: null } };
          }
        });

        const availabilityResults = await Promise.all(availabilityPromises);

        // Costruisci lo stato disponibilità con dettagli
        const newStatus: Record<string, AvailabilityResult> = {};
        availabilityResults.forEach(item => {
          newStatus[item.id] = item.result;
        });

        // Aggiorna subito lo stato disponibilità (ISTANTANEO)
        setAvailabilityStatus(newStatus);
        setIsCheckingAvailability(false);

        // Poi calcola i prezzi in background (non blocca la UI)
        const pricePromises = apartments
          .filter(apt => newStatus[apt.id]?.available) // Solo appartamenti disponibili
          .map(async (apartment) => {
            try {
              const price = await getPriceForPeriod(parseInt(apartment.id), formData.checkIn, formData.checkOut);
              if (price) {
                const checkIn = new Date(formData.checkIn);
                const checkOut = new Date(formData.checkOut);
                const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                const pricePerNight = Math.round(price / nights);
                const discountedPrice = Math.round(pricePerNight * 0.9);
                return { id: apartment.id, price: discountedPrice };
              }
            } catch {
              // Ignora errori prezzi
            }
            return null;
          });

        const priceResults = await Promise.all(pricePromises);
        const newPrices: Record<string, number> = {};
        priceResults.forEach(result => {
          if (result) newPrices[result.id] = result.price;
        });
        setApartmentPrices(newPrices);

      } catch {
        setIsCheckingAvailability(false);
      }
    };

    checkAllAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityKey]); // Solo availabilityKey come dipendenza
  
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

  // Apri modale dettagli appartamento
  const openApartmentDetails = (apartmentId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita di attivare il toggle della card
    const fullId = toFullId(apartmentId);
    const apartment = apartmentsData.find(apt => apt.id === fullId);
    if (apartment) {
      setSelectedApartmentForDetails(apartment);
      setIsModalOpen(true);
    }
  };

  // Gestisci selezione dalla modale
  const handleSelectFromModal = (fullApartmentId: string) => {
    const shortId = toShortId(fullApartmentId);
    // Verifica disponibilità prima di selezionare
    if (availabilityStatus[shortId] !== false) {
      const isAlreadySelected = formData.selectedApartments.includes(shortId);
      if (!isAlreadySelected) {
        updateFormData({ selectedApartments: [...formData.selectedApartments, shortId] });
      }
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 max-w-6xl mx-auto">
        {apartments.map(apartment => {
          // Stato: loading, disponibile, o non disponibile
          const aptStatus = availabilityStatus[apartment.id];
          const isLoading = isCheckingAvailability && aptStatus === undefined;
          const isAvailable = !isLoading && (aptStatus?.available ?? false); // Default FALSE durante loading
          const conflicts = aptStatus?.conflicts || [];
          const suggestion = aptStatus?.suggestion || null;

          // Helper per formattare date conflitto
          const formatConflictDates = () => {
            if (conflicts.length === 0) return null;
            const conflict = conflicts[0];
            const startDate = new Date(conflict.start_date);
            const endDate = new Date(conflict.end_date);
            const formatDate = (d: Date) => d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
            return `Occupato dal ${formatDate(startDate)} al ${formatDate(endDate)}`;
          };

          const isSelected = formData.selectedApartments.includes(apartment.id);
          const bookingInfo = getBookingInfo(apartment.id);

          return (
            <Card
              key={apartment.id}
              className={`relative transition-all duration-200 ${
                isLoading
                  ? 'opacity-70'
                  : !isAvailable
                    ? 'opacity-50 grayscale'
                    : isSelected
                      ? 'ring-2 ring-primary shadow-lg'
                      : 'hover:shadow-md cursor-pointer'
              }`}
              onClick={() => !isLoading && isAvailable && handleApartmentToggle(apartment.id)}
            >
              {/* === LAYOUT MOBILE (compatto orizzontale) === */}
              <div className="flex sm:hidden p-3 gap-3">
                {/* Thumbnail */}
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={apartment.image}
                    alt={apartment.name}
                    className="w-full h-full object-cover"
                  />
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                  {!isLoading && !isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                        PRENOTATO
                      </Badge>
                    </div>
                  )}
                  {!isLoading && isSelected && isAvailable && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : isAvailable ? (
                        <Checkbox
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-5 w-5"
                        />
                      ) : null}
                      <span className="font-semibold text-sm truncate">{apartment.name}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 ml-auto flex-shrink-0">
                        {apartment.capacity} posti letto
                      </Badge>
                    </div>

                    <div className="text-xs mb-2">
                      {isLoading ? (
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Verifica...
                        </span>
                      ) : isAvailable ? (
                        <div className="flex items-center justify-between">
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Disponibile
                          </span>
                          {apartmentPrices[apartment.id] && (
                            <span className="text-primary font-bold">
                              €{apartmentPrices[apartment.id]}/notte
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-destructive font-medium flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Non disponibile
                          </span>
                          {formatConflictDates() && (
                            <p className="text-xs text-destructive font-semibold pl-4">
                              {formatConflictDates()}
                            </p>
                          )}
                          {suggestion && (
                            <p className="text-[10px] text-amber-600 pl-4 flex items-start gap-1">
                              <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5" />
                              <span>{suggestion}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs w-full"
                    onClick={(e) => openApartmentDetails(apartment.id, e)}
                  >
                    <Images className="h-3 w-3 mr-1" />
                    Dettagli e foto
                  </Button>
                </div>
              </div>

              {/* === LAYOUT DESKTOP (originale) === */}
              <div className="hidden sm:block">
                {isLoading && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="font-bold">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Verifica...
                    </Badge>
                  </div>
                )}
                {!isLoading && !isAvailable && (
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
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : isAvailable ? (
                        <Checkbox
                          checked={isSelected}
                          onChange={() => {}}
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

                  {isLoading && (
                    <div className="flex items-center justify-center p-3 bg-muted/50 rounded-lg">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Verifica disponibilità...</span>
                    </div>
                  )}

                  {!isLoading && !isAvailable && (
                    <div className="p-3 bg-destructive/10 border-2 border-destructive/50 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-semibold">Non disponibile</span>
                      </div>
                      {formatConflictDates() && (
                        <p className="text-sm text-destructive font-semibold">
                          {formatConflictDates()}
                        </p>
                      )}
                      {suggestion && (
                        <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700">
                          <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span className="text-xs">{suggestion}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {!isLoading && isAvailable && (
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

                  {/* Bottone Vedi Dettagli */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={(e) => openApartmentDetails(apartment.id, e)}
                  >
                    <Images className="h-4 w-4 mr-2" />
                    Vedi dettagli e foto
                  </Button>
                </CardContent>
              </div>
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

      {/* Modale Dettagli Appartamento */}
      <ApartmentDetailsModal
        apartment={selectedApartmentForDetails}
        images={selectedApartmentForDetails ? apartmentImages[selectedApartmentForDetails.id] || ['/placeholder.svg'] : []}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApartmentForDetails(null);
        }}
        onSelect={handleSelectFromModal}
      />
    </div>
  );
};