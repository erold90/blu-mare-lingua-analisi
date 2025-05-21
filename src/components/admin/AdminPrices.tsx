import * as React from "react";
import { usePrices } from "@/hooks/usePrices";
import YearTabs from "./prices/YearTabs";
import { apartments } from "@/data/apartments";

const AdminPrices = () => {
  const { 
    weeklyPrices, 
    updateWeeklyPrice, 
    generateWeeksForSeason, 
    getCurrentSeason,
    seasonalPricing 
  } = usePrices();
  
  const years = [2025, 2026, 2027, 2028];
  const [selectedYear, setSelectedYear] = React.useState<number>(2025);
  const [weeks, setWeeks] = React.useState<{ start: Date, end: Date }[]>(
    generateWeeksForSeason(selectedYear, 6, 9) // June to September
  );
  
  // Keep track of whether we've already initialized the prices
  const [pricesInitialized, setPricesInitialized] = React.useState<boolean>(false);

  // Initialize 2025 prices on first load only if needed
  React.useEffect(() => {
    // Only run this once, when the component mounts
    if (!pricesInitialized) {
      // Check if prices already exist in localStorage
      const savedPricing = localStorage.getItem("seasonalPricing");
      let hasPrices = false;
      
      if (savedPricing) {
        try {
          const allPricing = JSON.parse(savedPricing);
          hasPrices = allPricing.some((season: any) => season.year === 2025);
        } catch (error) {
          console.error("Failed to parse saved seasonal pricing:", error);
        }
      }
      
      // We'll let the PricesProvider handle the initialization
      // Just mark as initialized so we don't check repeatedly
      setPricesInitialized(true);
    }
  }, [pricesInitialized]);
  
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
