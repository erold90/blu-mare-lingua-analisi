
/**
 * System API endpoints
 */

import { fetchApi } from "../core/fetchApi";

export const systemApi = {
  getStatus: async () => {
    return fetchApi('/system/status');
  },
  
  forceSyncAllData: async () => {
    return fetchApi('/system/sync/all', 'POST');
  },
  
  getSystemInfo: async () => {
    return fetchApi('/system/info');
  },
  
  rebootApplication: async () => {
    return fetchApi('/system/reboot', 'POST');
  }
};
