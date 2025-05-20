
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { format, differenceInDays } from "date-fns";
import { it } from 'date-fns/locale';
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormValues } from "@/utils/quoteFormSchema";
import { DateRange } from "react-day-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

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
    
    // If only the start date is selected, update that
    if (range.from && !range.to) {
      setDateRange({ from: range.from, to: undefined });
      form.setValue("checkIn", range.from);
      return;
    }
    
    // If both dates are selected, check for min/max night constraints
    if (range.from && range.to) {
      const nights = differenceInDays(range.to, range.from);
      
      // Enforce minimum 5 nights
      if (nights < 5) {
        toast("Il soggiorno minimo è di 5 notti");
        return;
      }
      
      // Enforce maximum 28 nights
      if (nights > 28) {
        toast("Il soggiorno massimo è di 28 notti");
        return;
      }
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
        {/* Information alert */}
        <Alert className="bg-muted/50 py-2">
          <InfoIcon className="h-4 w-4 mr-2" />
          <AlertDescription className="text-xs">
            Check-in/out disponibili solo sabato, domenica e lunedì. Soggiorno minimo di 5 notti, massimo 28 notti.
          </AlertDescription>
        </Alert>
        
        {/* Calendar displayed directly on the page */}
        <div className="flex justify-center">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={new Date()}
            selected={dateRange}
            onSelect={handleDateChange}
            disabled={isDateDisabled}
            numberOfMonths={1}
            fixedWeeks={true}
            className="border rounded-lg p-2 bg-background shadow-sm"
          />
        </div>

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
          disabled={!dateRange?.from || !dateRange?.to || numberOfNights < 5 || numberOfNights > 28}
        >
          Avanti
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DateSelectionStep;
