
import React, { createContext, useEffect } from "react";
import { PricesContextType } from "./types";
import { getPriceForDate, getCurrentOrCreateSeason, generateWeeksForSeason } from "./priceUtils";
import { useProviderState } from "./useProviderState";
import { updateWeeklyPrice as updatePrice, initializeYearPricing } from "./priceOperations";

// Create the context
export const PricesContext = createContext<PricesContextType | undefined>(undefined);

export const PricesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { seasonalPricing, setSeasonalPricing, weeklyPrices, setWeeklyPrices } = useProviderState();
  
  // Initialize 2025 season with custom prices if it doesn't exist (una volta sola)
  useEffect(() => {
    console.log("PricesProvider: Checking if 2025 pricing needs initialization");
    
    // Inizializziamo i prezzi solo se necessario
    initializeYearPricing(seasonalPricing, setSeasonalPricing);
    
    // Also ensure current year's prices are loaded
    getCurrentOrCreateSeason(seasonalPricing, setSeasonalPricing, setWeeklyPrices);
  }, []);
  
  // Update a specific weekly price
  const updateWeeklyPrice = (apartmentId: string, weekStart: string, price: number) => {
    updatePrice(apartmentId, weekStart, price, seasonalPricing, setSeasonalPricing, setWeeklyPrices);
  };
  
  // Get the current season or create it if it doesn't exist
  const getCurrentSeason = () => {
    return getCurrentOrCreateSeason(seasonalPricing, setSeasonalPricing, setWeeklyPrices);
  };
  
  // Reset dei prezzi (solo per sviluppo)
  const resetPrices = () => {
    localStorage.removeItem("seasonalPricing");
    window.location.reload();
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
