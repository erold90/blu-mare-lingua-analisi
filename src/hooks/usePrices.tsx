
import { useContext } from "react";
import { PricesContext } from "./price/PricesProvider";
import { PricesContextType } from "./price/types";

export const usePrices = (): PricesContextType => {
  const context = useContext(PricesContext);
  
  if (context === undefined) {
    throw new Error("usePrices must be used within a PricesProvider");
  }
  
  // Forza pulizia del localStorage se necessario (solo per sviluppo)
  const forceResetPrices = () => {
    localStorage.removeItem("seasonalPricing");
    window.location.reload();
  };
  
  return {
    ...context,
    // Aggiunge la funzione per il debug (non disponibile in produzione)
    __DEBUG_reset: process.env.NODE_ENV === 'development' ? forceResetPrices : undefined
  };
};

// Re-export everything from the refactored modules
export * from './price';

