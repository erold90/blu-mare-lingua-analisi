
import { useContext } from "react";
import { PricesContext } from "./price/PricesProvider";
import { PricesContextType } from "./price/types";

export const usePrices = (): PricesContextType => {
  const context = useContext(PricesContext);
  
  if (context === undefined) {
    throw new Error("usePrices must be used within a PricesProvider");
  }
  
  return context;
};

// Re-export everything from the refactored modules
export * from './price';
