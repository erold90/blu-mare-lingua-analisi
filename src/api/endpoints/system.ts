
/**
 * System API endpoints
 */

import { pingApi } from "./ping";
import { syncApi } from "./sync";

export const systemApi = {
  forceSyncAllData: async () => {
    const dbTest = await pingApi.testDatabaseConnection();
    
    if (!dbTest.success) {
      return {
        success: false,
        error: 'Database non raggiungibile, impossibile sincronizzare'
      };
    }
    
    try {
      const reservationsSync = await syncApi.syncData('reservations');
      const cleaningSync = await syncApi.syncData('cleaning');
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
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante la sincronizzazione'
      };
    }
  }
};
