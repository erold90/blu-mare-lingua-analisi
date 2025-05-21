
import React, { createContext, useEffect } from "react";
import { PricesContextType } from "./types";
import { getPriceForDate, getCurrentOrCreateSeason, generateWeeksForSeason } from "./priceUtils";
import { useProviderState } from "./useProviderState";
import { updateWeeklyPrice as updatePrice, initializeYearPricing, resetAllPrices, forceInitializePrices } from "./priceOperations";
import { toast } from "sonner";

// Create the context
export const PricesContext = createContext<PricesContextType | undefined>(undefined);

export const PricesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { seasonalPricing, setSeasonalPricing, weeklyPrices, setWeeklyPrices } = useProviderState();
  
  // Initialize 2025 season with custom prices immediately on load
  useEffect(() => {
    console.log("PricesProvider: Checking existing prices");
    
    // First, check if we have any pricing data
    if (!seasonalPricing || seasonalPricing.length === 0) {
      console.log("PricesProvider: No prices found, initializing with custom prices");
      localStorage.removeItem("seasonalPricing"); // Clear any existing prices first
      const initialPrices = forceInitializePrices(setSeasonalPricing);
      setWeeklyPrices(initialPrices);
      console.log(`PricesProvider: Initialized ${initialPrices.length} custom prices`);
      toast.success("Prezzi 2025 inizializzati correttamente");
      return;
    } 
    
    console.log(`PricesProvider: Found ${seasonalPricing.length} existing seasons`);
    
    // Check if we have prices for 2025
    const year2025 = seasonalPricing.find(s => s.year === 2025);
    
    if (!year2025 || !year2025.prices || year2025.prices.length === 0) {
      console.log("PricesProvider: 2025 prices missing, forcing initialization");
      // Just initialize 2025 prices without resetting everything
      const initialPrices = forceInitializePrices(setSeasonalPricing);
      setWeeklyPrices(initialPrices);
      console.log(`PricesProvider: Initialized ${initialPrices.length} prices for 2025`);
      toast.success("Prezzi 2025 inizializzati correttamente");
    } else {
      console.log(`PricesProvider: Found ${year2025.prices.length} prices for 2025`);
      
      // Log some sample prices for debugging
      const sampleApt = year2025.prices.filter(p => p.apartmentId === "appartamento-1");
      if (sampleApt.length > 0) {
        console.log("Sample prices for appartamento-1:", 
          sampleApt.slice(0, 3).map(p => 
            `${new Date(p.weekStart).toLocaleDateString()}: ${p.price}€`
          )
        );
      }
      
      setWeeklyPrices(year2025.prices);
    }
  }, []);
  
  // Update a specific weekly price
  const updateWeeklyPrice = (apartmentId: string, weekStart: string, price: number) => {
    updatePrice(apartmentId, weekStart, price, seasonalPricing, setSeasonalPricing, setWeeklyPrices);
  };
  
  // Get the current season or create it if it doesn't exist
  const getCurrentSeason = () => {
    return getCurrentOrCreateSeason(seasonalPricing, setSeasonalPricing, setWeeklyPrices);
  };
  
  // Reset prices (for development only)
  const resetPrices = () => {
    console.log("Resetting all prices and forcing initialization");
    resetAllPrices();
    const initialPrices = forceInitializePrices(setSeasonalPricing);
    setWeeklyPrices(initialPrices);
    console.log(`Reset complete, initialized ${initialPrices.length} prices`);
    toast.success("Prezzi reimpostati correttamente");
  };
  
  // Create the context value object
  const contextValue: PricesContextType = {
    seasonalPricing,
    weeklyPrices,
    updateWeeklyPrice,
    getPriceForDate: (apartmentId: string, date: Date) => getPriceForDate(apartmentId, date, seasonalPricing),
    generateWeeksForSeason,
    getCurrentSeason,
    __DEBUG_reset: resetPrices
  };
  
  return (
    <PricesContext.Provider value={contextValue}>
      {children}
    </PricesContext.Provider>
  );
};
