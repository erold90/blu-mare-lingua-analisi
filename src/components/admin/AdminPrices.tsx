
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
    }
  }, [weeklyPrices]);
  
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
  
  // Get price for a specific apartment and week
  const getPriceForWeek = (apartmentId: string, weekStart: Date): number => {
    // Find price in weekly prices array
    const price = weeklyPrices.find(
      p => p.apartmentId === apartmentId && 
           new Date(p.weekStart).toDateString() === weekStart.toDateString()
    );
    
    if (price) {
      return price.price;
    }
    
    // Fallback: check in seasonal pricing for this year
    const yearPricing = seasonalPricing.find(s => s.year === selectedYear);
    if (yearPricing) {
      const seasonPrice = yearPricing.prices.find(
        p => p.apartmentId === apartmentId && 
             new Date(p.weekStart).toDateString() === weekStart.toDateString()
      );
      
      if (seasonPrice) {
        return seasonPrice.price;
      }
    }
    
    // If no price is found, return 0
    return 0;
  };
  
  const handleResetPricesClick = () => {
    if (__DEBUG_reset) {
      __DEBUG_reset();
      toast.success("Prezzi reimpostati con successo");
    }
  };
  
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
