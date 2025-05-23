
/**
 * Cleaning API endpoints
 */

import { fetchApi } from "../core/fetchApi";

export const cleaningApi = {
  getAll: async () => {
    return fetchApi('/cleaning');
  },
  
  getById: async (id: string) => {
    return fetchApi(`/cleaning/${id}`);
  },
  
  create: async (cleaningTask: any) => {
    return fetchApi('/cleaning', 'POST', cleaningTask);
  },
  
  update: async (id: string, cleaningTask: any) => {
    return fetchApi(`/cleaning/${id}`, 'PUT', cleaningTask);
  },
  
  delete: async (id: string) => {
    return fetchApi(`/cleaning/${id}`, 'DELETE');
  },
  
  saveBatch: async (tasks: any[]) => {
    return fetchApi('/cleaning/batch', 'POST', tasks);
  }
};
