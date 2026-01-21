import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarIcon, AlertCircle, CheckCircle2, Ban } from 'lucide-react';
import { QuoteFormData } from '@/hooks/useMultiStepQuote';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// Calcola il mese iniziale del calendario in base alla stagione
// - Giugno-Ottobre (stagione): mostra il mese corrente
// - Novembre-Maggio (fuori stagione): mostra Giugno (anno prossimo se dopo Ottobre)
const getDefaultCalendarMonth = (checkInDate?: string): Date => {
  // Se c'è già una data selezionata, mostra quel mese
  if (checkInDate) {
    return new Date(checkInDate);
  }

  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();

  // Mesi della stagione: Giugno (5) - Ottobre (9)
  const JUNE = 5;
  const OCTOBER = 9;

  if (currentMonth >= JUNE && currentMonth <= OCTOBER) {
    // Siamo in stagione: mostra il mese corrente
    return today;
  } else if (currentMonth > OCTOBER) {
    // Novembre-Dicembre: mostra Giugno dell'anno prossimo
    return new Date(currentYear + 1, JUNE, 1);
  } else {
    // Gennaio-Maggio: mostra Giugno dell'anno corrente
    return new Date(currentYear, JUNE, 1);
  }
};

interface StepDatesProps {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  getNights: () => number;
  isValidDay: (date: Date) => boolean;
  getDateBlockInfo: (date: Date) => { isBlocked: boolean; reason: string };
}

export const StepDates: React.FC<StepDatesProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  getNights,
  isValidDay,
  getDateBlockInfo
}) => {
  // State per mostrare avviso Ferragosto quando l'utente clicca sul 15 agosto
  const [showFerragostoWarning, setShowFerragostoWarning] = useState(false);

  // Ref per il pulsante di navigazione (per scroll automatico su mobile)
  const navigationRef = useRef<HTMLDivElement>(null);

  // Scroll automatico al pulsante "Continua" su mobile quando entrambe le date sono selezionate
  useEffect(() => {
    if (formData.checkIn && formData.checkOut && navigationRef.current) {
      // Solo su mobile (< 768px)
      if (window.innerWidth < 768) {
        // Piccolo delay per permettere al DOM di aggiornarsi
        setTimeout(() => {
          navigationRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 300);
      }
    }
  }, [formData.checkIn, formData.checkOut]);

  // Calcola il mese iniziale del calendario
  // Se ci sono date selezionate, mostra quel mese; altrimenti usa la logica stagionale
  const defaultMonth = useMemo(() => {
    return getDefaultCalendarMonth(formData.checkIn);
  }, [formData.checkIn]);

  const canProceed = () => {
    return formData.checkIn && formData.checkOut && getNights() >= 5 && getNights() <= 28;
  };

  const nights = getNights();
  const checkInDate = formData.checkIn ? new Date(formData.checkIn) : undefined;
  const checkOutDate = formData.checkOut ? new Date(formData.checkOut) : undefined;

  // Verifica se una data è il 15 agosto e cade di sabato
  const isFerragostoSaturday = (date: Date) => {
    return date.getMonth() === 7 && date.getDate() === 15 && date.getDay() === 6;
  };

  // Funzione per disabilitare le date non valide
  const isDateDisabled = (date: Date) => {
    // Solo sabato, domenica, lunedì selezionabili
    if (!isValidDay(date)) return true;

    // Non permettere date passate (confronto solo data, senza ora)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    if (compareDate < today) return true;

    // NON blocchiamo qui il 15 agosto - lo gestiamo nel onSelect per mostrare l'avviso

    // Controllo se la data è bloccata
    const blockInfo = getDateBlockInfo(date);
    if (blockInfo.isBlocked) return true;

    return false;
  };

  // Custom day renderer with tooltip for blocked dates
  const customDayRenderer = (date: Date, displayMonth: Date) => {
    const blockInfo = getDateBlockInfo(date);
    const isDisabled = isDateDisabled(date);
    
    if (blockInfo.isBlocked) {
      return (
        <TooltipProvider key={date.toISOString()}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative w-full h-full flex items-center justify-center cursor-not-allowed">
                <span className="text-muted-foreground line-through">{date.getDate()}</span>
                <Ban className="absolute top-0 right-0 h-3 w-3 text-destructive" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{blockInfo.reason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return null; // Use default rendering for other dates
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6 sm:mb-8">
        <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Quando vuoi soggiornare?</h2>
        <p className="text-sm sm:text-base text-muted-foreground px-4">
          Seleziona le date di check-in e check-out
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto">
        {/* Selezione Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Seleziona date soggiorno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <div className="space-y-4">
                <Calendar
                  mode="range"
                  defaultMonth={defaultMonth}
                  selected={
                    formData.checkIn && formData.checkOut 
                      ? { from: new Date(formData.checkIn), to: new Date(formData.checkOut) }
                      : formData.checkIn 
                      ? { from: new Date(formData.checkIn), to: undefined }
                      : undefined
                  }
                  onSelect={(range) => {
                    if (!range?.from) return;

                    const formatDateToISO = (date: Date) => {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    };

                    // Controlla se l'utente ha selezionato il 15 agosto (sabato)
                    if (isFerragostoSaturday(range.from) || (range.to && isFerragostoSaturday(range.to))) {
                      setShowFerragostoWarning(true);
                      return; // Non selezionare la data
                    }

                    // Nascondi l'avviso se la selezione è valida
                    setShowFerragostoWarning(false);

                    const checkInISO = formatDateToISO(range.from);
                    const checkOutISO = range.to ? formatDateToISO(range.to) : '';

                    updateFormData({
                      checkIn: checkInISO,
                      checkOut: checkOutISO
                    });
                  }}
                  disabled={isDateDisabled}
                  locale={it}
                  className="rounded-md border pointer-events-auto"
                  showOutsideDays={false}
                  formatters={{
                    formatDay: (date) => {
                      const blockInfo = getDateBlockInfo(date);
                      if (blockInfo.isBlocked) {
                        return (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="relative w-full h-full flex items-center justify-center cursor-not-allowed text-muted-foreground">
                                <span className="line-through">{date.getDate()}</span>
                                <Ban className="absolute top-0 right-0 h-2 w-2 text-destructive" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">{blockInfo.reason}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      return <span>{date.getDate()}</span>;
                    }
                  }}
                />
              
               <div className="text-center space-y-2">
                 <p className="text-sm font-medium">
                   🗓️ Seleziona il periodo di soggiorno
                 </p>
                 {formData.checkIn && formData.checkOut && (
                   <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                     <p className="text-sm text-green-700">
                       ✅ Periodo selezionato: {format(new Date(formData.checkIn), 'dd MMM', { locale: it })} - {format(new Date(formData.checkOut), 'dd MMM yyyy', { locale: it })}
                     </p>
                   </div>
                 )}
                 <p className="text-xs text-muted-foreground">
                   Giorni disponibili: Sabato, Domenica, Lunedì
                 </p>
                 {/* Avviso Ferragosto - mostrato sotto il calendario */}
                 {showFerragostoWarning && (
                   <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                     <p className="text-sm text-amber-700">
                       ⚠️ Il 15 agosto non è disponibile come giorno di check-in o check-out.
                     </p>
                   </div>
                 )}
                </div>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Riepilogo */}
        <Card>
          <CardHeader>
            <CardTitle>Riepilogo soggiorno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Check-in */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-semibold">Check-in</div>
                <div className="text-sm text-muted-foreground">Arrivo</div>
              </div>
              <div className="text-right">
                {formData.checkIn ? (
                  <div>
                    <div className="font-semibold">
                      {format(new Date(formData.checkIn), 'dd MMM yyyy', { locale: it })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(formData.checkIn), 'EEEE', { locale: it })}
                    </div>
                  </div>
                ) : (
                  <Badge variant="outline">Non selezionato</Badge>
                )}
              </div>
            </div>

            {/* Check-out */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-semibold">Check-out</div>
                <div className="text-sm text-muted-foreground">Partenza</div>
              </div>
              <div className="text-right">
                {formData.checkOut ? (
                  <div>
                    <div className="font-semibold">
                      {format(new Date(formData.checkOut), 'dd MMM yyyy', { locale: it })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(formData.checkOut), 'EEEE', { locale: it })}
                    </div>
                  </div>
                ) : (
                  <Badge variant="outline">Non selezionato</Badge>
                )}
              </div>
            </div>

            {/* Durata */}
            {formData.checkIn && formData.checkOut && (
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-3xl font-bold text-primary">{nights}</div>
                <div className="text-sm text-muted-foreground">
                  notti di soggiorno
                </div>
                {nights < 5 && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Minimo 5 notti richieste</span>
                  </div>
                )}
                {nights > 28 && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Massimo 28 notti consentite</span>
                  </div>
                )}
                {nights >= 5 && nights <= 28 && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Durata valida</span>
                  </div>
                )}
              </div>
            )}

            {/* Istruzioni */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Solo check-in/out: Sabato, Domenica, Lunedì</p>
              <p>• Soggiorno minimo: 5 notti</p>
              <p>• Soggiorno massimo: 28 notti</p>
              <p>• Check-in: dalle 14:00 alle 17:00</p>
              <p>• Check-out: ore 10:00</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation - Mobile optimized */}
      <div ref={navigationRef} className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pb-4 sm:pb-0">
        <Button
          variant="outline"
          onClick={onPrev}
          size="lg"
          className="w-full sm:w-auto h-12 sm:h-11 text-base touch-manipulation order-2 sm:order-1"
        >
          Indietro
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed()}
          size="lg"
          className="w-full sm:w-auto sm:min-w-[200px] h-12 sm:h-11 text-base touch-manipulation order-1 sm:order-2"
        >
          Continua
        </Button>
      </div>
    </div>
  );
};