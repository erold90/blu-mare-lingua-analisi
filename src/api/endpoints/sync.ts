
/**
 * Sync API endpoints
 */

import { fetchApi } from "../core/fetchApi";

export const syncApi = {
  syncAll: async () => {
    return fetchApi('/sync', 'POST');
  },
  
  syncData: async (dataType: string) => {
    return fetchApi(`/sync/${dataType}`, 'POST');
  }
};
