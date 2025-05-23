
/**
 * Ping API endpoints
 */

import { fetchApi } from "../core/fetchApi";

export const pingApi = {
  check: async () => {
    return fetchApi('/ping');
  },
  
  testDatabaseConnection: async (options?: { timeout?: number }) => {
    return fetchApi('/ping/database', 'POST', options);
  },
  
  getDatabaseStatus: async () => {
    return fetchApi('/ping/database/status');
  }
};
