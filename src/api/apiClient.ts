/**
 * API Client per la comunicazione con il server
 */

// URL di base per le chiamate API - ora punta al server remoto con fallback
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://villamareblu.it/api' 
  : 'http://31.11.39.219:3001/api';

// Import necessario per MockDatabaseService e DataType
import { MockDatabaseService } from "@/utils/mockDatabaseService";
import { DataType } from "@/services/externalStorage";
import { toast } from "sonner";

// Tipi per le risposte API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Flag per tenere traccia dei tentativi falliti di connessione API
let apiConnectionFailed = false;
let offlineMode = false;

/**
 * Funzione generica per effettuare chiamate API con miglioramenti per la resilienza
 */
async function fetchApi<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  timeout: number = 15000 // timeout aumentato a 15 secondi
): Promise<ApiResponse<T>> {
  // Se la modalità offline è attiva, usa solo il database simulato
  if (offlineMode) {
    return handleMockDatabaseRequest<T>(endpoint, method, body);
  }

  // Se la modalità mock è attiva e l'endpoint è rilevante, usa il database simulato
  if (MockDatabaseService.isActive()) {
    return handleMockDatabaseRequest<T>(endpoint, method, body);
  }
  
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Crea un controller per gestire il timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Aggiungiamo header aggiuntivi per CORS
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      },
      credentials: 'omit', // Per richieste cross-origin
      signal: controller.signal
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    console.log(`Calling API: ${method} ${url}`, body ? 'with data' : '');
    
    try {
      const response = await fetch(url, options);
      clearTimeout(timeoutId);
      
      // Resettiamo il flag di connessione fallita
      if (apiConnectionFailed) {
        console.log('Connessione API ripristinata');
        apiConnectionFailed = false;
        if (!offlineMode) {
          toast.success('Connessione al server ripristinata');
        }
      }
      
      // Prima verifichiamo se la risposta è HTML invece di JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
        console.warn(`Risposta non JSON ricevuta da ${url}. Tipo di contenuto: ${contentType}`);
        
        // Fallback per specifici endpoint
        return handleNonJsonResponse<T>(endpoint);
      }
      
      // Controlla se la risposta è OK (status 200-299)
      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `API error: ${response.status}`);
        } catch (jsonError) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
      }
      
      // Parsa la risposta come JSON
      const data = await response.json();
      
      // Se è un endpoint di modifica (POST/PUT/DELETE), salviamo anche in localStorage
      handleLocalStoragePersistence(method, endpoint, body);
      
      return {
        success: true,
        data
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Se il server remoto non è raggiungibile, logga l'errore
      console.error(`Server remoto ${API_BASE_URL} non raggiungibile:`, fetchError);
      
      // Imposta il flag di connessione fallita
      if (!apiConnectionFailed) {
        apiConnectionFailed = true;
        toast.error('Connessione al server persa, passaggio a modalità offline', {
          description: 'L\'app funzionerà con dati locali fino al ripristino della connessione'
        });
        offlineMode = true;
      }
      
      // Ritorna ai dati mockati in caso di errore
      return handleServerUnavailable<T>(endpoint, method);
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('API request timeout:', endpoint);
      return {
        success: false,
        error: 'Request timeout, please try again'
      };
    }
    
    console.error('API fetch error:', error);
    
    // Fallback per vari tipi di endpoint
    return handleServerUnavailable<T>(endpoint, method);
  }
}

/**
 * Gestisce richieste al database mockato
 */
function handleMockDatabaseRequest<T>(endpoint: string, method: string, body?: any): ApiResponse<T> {
  console.log(`Usando database simulato per ${endpoint}`);
  
  if (endpoint === '/ping' || endpoint === '/ping/database') {
    return {
      success: true,
      data: { status: "ok", message: "Mock database connection success" } as unknown as T
    };
  }
  
  // Per gli endpoint di dati, usa il database simulato appropriato
  if (endpoint.includes('/reservations') && method === 'GET') {
    const data = MockDatabaseService.loadData(DataType.RESERVATIONS);
    return {
      success: true,
      data: data as unknown as T
    };
  }
  
  if (endpoint.includes('/cleaning') && method === 'GET') {
    const data = MockDatabaseService.loadData(DataType.CLEANING_TASKS);
    return {
      success: true,
      data: data as unknown as T
    };
  }
  
  if (endpoint.includes('/apartments') && method === 'GET') {
    const data = MockDatabaseService.loadData(DataType.APARTMENTS);
    return {
      success: true,
      data: data as unknown as T
    };
  }
  
  if (endpoint.includes('/sync') && method === 'POST') {
    console.log('Simulazione sincronizzazione per', endpoint);
    // Estrai il tipo di dati dall'endpoint
    let dataType;
    if (endpoint.includes('reservations')) dataType = DataType.RESERVATIONS;
    else if (endpoint.includes('cleaning')) dataType = DataType.CLEANING_TASKS;
    else if (endpoint.includes('apartments')) dataType = DataType.APARTMENTS;
    else if (endpoint.includes('prices')) dataType = DataType.PRICES;
    
    if (dataType) {
      MockDatabaseService.synchronize(dataType);
    } else {
      // Sincronizza tutto
      MockDatabaseService.synchronize(DataType.RESERVATIONS);
      MockDatabaseService.synchronize(DataType.CLEANING_TASKS);
      MockDatabaseService.synchronize(DataType.APARTMENTS);
      MockDatabaseService.synchronize(DataType.PRICES);
    }
    
    return {
      success: true,
      data: { message: "Sincronizzazione simulata completata" } as unknown as T
    };
  }
  
  // Implementazione base per altri tipi di richieste
  return {
    success: true,
    data: { message: "Operazione simulata completata" } as unknown as T
  };
}

/**
 * Gestisce risposte non-JSON quando il server è configurato male o non risponde correttamente
 */
function handleNonJsonResponse<T>(endpoint: string): ApiResponse<T> {
  // Se siamo in sviluppo e il server remoto non risponde, usa fallback locale
  if (endpoint === '/ping') {
    return {
      success: true,
      data: { status: "ok", message: "API ping success (fallback)" } as unknown as T
    };
  }
  
  if (endpoint === '/ping/database') {
    console.log("Test database remoto fallito, verifica che il server sia attivo");
    return {
      success: false,
      error: "Remote database connection failed - check server status"
    };
  }
  
  // Per le prenotazioni, simulazione con memoria persistente
  if (endpoint.includes('/reservations')) {
    return loadPersistentData<T>('persistent_reservations');
  }
  
  // Per le attività di pulizia, stessa simulazione
  if (endpoint.includes('/cleaning')) {
    return loadPersistentData<T>('persistent_cleaning_tasks');
  }
  
  // Fallback ai dati locali
  return {
    success: false,
    error: `Risposta non valida dall'API: formato non JSON`
  };
}

/**
 * Gestisce il caso in cui il server non sia disponibile
 */
function handleServerUnavailable<T>(endpoint: string, method: string): ApiResponse<T> {
  // In ambiente di sviluppo o quando il server non è disponibile,
  // possiamo simulare risposte per alcune chiamate specifiche
  if (endpoint === '/ping') {
    return {
      success: false,
      error: 'Connection failed, working in offline mode'
    };
  }
  
  if (endpoint === '/ping/database') {
    return {
      success: false,
      error: 'Database connection failed'
    };
  }
  
  // Per le prenotazioni, tentiamo di recuperare i dati salvati persistentemente
  if (endpoint.includes('/reservations') && method === 'GET') {
    return loadPersistentData<T>('persistent_reservations');
  }
  
  // Stessa cosa per le attività di pulizia
  if (endpoint.includes('/cleaning') && method === 'GET') {
    return loadPersistentData<T>('persistent_cleaning_tasks');
  }

  // Carica dati simulati per gli appartamenti
  if (endpoint.includes('/apartments') && method === 'GET') {
    const mockData = localStorage.getItem('mock_apartments_data');
    if (mockData) {
      try {
        return {
          success: true,
          data: JSON.parse(mockData) as unknown as T
        };
      } catch (e) {
        console.error('Errore nel parsing dei dati degli appartamenti:', e);
      }
    }
  }
  
  return {
    success: false,
    error: 'Server non raggiungibile, modalità offline attiva'
  };
}

/**
 * Gestisce la persistenza in localStorage per operazioni di modifica
 */
function handleLocalStoragePersistence(method: string, endpoint: string, body?: any): void {
  // Se è un endpoint di modifica (POST/PUT/DELETE), salviamo anche in localStorage
  if (method !== 'GET' && (endpoint.includes('/reservations') || endpoint.includes('/cleaning'))) {
    const persistentStorageKey = endpoint.includes('/reservations') 
      ? 'persistent_reservations' 
      : 'persistent_cleaning_tasks';
    
    try {
      // Per le richieste POST di nuovi elementi, salva il nuovo dato
      if (method === 'POST' && body) {
        saveItemToPersistentStorage(persistentStorageKey, body);
      }
      // Per le richieste PUT di aggiornamento, aggiorna l'elemento esistente
      else if (method === 'PUT' && body) {
        updateItemInPersistentStorage(persistentStorageKey, body);
      }
      // Per le richieste DELETE, rimuovi l'elemento
      else if (method === 'DELETE') {
        const id = endpoint.split('/').pop();
        if (id) {
          removeItemFromPersistentStorage(persistentStorageKey, id);
        }
      }
    } catch (storageError) {
      console.error('Errore nel salvare dati persistenti dopo modifica:', storageError);
    }
  }
}

/**
 * Carica dati persistenti da localStorage
 */
function loadPersistentData<T>(storageKey: string): ApiResponse<T> {
  try {
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      const data = JSON.parse(storedData);
      console.log(`Utilizzando dati persistenti da localStorage (${storageKey}):`, data);
      return {
        success: true,
        data: data as unknown as T
      };
    }
  } catch (storageError) {
    console.error(`Errore nel recuperare dati persistenti (${storageKey}):`, storageError);
  }
  
  return {
    success: true,
    data: [] as unknown as T
  };
}

/**
 * Salva un nuovo elemento nei dati persistenti
 */
function saveItemToPersistentStorage(storageKey: string, item: any): void {
  try {
    const storedData = localStorage.getItem(storageKey);
    let data = storedData ? JSON.parse(storedData) : [];
    
    // Aggiungi il nuovo elemento
    data.push(item);
    
    localStorage.setItem(storageKey, JSON.stringify(data));
    console.log(`Elemento aggiunto a ${storageKey}`, item);
  } catch (error) {
    console.error(`Errore nel salvare nuovo elemento in ${storageKey}:`, error);
  }
}

/**
 * Aggiorna un elemento nei dati persistenti
 */
function updateItemInPersistentStorage(storageKey: string, item: any): void {
  try {
    if (!item.id) {
      console.error(`Impossibile aggiornare elemento senza id in ${storageKey}`);
      return;
    }
    
    const storedData = localStorage.getItem(storageKey);
    if (!storedData) return;
    
    let data = JSON.parse(storedData);
    
    // Trova e aggiorna l'elemento
    const index = data.findIndex((i: any) => i.id === item.id);
    if (index >= 0) {
      data[index] = item;
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log(`Elemento aggiornato in ${storageKey}`, item);
    }
  } catch (error) {
    console.error(`Errore nell'aggiornare elemento in ${storageKey}:`, error);
  }
}

/**
 * Rimuove un elemento dai dati persistenti
 */
function removeItemFromPersistentStorage(storageKey: string, itemId: string): void {
  try {
    const storedData = localStorage.getItem(storageKey);
    if (!storedData) return;
    
    let data = JSON.parse(storedData);
    
    // Filtra via l'elemento con l'ID specificato
    data = data.filter((i: any) => i.id !== itemId);
    
    localStorage.setItem(storageKey, JSON.stringify(data));
    console.log(`Elemento rimosso da ${storageKey}`, itemId);
  } catch (error) {
    console.error(`Errore nel rimuovere elemento da ${storageKey}:`, error);
  }
}

// Implementiamo un endpoint /ping per verificare la connessione al server
export const pingApi = {
  check: async () => {
    return fetchApi('/ping');
  },
  
  // Test dedicato della connessione al database
  testDatabaseConnection: async () => {
    return fetchApi('/ping/database');
  }
};

/**
 * API per le prenotazioni
 */
export const reservationsApi = {
  getAll: async () => {
    return fetchApi('/reservations');
  },
  
  getById: async (id: string) => {
    return fetchApi(`/reservations/${id}`);
  },
  
  create: async (reservation: any) => {
    return fetchApi('/reservations', 'POST', reservation);
  },
  
  update: async (id: string, reservation: any) => {
    return fetchApi(`/reservations/${id}`, 'PUT', reservation);
  },
  
  delete: async (id: string) => {
    return fetchApi(`/reservations/${id}`, 'DELETE');
  }
};

/**
 * API per le attività di pulizia con supporto migliorato per batch
 */
export const cleaningApi = {
  getAll: async () => {
    return fetchApi('/cleaning');
  },
  
  getById: async (id: string) => {
    return fetchApi(`/cleaning/${id}`);
  },
  
  create: async (task: any) => {
    return fetchApi('/cleaning', 'POST', task);
  },
  
  update: async (id: string, task: any) => {
    return fetchApi(`/cleaning/${id}`, 'PUT', task);
  },
  
  delete: async (id: string) => {
    return fetchApi(`/cleaning/${id}`, 'DELETE');
  },
  
  // Nuovo metodo per il salvataggio batch
  saveBatch: async (tasks: any[]) => {
    return fetchApi('/cleaning/batch', 'POST', tasks);
  }
};

/**
 * API per gli appartamenti
 */
export const apartmentsApi = {
  getAll: async () => {
    return fetchApi('/apartments');
  },
  
  getById: async (id: string) => {
    return fetchApi(`/apartments/${id}`);
  },
  
  update: async (id: string, apartment: any) => {
    return fetchApi(`/apartments/${id}`, 'PUT', apartment);
  }
};

/**
 * API per i prezzi
 */
export const pricesApi = {
  getByYear: async (year: number) => {
    return fetchApi(`/prices/${year}`);
  },
  
  update: async (year: number, prices: any) => {
    return fetchApi(`/prices/${year}`, 'PUT', prices);
  }
};

/**
 * API generica per la sincronizzazione
 */
export const syncApi = {
  syncAll: async () => {
    return fetchApi('/sync', 'POST');
  },
  
  syncData: async (dataType: string) => {
    return fetchApi(`/sync/${dataType}`, 'POST');
  }
};

/**
 * API per la sincronizzazione forzata e verifica connessione
 */
export const systemApi = {
  /**
   * Verifica e forza la sincronizzazione dei dati con il database
   */
  forceSyncAllData: async () => {
    // Prima verifica la connessione al database
    const dbTest = await pingApi.testDatabaseConnection();
    
    if (!dbTest.success) {
      return {
        success: false,
        error: 'Database non raggiungibile, impossibile sincronizzare'
      };
    }
    
    // Poi sincronizza tutti i tipi di dati
    try {
      // Prenotazioni
      const reservationsSync = await syncApi.syncData('reservations');
      
      // Attività di pulizia
      const cleaningSync = await syncApi.syncData('cleaning');
      
      // Appartamenti
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

/**
 * Funzione per controllare lo stato del server e passare automaticamente alla modalità offline
 */
export const checkServerStatus = async () => {
  try {
    const pingResult = await pingApi.check();
    
    // Se il ping ha successo ma siamo in modalità offline, ripristiniamo la modalità online
    if (pingResult.success && offlineMode) {
      offlineMode = false;
      toast.success('Connessione al server ripristinata', {
        description: 'L\'app è tornata alla modalità online'
      });
    }
    
    return pingResult;
  } catch (error) {
    // Se il ping fallisce e non siamo ancora in modalità offline, attiviamola
    if (!offlineMode) {
      offlineMode = true;
      toast.warning('Passaggio automatico alla modalità offline', {
        description: 'L\'app funzionerà con dati locali fino al ripristino della connessione'
      });
    }
    
    return {
      success: false,
      error: 'Server non raggiungibile, modalità offline attiva'
    };
  }
};

/**
 * Forza la modalità offline o online
 */
export const setOfflineMode = (offline: boolean) => {
  offlineMode = offline;
  localStorage.setItem('offline_mode', offline ? 'true' : 'false');
  
  if (offline) {
    toast.info('Modalità offline attivata', {
      description: 'L\'app funzionerà solo con dati locali'
    });
  } else {
    toast.info('Modalità offline disattivata', {
      description: 'L\'app tenterà di connettersi al server'
    });
    
    // Verifica immediatamente se il server è disponibile
    checkServerStatus();
  }
  
  return offlineMode;
};

/**
 * Controlla se è attiva la modalità offline
 */
export const isOfflineMode = () => {
  return offlineMode;
};

// Inizializza la modalità offline in base allo stato salvato
try {
  offlineMode = localStorage.getItem('offline_mode') === 'true';
} catch (e) {
  console.error('Errore nel leggere lo stato della modalità offline:', e);
}

// Esporta tutte le API esistenti
export {
  pingApi,
  reservationsApi,
  cleaningApi,
  apartmentsApi,
  pricesApi,
  syncApi,
  systemApi
};
