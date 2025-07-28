import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
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
}

export const StepDates: React.FC<StepDatesProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
  getNights,
  isValidDay
}) => {
  const [selectingCheckIn, setSelectingCheckIn] = useState(true);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // Correggo il problema timezone usando toLocaleDateString formato ISO
    const formatDateToISO = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (selectingCheckIn) {
      updateFormData({ 
        checkIn: formatDateToISO(date),
        checkOut: '' // Reset checkout quando cambia checkin
      });
      setSelectingCheckIn(false);
    } else {
      updateFormData({ checkOut: formatDateToISO(date) });
    }
  };

  const canProceed = () => {
    return formData.checkIn && formData.checkOut && getNights() >= 5;
  };

  const nights = getNights();
  const checkInDate = formData.checkIn ? new Date(formData.checkIn) : undefined;
  const checkOutDate = formData.checkOut ? new Date(formData.checkOut) : undefined;

  // Funzione per disabilitare le date non valide
  const isDateDisabled = (date: Date) => {
    // Solo sabato, domenica, lunedì selezionabili
    if (!isValidDay(date)) return true;
    
    // Non permettere date passate
    if (date < new Date()) return true;
    
    // Se stiamo selezionando checkout, deve essere dopo checkin
    if (!selectingCheckIn && checkInDate && date <= checkInDate) return true;
    
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CalendarIcon className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Quando vuoi soggiornare?</h2>
        <p className="text-muted-foreground">
          Seleziona le date di check-in e check-out. Solo sabato, domenica e lunedì disponibili.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Selezione Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectingCheckIn ? 'Seleziona Check-in' : 'Seleziona Check-out'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={selectingCheckIn ? checkInDate : checkOutDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                locale={it}
                className="rounded-md border pointer-events-auto"
                showOutsideDays={false}
              />
              
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">
                  {selectingCheckIn 
                    ? "🗓️ Scegli la data di arrivo (check-in)" 
                    : "🗓️ Scegli la data di partenza (check-out)"
                  }
                </p>
                {formData.checkIn && selectingCheckIn === false && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">
                      ✅ Check-in: {format(new Date(formData.checkIn), 'dd MMM yyyy', { locale: it })}
                    </p>
                    <p className="text-xs text-green-600">Ora seleziona la data di check-out</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Giorni disponibili: Sabato, Domenica, Lunedì
                </p>
              </div>
            </div>
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
                {nights >= 5 && (
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
              <p>• Check-in: ore 16:00</p>
              <p>• Check-out: ore 10:00</p>
            </div>
          </CardContent>
        </Card>
      </div>

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