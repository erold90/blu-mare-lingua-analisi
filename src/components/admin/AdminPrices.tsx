
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
  const [weeks, setWeeks] = React.useState<{ start: Date, end: Date }[]>(
    generateWeeksForSeason(selectedYear, 6, 9) // June to September
  );
  
  // Log di diagnostica
  React.useEffect(() => {
    const year2025 = seasonalPricing.find(s => s.year === 2025);
    if (year2025) {
      const pricesForApt1 = year2025.prices.filter(p => p.apartmentId === "apt-1").length;
      console.log(`Prezzi caricati per l'anno 2025 (Apt 1): ${pricesForApt1}`);
      
      // Visualizza i primi 3 prezzi per debug
      const samplePrices = year2025.prices
        .filter(p => p.apartmentId === "apt-1")
        .slice(0, 3)
        .map(p => `${new Date(p.weekStart).toLocaleDateString()}: ${p.price}€`);
      console.log("Sample prices for Apt 1:", samplePrices);
    } else {
      console.warn("Nessun prezzo trovato per l'anno 2025");
    }
  }, [seasonalPricing]);
  
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
    if (!isNaN(numValue) && numValue > 0) {
      updateWeeklyPrice(apartmentId, weekStartStr, numValue);
      toast.success(`Prezzo aggiornato: ${numValue}€`);
    }
  };
  
  // Get price for a specific apartment and week
  const getPriceForWeek = (apartmentId: string, weekStart: Date): number => {
    const weekStartStr = weekStart.toISOString();
    const price = weeklyPrices.find(
      p => p.apartmentId === apartmentId && 
           p.weekStart.substring(0, 10) === weekStartStr.substring(0, 10)
    );
    
    if (price) {
      return price.price;
    }
    
    // Find the right year in seasonalPricing
    const year = weekStart.getFullYear();
    const season = seasonalPricing.find(s => s.year === year);
    
    if (season) {
      // Try to find a price for this apartment and week
      const matchingPrice = season.prices.find(
        p => p.apartmentId === apartmentId && 
             new Date(p.weekStart).toDateString() === weekStart.toDateString()
      );
      
      if (matchingPrice) return matchingPrice.price;
    }
    
    // For other years, return the apartment's default price
    const apartment = apartments.find(apt => apt.id === apartmentId);
    return apartment ? apartment.price : 0;
  };
  
  // Only call handleResetPricesClick if __DEBUG_reset exists
  const handleResetPricesClick = () => {
    if (__DEBUG_reset) {
      __DEBUG_reset();
      toast.success("Prezzi reimpostati con successo");
    }
  };
  
  return (
    <div className="space-y-6">
      {process.env.NODE_ENV === 'development' && __DEBUG_reset && (
        <div className="mb-4 flex justify-end">
          <Button variant="destructive" size="sm" onClick={handleResetPricesClick}>
            Reset Prezzi (Debug)
          </Button>
        </div>
      )}
      <YearTabs 
        years={years}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        weeks={weeks}
        getPriceForWeek={getPriceForWeek}
        handlePriceChange={handlePriceChange}
      />
    </div>
  );
};

export default AdminPrices;
