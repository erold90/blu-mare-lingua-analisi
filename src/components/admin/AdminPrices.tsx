
import * as React from "react";
import { usePrices } from "@/hooks/usePrices";
import YearTabs from "./prices/YearTabs";
import { apartments } from "@/data/apartments";
import { Button } from "@/components/ui/button"; 
import { toast } from "sonner";

const AdminPrices = () => {
  const { 
    weeklyPrices, 
    updateWeeklyPrice, 
    generateWeeksForSeason, 
    getCurrentSeason,
    seasonalPricing,
    __DEBUG_reset
  } = usePrices();
  
  const years = [2025, 2026, 2027, 2028];
  const [selectedYear, setSelectedYear] = React.useState<number>(2025);
  const [weeks, setWeeks] = React.useState<{ start: Date, end: Date }[]>([]);

  // Initialize weeks on startup
  React.useEffect(() => {
    console.log("AdminPrices: Initializing weeks for season");
    setWeeks(generateWeeksForSeason(selectedYear, 6, 9)); // June to September
  }, [generateWeeksForSeason, selectedYear]);
  
  // Debug logging for price data
  React.useEffect(() => {
    console.log(`AdminPrices: ${weeklyPrices.length} weekly prices loaded`);
    
    if (weeklyPrices.length > 0) {
      const samplePrices = weeklyPrices.filter(p => p.apartmentId === apartments[0].id);
      console.log(`Loaded ${samplePrices.length} prices for ${apartments[0].name}`);
      
      // Display first 3 prices for debugging
      if (samplePrices.length > 0) {
        console.log("First 3 prices:", 
          samplePrices.slice(0, 3).map(p => 
            `${new Date(p.weekStart).toLocaleDateString()}: ${p.price}€`
          )
        );
      } else {
        console.log("No prices found for first apartment");
      }
    } else {
      console.log("No weekly prices found. Forcing refresh...");
      if (__DEBUG_reset) {
        __DEBUG_reset();
        toast.success("Prezzi reinizializzati con successo");
      }
    }
  }, [weeklyPrices, __DEBUG_reset]);
  
  // Re-generate weeks when selected year changes
  React.useEffect(() => {
    setWeeks(generateWeeksForSeason(selectedYear, 6, 9));
  }, [selectedYear, generateWeeksForSeason]);
  
  const handlePriceChange = (
    apartmentId: string,
    weekStartStr: string,
    value: string
  ) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      updateWeeklyPrice(apartmentId, weekStartStr, numValue);
      toast.success(`Prezzo aggiornato: ${numValue}€`);
    }
  };
  
  // This function properly finds prices based on date string comparison
  const getPriceForWeek = (apartmentId: string, weekStart: Date): number => {
    // Format for comparison (YYYY-MM-DD)
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    // Find the right price by comparing dates as strings
    const matchingPrice = weeklyPrices.find(p => {
      const priceDate = new Date(p.weekStart).toISOString().split('T')[0];
      return p.apartmentId === apartmentId && priceDate === weekStartStr;
    });
    
    if (matchingPrice) {
      console.log(`Found price for ${apartmentId} on ${weekStartStr}: ${matchingPrice.price}€`);
      return matchingPrice.price;
    }
    
    console.log(`No price found for ${apartmentId} on ${weekStartStr}, returning 0`);
    return 0;
  };
  
  const handleResetPricesClick = () => {
    if (__DEBUG_reset) {
      __DEBUG_reset();
      toast.success("Prezzi reimpostati con successo");
    }
  };

  // Force price initialization if needed
  React.useEffect(() => {
    if (weeklyPrices.length === 0 && __DEBUG_reset) {
      console.log("No prices found, forcing reset");
      __DEBUG_reset();
    }
  }, [weeklyPrices.length, __DEBUG_reset]);
  
  return (
    <div className="space-y-6">
      <div className="mb-4 flex justify-between">
        <h2 className="text-2xl font-bold">Gestione Prezzi</h2>
        {process.env.NODE_ENV === 'development' && __DEBUG_reset && (
          <Button variant="destructive" size="sm" onClick={handleResetPricesClick}>
            Reset Prezzi (Debug)
          </Button>
        )}
      </div>
      
      {weeklyPrices && weeklyPrices.length > 0 ? (
        <YearTabs 
          years={years}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          weeks={weeks}
          getPriceForWeek={getPriceForWeek}
          handlePriceChange={handlePriceChange}
        />
      ) : (
        <div className="p-8 text-center rounded-md border border-dashed">
          <p className="text-muted-foreground">Caricamento prezzi in corso...</p>
        </div>
      )}
    </div>
  );
};

export default AdminPrices;
