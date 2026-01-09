
/**
 * API configuration and constants
 */

// Configurazione per l'integrazione Supabase
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://villamareblu.it/api' 
  : 'http://localhost:3001/api';

// Flag per tenere traccia dei tentativi falliti di connessione API
export let apiConnectionFailed = false;
export let offlineMode = false;

export const setApiConnectionFailed = (failed: boolean) => {
  apiConnectionFailed = failed;
};

export const setOfflineMode = (offline: boolean) => {
  offlineMode = offline;
  localStorage.setItem('offline_mode', offline ? 'true' : 'false');
};

export const getOfflineMode = () => offlineMode;
export const getApiConnectionFailed = () => apiConnectionFailed;

// Inizializza la modalità offline in base allo stato salvato
try {
  offlineMode = localStorage.getItem('offline_mode') === 'true';
} catch (e) {
}
