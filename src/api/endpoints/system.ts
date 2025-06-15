
/**
 * System API endpoints
 */

import { fetchApi } from "../core/fetchApi";
import { syncApi } from "./sync";

export const systemApi = {
  getStatus: async () => {
    return fetchApi('/system/status');
  },
  
  forceSyncAllData: async () => {
    try {
      // Prima proviamo con l'endpoint unificato se disponibile
      const syncResult = await fetchApi('/system/sync/all', 'POST');
      
      if (syncResult.success) {
        return syncResult;
      }
      
      // Se l'endpoint unificato fallisce, proviamo con i singoli endpoint
      console.log('Endpoint unificato fallito, provo con i singoli endpoint');
      const reservationsSync = await syncApi.syncData('reservations');
      const cleaningSync = await syncApi.syncData('cleaning_tasks');
      const apartmentsSync = await syncApi.syncData('apartments');
      
      return {
        success: true,
        data: {
          reservationsSync: reservationsSync.success,
          cleaningSync: cleaningSync.success,
          apartmentsSync: apartmentsSync.success
        }
      };
    } catch (error) {
      console.error('Errore durante la sincronizzazione:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante la sincronizzazione'
      };
    }
  },
  
  getSystemInfo: async () => {
    return fetchApi('/system/info');
  },
  
  rebootApplication: async () => {
    return fetchApi('/system/reboot', 'POST');
  }
};
