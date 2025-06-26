
export interface PriceCalculation {
  basePrice: number;
  extras: number;
  cleaningFee: number;
  touristTax: number;
  touristTaxPerPerson: number;
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
  discount: number;
  savings: number;
  deposit: number;
  nights: number;
  totalPrice: number;
  subtotal: number;
  apartmentPrices?: Record<string, number>;
  // Nuovi campi per lo sconto di occupazione
  occupancyDiscount?: {
    occupancyPercentage: number;
    discountPercentage: number;
    discountAmount: number;
    originalBasePrice: number;
    description: string;
  };
}

export interface WeeklyPrice {
  apartmentId: string;
  weekStart: Date;
  price: number;
}

export interface SeasonalPricing {
  startDate: Date;
  endDate: Date;
  multiplier: number;
}

export const emptyPriceCalculation: PriceCalculation = {
  basePrice: 0,
  extras: 0,
  cleaningFee: 0,
  touristTax: 0,
  touristTaxPerPerson: 0,
  totalBeforeDiscount: 0,
  totalAfterDiscount: 0,
  discount: 0,
  savings: 0,
  deposit: 0,
  nights: 0,
  totalPrice: 0,
  subtotal: 0,
  apartmentPrices: {},
  occupancyDiscount: undefined
};
