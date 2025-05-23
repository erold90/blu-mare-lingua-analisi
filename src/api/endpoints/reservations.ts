
/**
 * Reservations API endpoints
 */

import { fetchApi } from "../core/fetchApi";

export const reservationsApi = {
  getAll: async () => {
    return fetchApi('/reservations');
  },
  
  getById: async (id: string) => {
    return fetchApi(`/reservations/${id}`);
  },
  
  create: async (reservation: any) => {
    return fetchApi('/reservations', 'POST', reservation);
  },
  
  update: async (id: string, reservation: any) => {
    return fetchApi(`/reservations/${id}`, 'PUT', reservation);
  },
  
  delete: async (id: string) => {
    return fetchApi(`/reservations/${id}`, 'DELETE');
  }
};
