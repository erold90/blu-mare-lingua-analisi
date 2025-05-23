
/**
 * Ping API endpoints
 */

import { fetchApi } from "../core/fetchApi";

export const pingApi = {
  check: async () => {
    return fetchApi('/ping');
  },
  
  testDatabaseConnection: async () => {
    return fetchApi('/ping/database');
  }
};
