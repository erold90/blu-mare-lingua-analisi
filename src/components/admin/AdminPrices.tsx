
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
      const apt1Prices = weeklyPrices.filter(p => p.apartmentId === "apt-1");
      console.log(`Loaded ${apt1Prices.length} prices for Apt 1`);
      
      // Display first 3 prices for debugging
      if (apt1Prices.length > 0) {
        console.log("First 3 prices for Apt 1:", 
          apt1Prices.slice(0, 3).map(p => 
            `${new Date(p.weekStart).toLocaleDateString()}: ${p.price}€`
          )
        );
      }
    } else {
      console.log("No weekly prices found. Forcing refresh...");
      __DEBUG_reset && __DEBUG_reset();
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
  
  // FIXED: This function now properly compares dates as strings to find prices
  const getPriceForWeek = (apartmentId: string, weekStart: Date): number => {
    // Convert weekStart to string format for comparison
    const weekStartStr = weekStart.toISOString().substring(0, 10); // YYYY-MM-DD format
    
    // Find the right apartment price
    const matchingPrice = weeklyPrices.find(p => {
      return p.apartmentId === apartmentId && 
             new Date(p.weekStart).toISOString().substring(0, 10) === weekStartStr;
    });
    
    // Return the price if found, otherwise return 0
    return matchingPrice ? matchingPrice.price : 0;
  };
  
  const handleResetPricesClick = () => {
    if (__DEBUG_reset) {
      __DEBUG_reset();
      toast.success("Prezzi reimpostati con successo");
    }
  };

  // If no prices loaded yet, force a reset
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
