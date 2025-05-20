
import React, { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { format, differenceInDays } from "date-fns";
import { it } from 'date-fns/locale';
import { Calendar as CalendarIcon } from "lucide-react";
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
import { InfoIcon } from "lucide-react";

interface DateSelectionStepProps {
  form: UseFormReturn<FormValues>;
  prevStep: () => void;
  nextStep: () => void;
}

const DateSelectionStep: React.FC<DateSelectionStepProps> = ({ form, prevStep, nextStep }) => {
  const checkIn = form.watch("checkIn");
  const checkOut = form.watch("checkOut");
  
  // Combina le date di check-in e check-out in un range
  const date: DateRange | undefined = checkIn && checkOut
    ? {
        from: checkIn,
        to: checkOut,
      }
    : undefined;
  
  // Calcola il numero di notti
  const numberOfNights = useMemo(() => {
    if (checkIn && checkOut) {
      return differenceInDays(checkOut, checkIn);
    }
    return 0;
  }, [checkIn, checkOut]);
  
  // Funzione per gestire la selezione del range di date
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
  };

  // Funzione per verificare se un giorno è disabilitato (solo sabato, domenica e lunedì sono selezionabili)
  const disabledDays = (date: Date) => {
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
        {/* Pulsante per selezionare le date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Seleziona le date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="range"
              selected={date}
              onSelect={handleDateRangeSelect}
              disabled={disabledDays}
              numberOfMonths={1}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Avviso informativo per le date disponibili */}
        <Alert>
          <InfoIcon className="h-4 w-4 mr-2" />
          <AlertDescription>
            Per garantire un'esperienza ottimale, accettiamo prenotazioni con arrivi e partenze solo di sabato, domenica o lunedì.
          </AlertDescription>
        </Alert>

        {/* Riepilogo date selezionate e conteggio notti */}
        {checkIn && checkOut && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="font-semibold mb-2">Riepilogo del soggiorno</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground text-sm">Check-in</p>
                <p className="font-medium">
                  {format(checkIn, "EEEE d MMMM yyyy", { locale: it })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Check-out</p>
                <p className="font-medium">
                  {format(checkOut, "EEEE d MMMM yyyy", { locale: it })}
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
          disabled={!checkIn || !checkOut}
        >
          Avanti
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DateSelectionStep;
