
import React, { useState } from "react";
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
  // State for the date range with direct initialization from form values
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const checkIn = form.getValues("checkIn");
    const checkOut = form.getValues("checkOut");
    
    if (checkIn && checkOut) {
      return {
        from: new Date(checkIn),
        to: new Date(checkOut)
      };
    }
    
    return undefined;
  });
  
  // Calculate number of nights
  const numberOfNights = dateRange?.from && dateRange?.to
    ? differenceInDays(dateRange.to, dateRange.from)
    : 0;
  
  // Function to check if a date is disabled (not Sat, Sun, or Mon)
  const isDateDisabled = (date: Date): boolean => {
    const day = date.getDay(); 
    // 0 = Sunday, 1 = Monday, 6 = Saturday
    return day !== 0 && day !== 1 && day !== 6;
  };
  
  // Handle date range selection
  const handleDateChange = (range: DateRange | undefined) => {
    if (!range) {
      form.setValue("checkIn", undefined as any);
      form.setValue("checkOut", undefined as any);
      setDateRange(undefined);
      return;
    }
    
    // Update the date range state
    setDateRange(range);
    
    // Update form values
    if (range.from) {
      form.setValue("checkIn", range.from);
    }
    
    if (range.to) {
      form.setValue("checkOut", range.to);
    }
    
    // Trigger validation
    form.trigger(["checkIn", "checkOut"]);
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
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange?.from && "text-muted-foreground"
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
          <PopoverContent align="center" className="w-auto p-0">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={new Date()}
              selected={dateRange}
              onSelect={handleDateChange}
              disabled={isDateDisabled}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>

        {/* Information alert */}
        <Alert className="bg-muted/50">
          <InfoIcon className="h-4 w-4 mr-2" />
          <AlertDescription>
            Per garantire un'esperienza ottimale, accettiamo prenotazioni con arrivi e partenze solo di sabato, domenica o lunedì.
          </AlertDescription>
        </Alert>

        {/* Stay summary */}
        {dateRange?.from && dateRange?.to && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="font-semibold mb-2">Riepilogo del soggiorno</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground text-sm">Check-in</p>
                <p className="font-medium">
                  {format(dateRange.from, "EEEE d MMMM yyyy", { locale: it })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Check-out</p>
                <p className="font-medium">
                  {format(dateRange.to, "EEEE d MMMM yyyy", { locale: it })}
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
          disabled={!dateRange?.from || !dateRange?.to}
        >
          Avanti
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DateSelectionStep;
