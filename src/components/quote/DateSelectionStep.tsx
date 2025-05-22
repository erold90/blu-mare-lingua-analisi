
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
    <Card className="max-w-4xl mx-auto shadow-lg border">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-serif text-primary">Selezione date</CardTitle>
        <CardDescription>Indica le date di check-in e check-out del tuo soggiorno</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Information alert with more spacing */}
        <Alert className="bg-muted/50 py-3 border border-primary/20">
          <InfoIcon className="h-5 w-5 mr-2 text-primary" />
          <AlertDescription className="text-sm">
            Check-in/out disponibili solo sabato, domenica e lunedì. Soggiorno minimo di 5 notti, massimo 28 notti.
          </AlertDescription>
        </Alert>
        
        <div className="grid md:grid-cols-12 gap-6">
          {/* Calendar - larger */}
          <div className="md:col-span-7 flex justify-center">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={new Date()}
              selected={dateRange}
              onSelect={handleDateChange}
              disabled={isDateDisabled}
              numberOfMonths={1}
              fixedWeeks={true}
              className="border rounded-lg p-3 bg-background shadow-sm w-full"
            />
          </div>

          {/* Stay summary */}
          <div className="md:col-span-5">
            {dateRange?.from && dateRange?.to ? (
              <StaySummary 
                dateRange={dateRange} 
                numberOfNights={numberOfNights} 
              />
            ) : (
              <Card className="h-full flex items-center justify-center border shadow-sm bg-secondary/20">
                <CardContent className="text-center p-6">
                  <p className="font-medium text-primary text-lg mb-2">Seleziona le date</p>
                  <p className="text-sm text-muted-foreground">Scegli prima la data di arrivo, poi quella di partenza</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3 pb-3">
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
