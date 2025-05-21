
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

  // Inizializza le settimane all'avvio
  React.useEffect(() => {
    console.log("AdminPrices: Inizializzando le settimane per la stagione");
    setWeeks(generateWeeksForSeason(selectedYear, 6, 9)); // June to September
  }, [generateWeeksForSeason, selectedYear]);
  
  // Log di diagnostica
  React.useEffect(() => {
    console.log("AdminPrices: weeklyPrices updated:", weeklyPrices.length);
    
    const year2025 = seasonalPricing.find(s => s.year === 2025);
    if (year2025) {
      const pricesForApt1 = year2025.prices.filter(p => p.apartmentId === "apt-1");
      console.log(`Prezzi caricati per l'anno 2025 (Apt 1): ${pricesForApt1.length}`);
      
      // Visualizza i primi 3 prezzi per debug
      if (pricesForApt1.length > 0) {
        const samplePrices = pricesForApt1
          .slice(0, 3)
          .map(p => `${new Date(p.weekStart).toLocaleDateString()}: ${p.price}€`);
        console.log("Sample prices for Apt 1:", samplePrices);
      }
    } else {
      console.warn("Nessun prezzo trovato per l'anno 2025");
    }
  }, [seasonalPricing, weeklyPrices]);
  
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
    
    // 1. First try to find in weekly prices (most current)
    const weeklyPrice = weeklyPrices.find(
      p => p.apartmentId === apartmentId && 
           new Date(p.weekStart).toDateString() === weekStart.toDateString()
    );
    
    if (weeklyPrice) {
      return weeklyPrice.price;
    }
    
    // 2. Look in seasonal pricing for this year
    const year = weekStart.getFullYear();
    const season = seasonalPricing.find(s => s.year === year);
    
    if (season) {
      const seasonPrice = season.prices.find(
        p => p.apartmentId === apartmentId && 
             new Date(p.weekStart).toDateString() === weekStart.toDateString()
      );
      
      if (seasonPrice) {
        return seasonPrice.price;
      }
    }
    
    // Debug per vedere cosa sta accadendo
    console.log(`Prezzo non trovato per ${apartmentId} su ${weekStart.toDateString()}, uso il default`);
    
    // 3. Default to base price if not found
    return 0; // Usiamo 0 come valore default invece di un prezzo fisso
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
      
      {weeklyPrices.length > 0 ? (
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
