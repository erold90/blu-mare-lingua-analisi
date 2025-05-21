
import React, { createContext, useState, useEffect } from "react";
import { WeeklyPrice, SeasonalPricing, PricesContextType } from "./types";
import { updateWeeklyPrice, resetAllPrices, forceInitializePrices } from "./priceOperations";
import { getWeeksForYear } from "./priceUtils";
import { toast } from "sonner";

// Create context
export const PricesContext = createContext<PricesContextType | undefined>(undefined);

// Constants
const STORAGE_KEY = "seasonalPricing";
const DEFAULT_YEARS = [2025, 2026];

export const PricesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seasonalPricing, setSeasonalPricing] = useState<SeasonalPricing[]>([]);
  const [weeklyPrices, setWeeklyPrices] = useState<WeeklyPrice[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [availableYears, setAvailableYears] = useState<number[]>(DEFAULT_YEARS);

  // Load prices from localStorage on mount
  useEffect(() => {
    console.log("PricesProvider: Loading prices from localStorage");
    loadPrices();
  }, []);

  // Update weekly prices when selected year changes
  useEffect(() => {
    console.log(`PricesProvider: Selected year changed to ${selectedYear}`);
    updateWeeklyPricesForYear(selectedYear);
  }, [selectedYear, seasonalPricing]);

  // Load prices from localStorage
  const loadPrices = () => {
    try {
      setIsLoading(true);
      const savedPrices = localStorage.getItem(STORAGE_KEY);
      
      if (savedPrices) {
        const parsedPrices: SeasonalPricing[] = JSON.parse(savedPrices);
        console.log(`PricesProvider: Loaded ${parsedPrices.length} seasonal pricing objects`);
        
        if (parsedPrices.length > 0) {
          setSeasonalPricing(parsedPrices);
          
          // Get unique years from pricing data
          const years = [...new Set(parsedPrices.map(season => season.year))];
          setAvailableYears(years.length > 0 ? years : DEFAULT_YEARS);
          
          // Set selected year to current year if available, otherwise first available
          const currentYear = new Date().getFullYear();
          if (years.includes(currentYear)) {
            setSelectedYear(currentYear);
          } else if (years.length > 0) {
            setSelectedYear(years[0]);
          }
          
          // Update weekly prices for current year
          updateWeeklyPricesForYear(selectedYear);
        } else {
          // Initialize with sample data if no pricing exists
          console.log("PricesProvider: No pricing data found, initializing with sample data");
          initializePrices();
        }
      } else {
        // Initialize with sample data if no storage exists
        console.log("PricesProvider: No storage found, initializing with sample data");
        initializePrices();
      }
    } catch (error) {
      console.error("Error loading prices:", error);
      toast.error("Errore nel caricamento dei prezzi");
      initializePrices(); // Fallback to initialization
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize prices with predefined values
  const initializePrices = () => {
    const initialPrices = forceInitializePrices(setSeasonalPricing);
    setWeeklyPrices(initialPrices);
    setIsLoading(false);
    toast.success("Prezzi inizializzati con successo");
  };

  // Reset all prices data
  const resetPrices = () => {
    resetAllPrices();
    initializePrices();
    toast.success("Prezzi reimpostati con successo");
  };

  // Update weekly prices for the selected year
  const updateWeeklyPricesForYear = (year: number) => {
    const yearPricing = seasonalPricing.find(season => season.year === year);
    if (yearPricing) {
      console.log(`PricesProvider: Updated weekly prices for ${year}, found ${yearPricing.prices.length} prices`);
      setWeeklyPrices(yearPricing.prices);
    } else {
      console.log(`PricesProvider: No prices found for year ${year}`);
      setWeeklyPrices([]);
    }
  };

  // Get price for specific week and apartment
  const getPriceForWeek = (apartmentId: string, weekStart: Date): number => {
    try {
      // Format the date for comparison (YYYY-MM-DD)
      const searchDate = new Date(weekStart);
      searchDate.setHours(0, 0, 0, 0);
      const searchDateStr = searchDate.toISOString().split('T')[0];
      
      // Find matching price
      const price = weeklyPrices.find((p) => {
        const priceDate = new Date(p.weekStart);
        priceDate.setHours(0, 0, 0, 0);
        const priceDateStr = priceDate.toISOString().split('T')[0];
        
        const isMatch = p.apartmentId === apartmentId && priceDateStr === searchDateStr;
        return isMatch;
      });
      
      if (price) {
        return price.price;
      }
      
      return 0;
    } catch (error) {
      console.error("Error getting price for week:", error);
      return 0;
    }
  };

  // Update price for specific week and apartment
  const updatePrice = (apartmentId: string, weekStartStr: string, price: number) => {
    updateWeeklyPrice(
      apartmentId,
      weekStartStr,
      price,
      seasonalPricing,
      setSeasonalPricing,
      setWeeklyPrices
    );
  };

  // Context value
  const value: PricesContextType = {
    prices: weeklyPrices,
    isLoading,
    updatePrice,
    getPriceForWeek,
    getWeeksForYear,
    availableYears,
    selectedYear,
    setSelectedYear,
    resetPrices
  };

  return <PricesContext.Provider value={value}>{children}</PricesContext.Provider>;
};
