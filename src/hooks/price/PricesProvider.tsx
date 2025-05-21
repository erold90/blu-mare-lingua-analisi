
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
    
    // Force initialization on first load to ensure prices are always set
    console.log("Forcing price initialization with custom prices");
    const initialPrices = forceInitializePrices(setSeasonalPricing);
    setWeeklyPrices(initialPrices);
    toast.success("Prezzi 2025 inizializzati correttamente");
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
    resetAllPrices();
    const initialPrices = forceInitializePrices(setSeasonalPricing);
    setWeeklyPrices(initialPrices);
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
    __DEBUG_reset: process.env.NODE_ENV === 'development' ? resetPrices : undefined
  };
  
  return (
    <PricesContext.Provider value={contextValue}>
      {children}
    </PricesContext.Provider>
  );
};
