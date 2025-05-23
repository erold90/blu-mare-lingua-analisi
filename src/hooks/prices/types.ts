
export interface PriceData {
  apartmentId: string;
  weekStart: string;
  price: number;
}

export interface PriceLevel {
  level: string;
  color: string;
  label: string;
}

export interface PriceStats {
  totalPrices: number;
  avgPrice: number;
  maxPrice: number;
  minPrice: number;
}
