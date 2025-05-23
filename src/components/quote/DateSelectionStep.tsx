
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
        {/* Information alert - compatta per mobile e desktop */}
        <Alert className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-3 w-3 md:h-4 md:w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <AlertDescription className="text-blue-800 text-xs leading-tight">
            <strong>Check-in/Check-out:</strong> Solo sabato, domenica e lunedì • <strong>Durata:</strong> Min 5 notti, max 28 notti • <strong>Prezzi:</strong> Calcolati a settimana
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Calendar - responsive design with better mobile layout */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className="border-2 border-primary/10 shadow-sm">
              <CardContent className="p-1 md:p-4">
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
                    months: "flex flex-col space-y-2 md:space-y-4 w-full",
                    month: "space-y-2 md:space-y-4 w-full",
                    caption: "flex justify-center pt-1 md:pt-2 relative items-center px-6 md:px-12",
                    caption_label: "text-sm md:text-lg font-semibold text-primary",
                    nav: "space-x-1 md:space-x-2 flex items-center",
                    nav_button: "h-7 w-7 md:h-10 md:w-10 bg-white border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition-all duration-200 rounded-md",
                    nav_button_previous: "absolute left-1 md:left-2",
                    nav_button_next: "absolute right-1 md:right-2",
                    table: "w-full border-collapse mt-1 md:mt-4",
                    head_row: "flex w-full mb-1",
                    head_cell: "text-muted-foreground w-full flex-1 font-semibold text-xs md:text-sm py-1 md:py-2 text-center",
                    row: "flex w-full mb-1",
                    cell: "w-full flex-1 text-center p-0 relative",
                    day: "w-full h-8 md:h-12 p-0 font-medium text-xs md:text-base hover:bg-primary/10 transition-colors duration-200 rounded-md flex items-center justify-center",
                    day_selected: "bg-primary text-white hover:bg-primary/90 hover:text-white focus:bg-primary focus:text-white rounded-md shadow-md font-bold border-2 border-primary",
                    day_today: "bg-accent text-accent-foreground font-bold border-2 border-primary/30 rounded-md",
                    day_outside: "text-muted-foreground/40 opacity-30",
                    day_disabled: "text-muted-foreground opacity-20 cursor-not-allowed hover:bg-transparent",
                    day_range_middle: "bg-primary/40 !text-white font-bold rounded-none border-y-2 border-primary/20",
                    day_range_start: "bg-primary text-white font-bold rounded-r-none border-2 border-primary",
                    day_range_end: "bg-primary text-white font-bold rounded-l-none border-2 border-primary"
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
