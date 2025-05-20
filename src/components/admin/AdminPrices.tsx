
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

  // Set 2025 prices on first load
  React.useEffect(() => {
    // Check if we're loading 2025 data
    if (selectedYear === 2025) {
      const season2025Prices = [
        // Format: [weekStart, apt1Price, apt2Price, apt3Price, apt4Price]
        ["2025-06-07", 400, 500, 350, 375], // 7 Giugno
        ["2025-06-14", 400, 500, 350, 375], // 14 Giugno
        ["2025-06-21", 400, 500, 350, 375], // 21 Giugno
        ["2025-06-28", 400, 500, 350, 375], // 28 Giugno
        ["2025-07-05", 475, 575, 425, 450], // 5 Luglio
        ["2025-07-12", 475, 575, 425, 450], // 12 Luglio
        ["2025-07-19", 475, 575, 425, 450], // 19 Luglio
        ["2025-07-26", 750, 850, 665, 700], // 26 Luglio
        ["2025-08-02", 750, 850, 665, 700], // 2 Agosto
        ["2025-08-09", 1150, 1250, 1075, 1100], // 9 Agosto
        ["2025-08-16", 1150, 1250, 1075, 1100], // 16 Agosto
        ["2025-08-23", 750, 850, 675, 700], // 23 Agosto
        ["2025-08-30", 750, 850, 675, 700], // 30 Agosto
        ["2025-09-06", 500, 600, 425, 450], // 6 Settembre
        ["2025-09-13", 500, 600, 425, 450], // 13 Settembre
        ["2025-09-20", 500, 600, 425, 450], // 20 Settembre
      ];

      // Initialize the prices for each week and apartment
      const aptIds = apartments.map(apt => apt.id);
      
      season2025Prices.forEach(([weekStartStr, apt1Price, apt2Price, apt3Price, apt4Price]) => {
        const prices = [apt1Price, apt2Price, apt3Price, apt4Price];
        
        aptIds.forEach((aptId, idx) => {
          if (idx < prices.length) {
            const weekStartDate = new Date(weekStartStr as string);
            const weekStartIso = weekStartDate.toISOString();
            updateWeeklyPrice(aptId, weekStartIso, prices[idx] as number);
          }
        });
      });
      
      toast.success("Prezzi 2025 aggiornati con successo");
    }
  }, [selectedYear, updateWeeklyPrice]);
  
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
    
    // If no price found for this specific week, return the apartment's default price
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
