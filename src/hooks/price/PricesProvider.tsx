
import React, { createContext, useState, useEffect, useCallback } from "react";
import { WeeklyPrice, SeasonalPricing, PricesContextType } from "./types";
import { toast } from "sonner";
import { apartments } from "@/data/apartments";

// Predefined pricing data
const PREDEFINED_PRICES = [
  // June
  { month: 6, prices: { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 } },
  // July 1-3 weeks
  { month: 7, week: 1, prices: { "appartamento-1": 475, "appartamento-2": 575, "appartamento-3": 425, "appartamento-4": 450 } },
  { month: 7, week: 2, prices: { "appartamento-1": 475, "appartamento-2": 575, "appartamento-3": 425, "appartamento-4": 450 } },
  { month: 7, week: 3, prices: { "appartamento-1": 475, "appartamento-2": 575, "appartamento-3": 425, "appartamento-4": 450 } },
  // July last week
  { month: 7, week: 4, prices: { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 665, "appartamento-4": 700 } },
  // August 1st week
  { month: 8, week: 1, prices: { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 665, "appartamento-4": 700 } },
  // August middle weeks
  { month: 8, week: 2, prices: { "appartamento-1": 1150, "appartamento-2": 1250, "appartamento-3": 1075, "appartamento-4": 1100 } },
  { month: 8, week: 3, prices: { "appartamento-1": 1150, "appartamento-2": 1250, "appartamento-3": 1075, "appartamento-4": 1100 } },
  // August last weeks
  { month: 8, week: 4, prices: { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 675, "appartamento-4": 700 } },
  { month: 8, week: 5, prices: { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 675, "appartamento-4": 700 } },
  // September
  { month: 9, prices: { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 } },
];

// Create the context
export const PricesContext = createContext<PricesContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = "apartmentPrices";

export const PricesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const availableYears = [2025, 2026, 2027, 2028];
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [prices, setPrices] = useState<WeeklyPrice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Generate weeks for a year (from June to September)
  const getWeeksForYear = useCallback((year: number) => {
    const weeks: { start: Date; end: Date }[] = [];
    
    // Start from first Saturday of June
    let currentDate = new Date(year, 5, 1); // June 1st
    while (currentDate.getDay() !== 6) { // Find first Saturday (6 = Saturday)
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Generate weeks until end of September
    while (currentDate < new Date(year, 9, 1)) { // Until October 1st
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6); // End of week (Friday)
      
      weeks.push({
        start: new Date(currentDate),
        end: new Date(weekEnd)
      });
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return weeks;
  }, []);

  // Initialize prices with predefined values
  const initializePrices = useCallback(() => {
    setIsLoading(true);
    
    try {
      // Load from localStorage first
      const savedPrices = localStorage.getItem(STORAGE_KEY);
      if (savedPrices) {
        const parsedPrices: { [key: number]: WeeklyPrice[] } = JSON.parse(savedPrices);
        
        // Check if we have prices for selected year
        if (parsedPrices[selectedYear] && parsedPrices[selectedYear].length > 0) {
          setPrices(parsedPrices[selectedYear]);
          setIsLoading(false);
          return;
        }
      }
      
      // If no prices found for selected year, generate from predefined data
      const weeks = getWeeksForYear(selectedYear);
      const generatedPrices: WeeklyPrice[] = [];
      
      // Generate prices for each apartment and week
      apartments.forEach(apartment => {
        weeks.forEach((week, index) => {
          const weekMonth = week.start.getMonth() + 1; // 1-based month
          const weekNumber = Math.ceil(week.start.getDate() / 7); // Week number within month
          
          // Find matching price in predefined data
          let price = 0;
          
          // Try to find exact week match
          const exactMatch = PREDEFINED_PRICES.find(
            p => p.month === weekMonth && p.week === weekNumber
          );
          
          if (exactMatch && exactMatch.prices[apartment.id]) {
            price = exactMatch.prices[apartment.id];
          } else {
            // Fall back to month-only match
            const monthMatch = PREDEFINED_PRICES.find(
              p => p.month === weekMonth && !p.week
            );
            
            if (monthMatch && monthMatch.prices[apartment.id]) {
              price = monthMatch.prices[apartment.id];
            }
          }
          
          // Use default price if nothing found
          if (!price) {
            price = apartment.price * 7; // Default to daily price * 7
          }
          
          generatedPrices.push({
            apartmentId: apartment.id,
            weekStart: week.start.toISOString(),
            price: price
          });
        });
      });
      
      // Save to state
      setPrices(generatedPrices);
      
      // Save to localStorage
      const allPrices = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      allPrices[selectedYear] = generatedPrices;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allPrices));
      
    } catch (error) {
      console.error("Failed to initialize prices:", error);
      toast.error("Errore nell'inizializzazione dei prezzi");
    }
    
    setIsLoading(false);
  }, [selectedYear, getWeeksForYear]);

  // Get price for a specific week
  const getPriceForWeek = useCallback((apartmentId: string, weekStart: Date) => {
    // Format date to match ISO format but only compare YY-MM-DD part
    const weekStartDate = new Date(weekStart);
    weekStartDate.setHours(0, 0, 0, 0);
    const searchDateStr = weekStartDate.toISOString().split('T')[0];
    
    // Find matching price
    const price = prices.find(p => {
      const priceDate = new Date(p.weekStart);
      const priceDateStr = priceDate.toISOString().split('T')[0];
      return p.apartmentId === apartmentId && priceDateStr === searchDateStr;
    });
    
    // Return price or default
    return price ? price.price : 0;
  }, [prices]);

  // Update a price
  const updatePrice = useCallback((apartmentId: string, weekStartStr: string, price: number) => {
    // Create new array with updated price
    const updatedPrices = prices.map(p => {
      // Compare date strings (YYYY-MM-DD format)
      const priceDateStr = new Date(p.weekStart).toISOString().split('T')[0];
      const updateDateStr = new Date(weekStartStr).toISOString().split('T')[0];
      
      if (p.apartmentId === apartmentId && priceDateStr === updateDateStr) {
        return { ...p, price };
      }
      return p;
    });
    
    // Update state
    setPrices(updatedPrices);
    
    // Update localStorage
    try {
      const allPrices = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      allPrices[selectedYear] = updatedPrices;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allPrices));
      toast.success("Prezzo aggiornato con successo");
    } catch (error) {
      console.error("Failed to save price:", error);
      toast.error("Errore nel salvare il prezzo");
    }
  }, [prices, selectedYear]);

  // Reset all prices
  const resetPrices = useCallback(() => {
    // Clear data
    localStorage.removeItem(STORAGE_KEY);
    
    // Reinitialize
    toast.success("Prezzi reimpostati, inizializzazione in corso...");
    setTimeout(initializePrices, 100);
  }, [initializePrices]);

  // Load prices when selected year changes
  useEffect(() => {
    initializePrices();
  }, [selectedYear, initializePrices]);

  // Context value
  const contextValue: PricesContextType = {
    prices,
    isLoading,
    updatePrice,
    getPriceForWeek,
    getWeeksForYear,
    availableYears,
    selectedYear,
    setSelectedYear,
    resetPrices
  };

  return (
    <PricesContext.Provider value={contextValue}>
      {children}
    </PricesContext.Provider>
  );
};
