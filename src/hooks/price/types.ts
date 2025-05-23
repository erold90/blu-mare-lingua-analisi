
export interface WeeklyPrice {
  apartmentId: string;
  weekStart: string;
  weekEnd?: string;
  price: number;
}

export interface SeasonalPricing {
  year: number;
  prices: WeeklyPrice[];
}

export interface PricesContextType {
  prices: WeeklyPrice[];
  isLoading: boolean;
  updatePrice: (apartmentId: string, weekStart: string, price: number) => void;
  getPriceForWeek: (apartmentId: string, weekStart: Date) => number;
  getWeeksForYear: (year: number) => { start: Date; end: Date }[];
  availableYears: number[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  resetPrices: () => void;
}
