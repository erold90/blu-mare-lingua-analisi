
/**
 * API configuration and constants
 */

// URL di base per le chiamate API - ora punta al server remoto con fallback
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://villamareblu.it/api' 
  : 'http://localhost:3001/api'; // Modificato per usare il tunnel SSH locale

// Configurazione del database
export const DATABASE_CONFIG = {
  host: process.env.NODE_ENV === 'production' ? '31.11.39.219' : 'localhost', // Usa localhost quando in sviluppo (tunnel SSH)
  user: 'Sql1864200',
  password: '', // Questa dovrebbe essere impostata lato server per sicurezza
  database: 'Sql1864200_1',
  port: 3306
};

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
  console.error('Errore nel leggere lo stato della modalità offline:', e);
}
