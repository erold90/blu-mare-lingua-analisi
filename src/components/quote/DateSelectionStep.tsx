
import React, { useMemo } from "react";
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
  // Get current values from form
  const checkIn = form.watch("checkIn");
  const checkOut = form.watch("checkOut");
  
  // Create a date range object for the DayPicker component
  const dateRange = useMemo<DateRange | undefined>(() => {
    if (checkIn && checkOut) {
      return {
        from: new Date(checkIn),
        to: new Date(checkOut)
      };
    }
    return undefined;
  }, [checkIn, checkOut]);
  
  // Calculate number of nights based on selected dates
  const numberOfNights = useMemo(() => {
    if (checkIn && checkOut) {
      return differenceInDays(new Date(checkOut), new Date(checkIn));
    }
    return 0;
  }, [checkIn, checkOut]);
  
  // Handle date range selection from calendar
  const handleDateRangeSelect = (selectedRange: DateRange | undefined) => {
    if (selectedRange?.from) {
      form.setValue("checkIn", selectedRange.from);
    } else {
      form.setValue("checkIn", undefined as any);
    }
    
    if (selectedRange?.to) {
      form.setValue("checkOut", selectedRange.to);
    } else {
      form.setValue("checkOut", undefined as any);
    }
    
    // Trigger form validation
    form.trigger(["checkIn", "checkOut"]);
  };

  // Filter function for selectable days (only Saturday, Sunday, Monday)
  const isDateDisabled = (date: Date) => {
    const day = date.getDay();
    // 0 = Sunday, 1 = Monday, 6 = Saturday
    return day !== 0 && day !== 1 && day !== 6;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selezione date</CardTitle>
        <CardDescription>Indica le date di check-in e check-out del tuo soggiorno</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date selection button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
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

        {/* Information alert - moved below date selection button as requested */}
        <Alert>
          <InfoIcon className="h-4 w-4 mr-2" />
          <AlertDescription>
            Per garantire un'esperienza ottimale, accettiamo prenotazioni con arrivi e partenze solo di sabato, domenica o lunedì.
          </AlertDescription>
        </Alert>

        {/* Date summary */}
        {checkIn && checkOut && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="font-semibold mb-2">Riepilogo del soggiorno</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground text-sm">Check-in</p>
                <p className="font-medium">
                  {format(new Date(checkIn), "EEEE d MMMM yyyy", { locale: it })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Check-out</p>
                <p className="font-medium">
                  {format(new Date(checkOut), "EEEE d MMMM yyyy", { locale: it })}
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
