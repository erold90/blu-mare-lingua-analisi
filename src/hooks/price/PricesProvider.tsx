
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
  
  // Initialize 2025 season with custom prices if it doesn't exist
  useEffect(() => {
    console.log("PricesProvider: Checking if 2025 pricing needs initialization");
    
    if (!seasonalPricing || seasonalPricing.length === 0) {
      console.log("Nessun prezzo stagionale trovato, forziamo l'inizializzazione");
      const initialPrices = forceInitializePrices(setSeasonalPricing);
      setWeeklyPrices(initialPrices);
      toast.success("Prezzi 2025 inizializzati correttamente");
      return;
    }
    
    // Verifica se esiste una stagione 2025
    const year2025 = seasonalPricing.find(s => s.year === 2025);
    if (!year2025 || !year2025.prices || year2025.prices.length === 0) {
      console.log("Stagione 2025 mancante o vuota, inizializzazione forzata");
      const initialPrices = forceInitializePrices(setSeasonalPricing);
      setWeeklyPrices(initialPrices);
      toast.success("Prezzi 2025 inizializzati correttamente");
    } else {
      console.log(`Stagione 2025 trovata con ${year2025.prices.length} prezzi`);
      
      // Debug: stampa alcuni prezzi per verifica
      if (year2025.prices.length > 0) {
        const samplePrices = year2025.prices.filter(p => p.apartmentId === "apt-1").slice(0, 3);
        console.log("Esempi prezzi:", samplePrices.map(p => `${new Date(p.weekStart).toLocaleDateString()}: ${p.price}€`));
      }
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
  
  // Reset dei prezzi (solo per sviluppo)
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
