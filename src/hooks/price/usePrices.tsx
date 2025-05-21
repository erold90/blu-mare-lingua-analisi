
import { useContext } from "react";
import { PricesContext } from "./PricesProvider";
import { PricesContextType } from "./types";

/**
 * Hook per accedere al contesto dei prezzi
 * Deve essere usato all'interno di un PricesProvider
 */
export const usePrices = (): PricesContextType => {
  const context = useContext(PricesContext);
  
  if (context === undefined) {
    throw new Error("usePrices must be used within a PricesProvider");
  }
  
  return context;
};
