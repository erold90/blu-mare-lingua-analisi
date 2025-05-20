
// Define shared types for pricing calculations
export interface PriceCalculation {
  basePrice: number;
  extras: number;
  cleaningFee: number;
  touristTax: number;
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
  discount: number;
  savings: number;
  deposit: number;
  nights: number;
  totalPrice: number;
}

// Create default empty price calculation object
export const emptyPriceCalculation: PriceCalculation = {
  basePrice: 0, 
  extras: 0,
  cleaningFee: 0,
  touristTax: 0, 
  totalBeforeDiscount: 0, 
  totalAfterDiscount: 0,
  discount: 0,
  savings: 0, 
  deposit: 0, 
  nights: 0,
  totalPrice: 0
};
