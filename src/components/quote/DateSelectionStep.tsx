
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
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Selezione date</CardTitle>
        <CardDescription>Indica le date di check-in e check-out del tuo soggiorno</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Information alert - more compact */}
        <Alert className="bg-muted/50 py-1.5">
          <InfoIcon className="h-4 w-4 mr-2" />
          <AlertDescription className="text-xs">
            Check-in/out disponibili solo sabato, domenica e lunedì. Soggiorno minimo di 5 notti, massimo 28 notti.
          </AlertDescription>
        </Alert>
        
        <div className="grid md:grid-cols-12 gap-4">
          {/* Calendar - larger */}
          <div className="md:col-span-8 flex justify-center">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={new Date()}
              selected={dateRange}
              onSelect={handleDateChange}
              disabled={isDateDisabled}
              numberOfMonths={1}
              fixedWeeks={true}
              className="border rounded-lg p-2 bg-background shadow-sm w-full scale-110 transform origin-top"
            />
          </div>

          {/* Stay summary */}
          <div className="md:col-span-4">
            {dateRange?.from && dateRange?.to ? (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-3">
                  <h3 className="text-base font-semibold mb-2">Riepilogo del soggiorno</h3>
                  <StaySummary 
                    dateRange={dateRange} 
                    numberOfNights={numberOfNights} 
                  />
                  
                  {numberOfNights > 0 && (
                    <div className="mt-3 p-3 bg-white rounded-lg border shadow-sm">
                      <h4 className="font-medium text-xs mb-1.5">Informazioni importanti:</h4>
                      <ul className="text-xs space-y-0.5 text-muted-foreground">
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
              <div className="flex h-full items-center justify-center p-4 text-center">
                <div className="text-muted-foreground">
                  <p className="font-medium mb-1">Seleziona le date</p>
                  <p className="text-xs">Scegli prima la data di arrivo, poi quella di partenza</p>
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
