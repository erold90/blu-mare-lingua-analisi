
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
    <div className="max-w-7xl mx-auto">
      <div className="border-b border-border/50 pb-6 mb-8">
        <h2 className="text-2xl font-light mb-2 flex items-center gap-3">
          <CalendarDays className="h-6 w-6" />
          Date di soggiorno
        </h2>
        <p className="text-muted-foreground font-light">Scegli le date del tuo soggiorno</p>
      </div>
      
      <div className="space-y-8">
        {/* Information */}
        <div className="border border-border/50 p-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 mb-2">
            <InfoIcon className="h-4 w-4" />
            <span className="font-medium">Regole di prenotazione</span>
          </div>
          <div className="text-xs space-y-1">
            <p>• Check-in/Check-out: Solo sabato, domenica e lunedì</p>
            <p>• Durata: Minimo 5 notti, massimo 28 notti</p>
            <p>• Prezzi calcolati settimanalmente</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="border border-border/50 p-4">
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
                  caption: "flex justify-center pt-2 relative items-center px-12",
                  caption_label: "text-lg font-light",
                  nav: "space-x-2 flex items-center",
                  nav_button: "h-10 w-10 border border-border hover:bg-muted transition-colors duration-200",
                  nav_button_previous: "absolute left-2",
                  nav_button_next: "absolute right-2",
                  table: "w-full border-collapse mt-4",
                  head_row: "flex w-full mb-1",
                  head_cell: "text-muted-foreground w-full flex-1 font-medium text-sm py-2 text-center",
                  row: "flex w-full mb-1",
                  cell: "w-full flex-1 text-center p-0 relative",
                  day: "w-full h-12 p-0 font-medium text-base hover:bg-muted transition-colors duration-200 flex items-center justify-center",
                  day_selected: "bg-foreground text-background hover:bg-foreground/90 hover:text-background focus:bg-foreground focus:text-background font-bold",
                  day_today: "bg-muted text-foreground font-bold",
                  day_outside: "text-muted-foreground/40 opacity-30",
                  day_disabled: "!text-muted-foreground opacity-50 cursor-not-allowed hover:bg-transparent font-medium",
                  day_range_middle: "bg-muted !text-foreground font-bold",
                  day_range_start: "bg-foreground text-background font-bold",
                  day_range_end: "bg-foreground text-background font-bold"
                }}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            {dateRange?.from && dateRange?.to ? (
              <StaySummary 
                dateRange={dateRange} 
                numberOfNights={numberOfNights} 
              />
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed border-border/50 p-6">
                <div className="text-center">
                  <CalendarDays className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-medium text-lg mb-2">Seleziona le date</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Scegli la data di <strong>check-in</strong> e <strong>check-out</strong>
                  </p>
                  <div className="text-xs text-muted-foreground border-t border-border/50 pt-3">
                    I prezzi sono calcolati settimanalmente
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-8 border-t border-border/50 mt-8">
        <Button type="button" variant="ghost" onClick={prevStep} className="px-8">
          Indietro
        </Button>
        <Button 
          type="button" 
          onClick={nextStep} 
          disabled={!dateRange?.from || !dateRange?.to || numberOfNights < 5 || numberOfNights > 28}
          className="px-8"
        >
          Continua
        </Button>
      </div>
    </div>
  );
};

export default DateSelectionStep;
