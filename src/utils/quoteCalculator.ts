
// Re-export all price calculation functions from the refactored modules
import { calculateTotalPrice } from "./price/priceCalculator";
import { createWhatsAppMessage } from "./price/whatsAppMessage";
import { PriceCalculation } from "./price/types";
import { formatDate } from "./price/dateUtils";
import { calculateExtras, calculateLinenCost, calculatePetsCost } from "./price/extrasCalculator";

// Re-export the main functions and types for backward compatibility
export { 
  calculateTotalPrice, 
  createWhatsAppMessage, 
  formatDate,
  calculateExtras,
  calculateLinenCost,
  calculatePetsCost
};
export type { PriceCalculation };
