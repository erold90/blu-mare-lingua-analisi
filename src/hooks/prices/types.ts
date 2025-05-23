
// Price data object
export interface PriceData {
  apartmentId: string;
  weekStart: string;
  price: number;
}

// Price validation options for copying
export interface PriceAdjustmentOptions {
  sourceYear: number;
  targetYear: number;
  percentIncrease: number;
  rounding: 'up' | 'down' | 'none';
  roundToNearest: number;
  apartmentId?: string;
}
