
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { format, differenceInDays } from "date-fns";
import { it } from 'date-fns/locale';
import { Calendar as CalendarIcon, InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormValues } from "@/utils/quoteFormSchema";
import { DateRange } from "react-day-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DateSelectionStepProps {
  form: UseFormReturn<FormValues>;
  prevStep: () => void;
  nextStep: () => void;
}

const DateSelectionStep: React.FC<DateSelectionStepProps> = ({ form, prevStep, nextStep }) => {
  // Ottieni la data di check-in e check-out dal form
  const checkInDate = form.watch("checkIn");
  const checkOutDate = form.watch("checkOut");

  // Crea un oggetto DateRange per il calendario
  const dateRange = checkInDate && checkOutDate
    ? { from: new Date(checkInDate), to: new Date(checkOutDate) }
    : undefined;

  // Calcola il numero di notti
  const numberOfNights = checkInDate && checkOutDate
    ? differenceInDays(new Date(checkOutDate), new Date(checkInDate))
    : 0;

  // Gestisce la selezione delle date
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      form.setValue("checkIn", range.from);
    } else {
      form.setValue("checkIn", undefined as any);
    }

    if (range?.to) {
      form.setValue("checkOut", range.to);
    } else {
      form.setValue("checkOut", undefined as any);
    }

    // Trigger validation
    form.trigger(["checkIn", "checkOut"]);
  };

  // Funzione che disabilita tutti i giorni tranne sabato, domenica e lunedì
  const isDateDisabled = (date: Date) => {
    const day = date.getDay();
    // 0 = domenica, 1 = lunedì, 6 = sabato
    return day !== 0 && day !== 1 && day !== 6;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selezione date</CardTitle>
        <CardDescription>Indica le date di check-in e check-out del tuo soggiorno</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pulsante di selezione date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from && dateRange?.to ? (
                <span>
                  {format(dateRange.from, "dd/MM/yyyy", { locale: it })} - {format(dateRange.to, "dd/MM/yyyy", { locale: it })}
                </span>
              ) : (
                <span>Seleziona le date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="center">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={new Date()}
              selected={dateRange}
              onSelect={handleDateRangeSelect}
              disabled={isDateDisabled}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>

        {/* Avviso informativo */}
        <Alert>
          <InfoIcon className="h-4 w-4 mr-2" />
          <AlertDescription>
            Per garantire un'esperienza ottimale, accettiamo prenotazioni con arrivi e partenze solo di sabato, domenica o lunedì.
          </AlertDescription>
        </Alert>

        {/* Riepilogo date */}
        {checkInDate && checkOutDate && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="font-semibold mb-2">Riepilogo del soggiorno</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground text-sm">Check-in</p>
                <p className="font-medium">
                  {format(new Date(checkInDate), "EEEE d MMMM yyyy", { locale: it })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Check-out</p>
                <p className="font-medium">
                  {format(new Date(checkOutDate), "EEEE d MMMM yyyy", { locale: it })}
                </p>
              </div>
            </div>
            <div className="mt-3 border-t pt-2">
              <p className="font-medium">
                Durata del soggiorno: <span className="text-primary">{numberOfNights} notti</span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>Indietro</Button>
        <Button 
          type="button" 
          onClick={nextStep} 
          disabled={!checkInDate || !checkOutDate}
        >
          Avanti
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DateSelectionStep;
