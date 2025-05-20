
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormValues } from "@/utils/quoteFormSchema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StaySummary from "./StaySummary";
import { useDateSelection } from "@/hooks/quote/useDateSelection";

interface DateSelectionStepProps {
  form: UseFormReturn<FormValues>;
  prevStep: () => void;
  nextStep: () => void;
}

const DateSelectionStep: React.FC<DateSelectionStepProps> = ({ form, prevStep, nextStep }) => {
  // Use the custom hook for date selection logic
  const { 
    dateRange, 
    numberOfNights, 
    isDateDisabled, 
    handleDateChange 
  } = useDateSelection(form);
  
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
          <StaySummary 
            dateRange={dateRange} 
            numberOfNights={numberOfNights} 
          />
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
