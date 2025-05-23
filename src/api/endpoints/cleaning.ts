
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
  
  create: async (task: any) => {
    return fetchApi('/cleaning', 'POST', task);
  },
  
  update: async (id: string, task: any) => {
    return fetchApi(`/cleaning/${id}`, 'PUT', task);
  },
  
  delete: async (id: string) => {
    return fetchApi(`/cleaning/${id}`, 'DELETE');
  },
  
  saveBatch: async (tasks: any[]) => {
    return fetchApi('/cleaning/batch', 'POST', tasks);
  }
};
