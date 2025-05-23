
/**
 * Prices API endpoints
 */

import { fetchApi } from "../core/fetchApi";

export const pricesApi = {
  getByYear: async (year: number) => {
    return fetchApi(`/prices/${year}`);
  },
  
  update: async (year: number, prices: any) => {
    return fetchApi(`/prices/${year}`, 'PUT', prices);
  }
};
