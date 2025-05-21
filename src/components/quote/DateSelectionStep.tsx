
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
    <Card className="max-w-5xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl md:text-2xl">Selezione date</CardTitle>
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
        
        <div className="grid md:grid-cols-5 gap-6">
          {/* Calendar displayed larger on desktop */}
          <div className="md:col-span-3 flex justify-center">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={new Date()}
              selected={dateRange}
              onSelect={handleDateChange}
              disabled={isDateDisabled}
              numberOfMonths={1}
              fixedWeeks={true}
              className="border rounded-lg p-4 bg-background shadow-sm w-full max-w-md md:max-w-full scale-100 md:scale-110 origin-top"
            />
          </div>

          {/* Stay summary */}
          <div className="md:col-span-2">
            {dateRange?.from && dateRange?.to ? (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Riepilogo del soggiorno</h3>
                  <StaySummary 
                    dateRange={dateRange} 
                    numberOfNights={numberOfNights} 
                  />
                  
                  {numberOfNights > 0 && (
                    <div className="mt-6 p-4 bg-white rounded-lg border shadow-sm">
                      <h4 className="font-medium text-sm">Informazioni importanti:</h4>
                      <ul className="text-xs mt-2 space-y-1 text-muted-foreground">
                        <li>• Check-in: dalle 15:00 alle 19:00</li>
                        <li>• Check-out: entro le 10:00</li>
                        {numberOfNights < 5 && (
                          <li className="text-destructive font-medium">• Il soggiorno minimo è di 5 notti</li>
                        )}
                        {numberOfNights > 28 && (
                          <li className="text-destructive font-medium">• Il soggiorno massimo è di 28 notti</li>
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center">
                <div className="text-muted-foreground">
                  <p className="font-medium mb-2">Seleziona le date</p>
                  <p className="text-sm">Scegli prima la data di arrivo, poi quella di partenza</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
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
