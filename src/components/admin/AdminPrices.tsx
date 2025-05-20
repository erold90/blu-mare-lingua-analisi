import * as React from "react";
import { usePrices } from "@/hooks/usePrices";
import { toast } from "sonner";
import YearTabs from "./prices/YearTabs";

const AdminPrices = () => {
  const { weeklyPrices, updateWeeklyPrice, generateWeeksForSeason, getCurrentSeason } = usePrices();
  
  const currentYear = new Date().getFullYear();
  const years = [2025, 2026, 2027, 2028];
  
  const [selectedYear, setSelectedYear] = React.useState<number>(2025);
  const [weeks, setWeeks] = React.useState<{ start: Date, end: Date }[]>(
    generateWeeksForSeason(selectedYear, 6, 9) // June to September
  );
  
  // Keep track of whether we've already initialized the 2025 prices
  const [prices2025Initialized, setPrices2025Initialized] = React.useState<boolean>(false);

  // Initialize 2025 prices on first load
  React.useEffect(() => {
    // Only run this once, when the component mounts and selectedYear is 2025
    if (selectedYear === 2025 && !prices2025Initialized) {
      console.log("Initializing 2025 prices...");
      
      // Set all apartment prices to 120€ for every week
      const apartmentIds = apartments.map(apt => apt.id);
      
      // Get all weeks for 2025 season
      const weeks2025 = generateWeeksForSeason(2025, 6, 9);
      
      // For each apartment and week, set the price to 120€
      apartmentIds.forEach(aptId => {
        weeks2025.forEach(week => {
          const weekStartIso = week.start.toISOString();
          updateWeeklyPrice(aptId, weekStartIso, 120);
          console.log(`Updated price for ${aptId}, week ${weekStartIso}: 120€`);
        });
      });
      
      // Mark as initialized so we don't do it again
      setPrices2025Initialized(true);
      toast.success("Prezzi 2025 aggiornati con successo");
    }
  }, [selectedYear, prices2025Initialized, updateWeeklyPrice, generateWeeksForSeason]);
  
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
      toast.success(`Prezzo aggiornato con successo`);
    }
  };
  
  // Get price for a specific apartment and week
  const getPriceForWeek = (apartmentId: string, weekStart: Date): number => {
    const weekStartStr = weekStart.toISOString();
    const price = weeklyPrices.find(
      p => p.apartmentId === apartmentId && 
           p.weekStart.substring(0, 10) === weekStartStr.substring(0, 10)
    );
    
    if (price) return price.price;
    
    // If no price found for this specific week, return 120 as default for 2025
    if (weekStart.getFullYear() === 2025) {
      return 120;
    }
    
    // For other years, return the apartment's default price
    const apartment = apartments.find(apt => apt.id === apartmentId);
    return apartment ? apartment.price : 0;
  };
  
  return (
    <div className="space-y-6">
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

// Need to import apartments here since it's used in the component
import { apartments } from "@/data/apartments";
