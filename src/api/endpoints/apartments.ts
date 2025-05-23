
/**
 * Apartments API endpoints
 */

import { fetchApi } from "../core/fetchApi";

export const apartmentsApi = {
  getAll: async () => {
    return fetchApi('/apartments');
  },
  
  getById: async (id: string) => {
    return fetchApi(`/apartments/${id}`);
  },
  
  update: async (id: string, apartment: any) => {
    return fetchApi(`/apartments/${id}`, 'PUT', apartment);
  }
};
