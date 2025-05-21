
import React, { createContext, useEffect } from "react";
import { PricesContextType } from "./types";
import { getPriceForDate, getCurrentOrCreateSeason, generateWeeksForSeason } from "./priceUtils";
import { useProviderState } from "./useProviderState";
import { updateWeeklyPrice as updatePrice, initializeYearPricing, resetAllPrices, forceInitializePrices } from "./priceOperations";
import { toast } from "sonner";
import { apartments } from "@/data/apartments";

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
      return;
    } 
    
    console.log(`PricesProvider: Found ${year2025.prices.length} prices for 2025`);
    
    // Check if prices for all apartments exist
    const missingPrices = apartments.some(apt => {
      const aptPrices = year2025.prices.filter(p => p.apartmentId === apt.id);
      return aptPrices.length === 0;
    });
    
    if (missingPrices) {
      console.log("PricesProvider: Missing prices for some apartments, forcing initialization");
      const initialPrices = forceInitializePrices(setSeasonalPricing);
      setWeeklyPrices(initialPrices);
      toast.success("Prezzi completati per tutti gli appartamenti");
      return;
    }
    
    // Log some sample prices for debugging
    for (const apt of apartments) {
      const aptPrices = year2025.prices.filter(p => p.apartmentId === apt.id);
      if (aptPrices.length > 0) {
        console.log(`PricesProvider: ${apt.name} has ${aptPrices.length} prices`);
        console.log("First 3 prices:", 
          aptPrices.slice(0, 3).map(p => 
            `${new Date(p.weekStart).toLocaleDateString()}: ${p.price}€`
          )
        );
      } else {
        console.log(`PricesProvider: No prices found for ${apt.name}`);
      }
    }
    
    setWeeklyPrices(year2025.prices);
  }, []);
  
  // Update a specific weekly price
  const updateWeeklyPrice = (apartmentId: string, weekStart: string, price: number) => {
    updatePrice(apartmentId, weekStart, price, seasonalPricing, setSeasonalPricing, setWeeklyPrices);
    toast.success(`Prezzo aggiornato: ${price}€`);
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
    
    // Debug - verify the new prices
    const groupedByApartment = {};
    apartments.forEach(apt => {
      groupedByApartment[apt.id] = initialPrices.filter(p => p.apartmentId === apt.id);
      console.log(`Reset created ${groupedByApartment[apt.id].length} prices for ${apt.name}`);
    });
    
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
