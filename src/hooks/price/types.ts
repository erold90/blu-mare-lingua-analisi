
export interface WeeklyPrice {
  apartmentId: string;
  weekStart: string; // YYYY-MM-DD format
  price: number;
}

export interface SeasonalPricing {
  year: number;
  prices: WeeklyPrice[];
}

export interface PricesContextType {
  prices: WeeklyPrice[];
  isLoading: boolean;
  updatePrice: (apartmentId: string, weekStart: Date, price: number) => Promise<void>;
  getPriceForWeek: (apartmentId: string, weekStart: Date) => number;
  loadPrices: () => Promise<void>;
}
