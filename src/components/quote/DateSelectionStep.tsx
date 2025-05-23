
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { InfoIcon, CalendarDays, Clock } from "lucide-react";
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
    <Card className="max-w-7xl mx-auto shadow-lg border">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-serif text-primary flex items-center gap-3">
          <CalendarDays className="h-8 w-8" />
          Selezione Date
        </CardTitle>
        <CardDescription className="text-lg">Scegli le date del tuo soggiorno presso Villa Marina Resort</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Information alerts */}
        <div className="grid gap-4">
          <Alert className="bg-blue-50 border-blue-200">
            <InfoIcon className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Check-in/Check-out:</strong> Disponibili solo <strong>sabato, domenica e lunedì</strong>
            </AlertDescription>
          </Alert>
          
          <Alert className="bg-amber-50 border-amber-200">
            <Clock className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Durata soggiorno:</strong> Minimo <strong>5 notti</strong>, massimo <strong>28 notti</strong>. I prezzi sono calcolati a settimana.
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar - take up 2/3 of the space */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-primary/10 shadow-sm">
              <CardContent className="p-0">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={new Date()}
                  selected={dateRange}
                  onSelect={handleDateChange}
                  disabled={isDateDisabled}
                  numberOfMonths={1}
                  fixedWeeks={true}
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>

          {/* Stay summary - take up 1/3 of the space */}
          <div className="lg:col-span-1">
            {dateRange?.from && dateRange?.to ? (
              <StaySummary 
                dateRange={dateRange} 
                numberOfNights={numberOfNights} 
              />
            ) : (
              <Card className="h-full flex items-center justify-center border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/10">
                <CardContent className="text-center p-8">
                  <CalendarDays className="h-16 w-16 mx-auto mb-4 text-primary/50" />
                  <h3 className="font-semibold text-primary text-xl mb-3">Seleziona le Date</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Scegli prima la data di <strong>check-in</strong>, poi quella di <strong>check-out</strong>
                  </p>
                  <div className="mt-4 p-3 bg-white/50 rounded-md text-sm text-muted-foreground">
                    💡 Ricorda: i prezzi sono settimanali e fissi indipendentemente dal giorno di check-in/out
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-6 pb-6 bg-gray-50/50">
        <Button type="button" variant="outline" onClick={prevStep} size="lg" className="px-8">
          Indietro
        </Button>
        <Button 
          type="button" 
          onClick={nextStep} 
          disabled={!dateRange?.from || !dateRange?.to || numberOfNights < 5 || numberOfNights > 28}
          size="lg"
          className="px-8"
        >
          Continua
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DateSelectionStep;
