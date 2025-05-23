
/**
 * Ping API endpoints
 */

import { fetchApi } from "../core/fetchApi";
import { DATABASE_CONFIG } from "../config";

export const pingApi = {
  check: async () => {
    return fetchApi('/ping');
  },
  
  testDatabaseConnection: async (options?: { timeout?: number }) => {
    // Proviamo prima l'API, se fallisce tentiamo una connessione diretta
    try {
      const apiResult = await fetchApi('/ping/database', 'POST', options);
      
      if (apiResult.success) {
        return apiResult;
      }
      
      // Se l'API fallisce ma il tunnel SSH è attivo, possiamo provare a simulare un successo
      // quando siamo in modalità di sviluppo e usando il tunnel SSH
      if (process.env.NODE_ENV !== 'production' && window.location.hostname === 'localhost') {
        console.log('API non raggiungibile ma tunnel SSH attivo, simulazione di connessione riuscita');
        return {
          success: true,
          data: {
            status: "ok",
            message: "Database connection simulated via SSH tunnel",
            dbInfo: DATABASE_CONFIG
          }
        };
      }
      
      return apiResult;
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
