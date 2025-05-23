
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
        <CardTitle className="text-2xl md:text-3xl font-serif text-primary flex items-center gap-3">
          <CalendarDays className="h-6 w-6 md:h-8 md:w-8" />
          Selezione Date
        </CardTitle>
        <CardDescription className="text-base md:text-lg">Scegli le date del tuo soggiorno presso Villa MareBlu</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 md:space-y-6">
        {/* Information alert - compatto per mobile e desktop */}
        <Alert className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <AlertDescription className="text-blue-800 text-xs md:text-sm leading-tight">
            <strong>Check-in/Check-out:</strong> Solo sabato, domenica e lunedì • <strong>Durata:</strong> Min 5 notti, max 28 notti • <strong>Prezzi:</strong> Calcolati a settimana
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Calendar - responsive design */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className="border-2 border-primary/10 shadow-sm">
              <CardContent className="p-2 md:p-4">
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
                  classNames={{
                    months: "flex flex-col space-y-4 w-full",
                    month: "space-y-4 w-full",
                    caption: "flex justify-center pt-2 relative items-center px-8 md:px-12",
                    caption_label: "text-base md:text-lg font-semibold text-primary",
                    nav: "space-x-1 md:space-x-2 flex items-center",
                    nav_button: "h-8 w-8 md:h-10 md:w-10 bg-white border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition-all duration-200 rounded-md",
                    nav_button_previous: "absolute left-1 md:left-2",
                    nav_button_next: "absolute right-1 md:right-2",
                    table: "w-full border-collapse space-y-1 md:space-y-2 mt-2 md:mt-4",
                    head_row: "flex w-full",
                    head_cell: "text-muted-foreground rounded-md w-full flex-1 font-medium text-xs md:text-sm py-2 md:py-3 text-center",
                    row: "flex w-full mt-1 md:mt-2",
                    cell: "h-10 md:h-12 w-full flex-1 text-center text-sm md:text-base p-0 relative focus-within:relative focus-within:z-20",
                    day: "h-10 md:h-12 w-full flex-1 p-0 font-medium text-sm md:text-base hover:bg-primary/10 transition-colors duration-200 rounded-md",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md shadow-md",
                    day_today: "bg-accent text-accent-foreground font-bold border-2 border-primary/30 rounded-md",
                    day_outside: "text-muted-foreground/50 opacity-40",
                    day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed hover:bg-transparent",
                    day_range_middle: "bg-accent/50 text-accent-foreground rounded-none",
                    day_range_start: "bg-primary text-primary-foreground rounded-l-md rounded-r-none",
                    day_range_end: "bg-primary text-primary-foreground rounded-r-md rounded-l-none"
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Stay summary - mobile optimized */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            {dateRange?.from && dateRange?.to ? (
              <StaySummary 
                dateRange={dateRange} 
                numberOfNights={numberOfNights} 
              />
            ) : (
              <Card className="h-full flex items-center justify-center border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/10">
                <CardContent className="text-center p-4 md:p-6">
                  <CalendarDays className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 text-primary/50" />
                  <h3 className="font-semibold text-primary text-lg md:text-xl mb-2 md:mb-3">Seleziona le Date</h3>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-3 md:mb-4">
                    Scegli prima la data di <strong>check-in</strong>, poi quella di <strong>check-out</strong>
                  </p>
                  <div className="p-2 md:p-3 bg-white/50 rounded-md text-xs md:text-sm text-muted-foreground">
                    💡 Ricorda: i prezzi sono settimanali e fissi indipendentemente dal giorno di check-in/out
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 md:pt-6 pb-4 md:pb-6 bg-gray-50/50">
        <Button type="button" variant="outline" onClick={prevStep} size="lg" className="w-full sm:w-auto px-6 md:px-8">
          Indietro
        </Button>
        <Button 
          type="button" 
          onClick={nextStep} 
          disabled={!dateRange?.from || !dateRange?.to || numberOfNights < 5 || numberOfNights > 28}
          size="lg"
          className="w-full sm:w-auto px-6 md:px-8"
        >
          Continua
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DateSelectionStep;
