
import React, { createContext, useContext, useState, useEffect } from "react";
import { startOfWeek, endOfWeek, addWeeks, format, parseISO, isWithinInterval } from "date-fns";
import { it } from "date-fns/locale";
import { apartments } from "@/data/apartments";

export interface WeeklyPrice {
  apartmentId: string;
  weekStart: string; // ISO date string of the week start (always Saturday)
  weekEnd: string;   // ISO date string of the week end (always Friday)
  price: number;
}

export interface SeasonalPricing {
  year: number;
  prices: WeeklyPrice[];
}

interface PricesContextType {
  seasonalPricing: SeasonalPricing[];
  weeklyPrices: WeeklyPrice[];
  updateWeeklyPrice: (apartmentId: string, weekStart: string, price: number) => void;
  getPriceForDate: (apartmentId: string, date: Date) => number;
  generateWeeksForSeason: (year: number, startMonth: number, endMonth: number) => { start: Date, end: Date }[];
  getCurrentSeason: () => SeasonalPricing;
}

const PricesContext = createContext<PricesContextType | undefined>(undefined);

// Helper to generate weeks for a given season
const generateWeeksForSeason = (year: number, startMonth: number, endMonth: number) => {
  // Create array to hold all weeks
  const weeks: { start: Date, end: Date }[] = [];
  
  // Start from first Saturday of June
  let currentDate = new Date(year, startMonth - 1, 1); // June 1st (months are 0-indexed)
  while (currentDate.getDay() !== 6) { // 6 is Saturday
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }
  
  // Generate weeks until the end of September
  while (currentDate.getMonth() < endMonth) {
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6); // End of week (Friday)
    
    weeks.push({
      start: new Date(currentDate),
      end: weekEnd
    });
    
    // Move to next Saturday
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return weeks;
};

export const PricesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial state with seasonal pricing for the current year
  const [seasonalPricing, setSeasonalPricing] = useState<SeasonalPricing[]>(() => {
    const savedPricing = localStorage.getItem("seasonalPricing");
    if (savedPricing) {
      try {
        return JSON.parse(savedPricing);
      } catch (error) {
        console.error("Failed to parse saved seasonal pricing:", error);
        return [];
      }
    }
    
    const currentYear = new Date().getFullYear();
    // Initialize with default pricing if nothing is saved
    return [{
      year: currentYear,
      prices: generateDefaultPricesForYear(currentYear)
    }];
  });
  
  // Current year's weekly prices
  const [weeklyPrices, setWeeklyPrices] = useState<WeeklyPrice[]>(() => {
    const currentYear = new Date().getFullYear();
    const currentSeason = seasonalPricing.find(season => season.year === currentYear);
    return currentSeason ? currentSeason.prices : generateDefaultPricesForYear(currentYear);
  });
  
  // Helper function to generate default prices for a year
  function generateDefaultPricesForYear(year: number): WeeklyPrice[] {
    const weeks = generateWeeksForSeason(year, 6, 9); // June (6) to September (8)
    const allPrices: WeeklyPrice[] = [];
    
    apartments.forEach(apartment => {
      weeks.forEach(week => {
        allPrices.push({
          apartmentId: apartment.id,
          weekStart: week.start.toISOString(),
          weekEnd: week.end.toISOString(),
          price: apartment.price // Default to the base apartment price
        });
      });
    });
    
    return allPrices;
  }
  
  // Save pricing to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("seasonalPricing", JSON.stringify(seasonalPricing));
  }, [seasonalPricing]);
  
  // Update a specific weekly price
  const updateWeeklyPrice = (apartmentId: string, weekStart: string, price: number) => {
    const currentYear = new Date(weekStart).getFullYear();
    
    setSeasonalPricing(prevPricing => {
      // Find the current year's pricing or create it
      const yearIndex = prevPricing.findIndex(season => season.year === currentYear);
      
      if (yearIndex === -1) {
        // Year not found, create new year entry
        const newYearPricing = {
          year: currentYear,
          prices: generateDefaultPricesForYear(currentYear)
        };
        
        // Update the specific price
        const priceIndex = newYearPricing.prices.findIndex(
          p => p.apartmentId === apartmentId && p.weekStart === weekStart
        );
        
        if (priceIndex !== -1) {
          newYearPricing.prices[priceIndex].price = price;
        }
        
        return [...prevPricing, newYearPricing];
      } else {
        // Year found, update the specific price
        const updatedPricing = [...prevPricing];
        const priceIndex = updatedPricing[yearIndex].prices.findIndex(
          p => p.apartmentId === apartmentId && p.weekStart === weekStart
        );
        
        if (priceIndex !== -1) {
          updatedPricing[yearIndex].prices[priceIndex].price = price;
        }
        
        return updatedPricing;
      }
    });
    
    // Also update weekly prices if they're for the current year
    if (new Date(weekStart).getFullYear() === new Date().getFullYear()) {
      setWeeklyPrices(prevPrices => {
        const updatedPrices = [...prevPrices];
        const priceIndex = updatedPrices.findIndex(
          p => p.apartmentId === apartmentId && p.weekStart === weekStart
        );
        
        if (priceIndex !== -1) {
          updatedPrices[priceIndex].price = price;
        }
        
        return updatedPrices;
      });
    }
  };
  
  // Get the price for a specific date and apartment
  const getPriceForDate = (apartmentId: string, date: Date): number => {
    // Find the apartment to get default price
    const apartment = apartments.find(apt => apt.id === apartmentId);
    if (!apartment) return 0;
    
    const year = date.getFullYear();
    
    // Find the season for this year
    const season = seasonalPricing.find(s => s.year === year);
    if (!season) return apartment.price; // Return default price if no seasonal pricing
    
    // Find the week containing this date
    const weekPrice = season.prices.find(price => {
      if (price.apartmentId !== apartmentId) return false;
      
      const weekStart = new Date(price.weekStart);
      const weekEnd = new Date(price.weekEnd);
      
      return isWithinInterval(date, { start: weekStart, end: weekEnd });
    });
    
    // Return weekly price if found, otherwise default price
    return weekPrice ? weekPrice.price : apartment.price;
  };
  
  // Get the current season or create it if it doesn't exist
  const getCurrentSeason = (): SeasonalPricing => {
    const currentYear = new Date().getFullYear();
    const currentSeason = seasonalPricing.find(season => season.year === currentYear);
    
    if (!currentSeason) {
      // Create a new season for the current year
      const newSeason = {
        year: currentYear,
        prices: generateDefaultPricesForYear(currentYear)
      };
      
      // Update seasonal pricing
      setSeasonalPricing(prevPricing => [...prevPricing, newSeason]);
      setWeeklyPrices(newSeason.prices);
      
      return newSeason;
    }
    
    return currentSeason;
  };
  
  return (
    <PricesContext.Provider value={{
      seasonalPricing,
      weeklyPrices,
      updateWeeklyPrice,
      getPriceForDate,
      generateWeeksForSeason,
      getCurrentSeason
    }}>
      {children}
    </PricesContext.Provider>
  );
};

export const usePrices = () => {
  const context = useContext(PricesContext);
  
  if (context === undefined) {
    throw new Error("usePrices must be used within a PricesProvider");
  }
  
  return context;
};
