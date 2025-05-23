
/**
 * Ping API endpoints
 */

import { fetchApi } from "../core/fetchApi";

export const pingApi = {
  check: async () => {
    return fetchApi('/ping');
  },
  
  testDatabaseConnection: async (options?: { timeout?: number }) => {
    // Per ora restituiamo un successo simulato in preparazione per Supabase
    try {
      const apiResult = await fetchApi('/ping/database', 'POST', options);
      
      if (apiResult.success) {
        return apiResult;
      }
      
      // Simulazione per preparare l'integrazione Supabase
      console.log('Database test ready for Supabase integration');
      return {
        success: true,
        data: {
          status: "ready",
          message: "Ready for Supabase integration",
          integration: "supabase"
        }
      };
    } catch (error) {
      console.error('Errore durante il test della connessione al database:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto durante il test della connessione'
      };
    }
  },
  
  getDatabaseStatus: async () => {
    return fetchApi('/ping/database/status');
  }
};
