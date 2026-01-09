import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarIcon, AlertCircle, CheckCircle2, Ban } from 'lucide-react';
import { QuoteFormData } from '@/hooks/useMultiStepQuote';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface StepDatesProps {
  formData: QuoteFormData;
  updateFormData: (data: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  getNights: () => number;
  isValidDay: (date: Date) => boolean;
  getDateBlockInfo: (date: Date) => { isBlocked: boolean; reason: string };
  requiresTwoWeeksMinimum: (checkIn: string, checkOut: string) => { required: boolean; message: string };
}

export const StepDates: React.FC<StepDatesProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  getNights,
  isValidDay,
  getDateBlockInfo,
  requiresTwoWeeksMinimum
}) => {

  // Verifica requisito minimo 2 settimane per Ferragosto
  const ferragostoCheck = requiresTwoWeeksMinimum(formData.checkIn, formData.checkOut);

  const canProceed = () => {
    return formData.checkIn && formData.checkOut && getNights() >= 5 && getNights() <= 28 && !ferragostoCheck.required;
  };

  const nights = getNights();
  const checkInDate = formData.checkIn ? new Date(formData.checkIn) : undefined;
  const checkOutDate = formData.checkOut ? new Date(formData.checkOut) : undefined;

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
                {nights >= 5 && nights <= 28 && !ferragostoCheck.required && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Durata valida</span>
                  </div>
                )}
                {ferragostoCheck.required && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm text-left">{ferragostoCheck.message}</span>
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
      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pb-4 sm:pb-0">
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