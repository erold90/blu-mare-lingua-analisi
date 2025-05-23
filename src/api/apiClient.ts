/**
 * API Client per la comunicazione con il server
 */

// URL di base per le chiamate API
const API_BASE_URL = '/api';

// Tipi per le risposte API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Funzione generica per effettuare chiamate API
 */
async function fetchApi<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  timeout: number = 15000 // timeout aumentato a 15 secondi per connessioni più lente
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Crea un controller per gestire il timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Per inviare i cookie con la richiesta
      signal: controller.signal
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    console.log(`Calling API: ${method} ${url}`, body ? 'with data' : '');
    
    // Aggiungiamo un timestamp per evitare la cache
    const urlWithTimestamp = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
    const response = await fetch(urlWithTimestamp, options);
    clearTimeout(timeoutId); // Pulizia del timeout
    
    // Prima verifichiamo se la risposta è HTML invece di JSON (errore comune in sviluppo)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") === -1) {
      console.warn(`Risposta non JSON ricevuta da ${url}. Tipo di contenuto: ${contentType}`);
      
      // In ambiente di sviluppo, simuliamo una risposta di successo per alcune chiamate
      if (method === 'GET' && endpoint === '/ping') {
        // Fix: Usiamo casting esplicito per forzare il tipo
        return {
          success: true,
          data: { status: "ok", message: "API ping success (simulated)" } as unknown as T
        };
      }
      
      // Per le prenotazioni, ora creiamo una simulazione più persistente
      if (endpoint.includes('/reservations') && method === 'GET') {
        // Tentiamo di recuperare i dati salvati in localStorage se disponibile
        try {
          const storageKey = 'persistent_reservations';
          const storedData = localStorage.getItem(storageKey);
          if (storedData) {
            const reservations = JSON.parse(storedData);
            console.log('Utilizzando dati persistenti da localStorage:', reservations);
            return {
              success: true,
              data: reservations as unknown as T
            };
          }
        } catch (storageError) {
          console.error('Errore nel recuperare dati persistenti:', storageError);
        }
        
        return {
          success: true,
          data: [] as unknown as T // Array vuoto per le prenotazioni
        };
      }
      
      if (endpoint.includes('/cleaning') && method === 'GET') {
        try {
          const storageKey = 'persistent_cleaning_tasks';
          const storedData = localStorage.getItem(storageKey);
          if (storedData) {
            const tasks = JSON.parse(storedData);
            console.log('Utilizzando dati persistenti delle attività di pulizia:', tasks);
            return {
              success: true,
              data: tasks as unknown as T
            };
          }
        } catch (storageError) {
          console.error('Errore nel recuperare dati persistenti delle attività di pulizia:', storageError);
        }
        
        return {
          success: true,
          data: [] as unknown as T // Array vuoto per le attività di pulizia
        };
      }
      
      // Fallback ai dati locali
      throw new Error(`Risposta non valida dall'API: formato non JSON`);
    }
    
    // Controlla se la risposta è OK (status 200-299)
    if (!response.ok) {
      // Se abbiamo una risposta dal server ma con errore, proviamo a leggere il messaggio
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      } catch (jsonError) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
    }
    
    // Parsa la risposta come JSON
    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('API request timeout:', endpoint);
      return {
        success: false,
        error: 'Request timeout, please try again'
      };
    }
    
    console.error('API fetch error:', error);
    
    // In ambiente di sviluppo o quando il server non è disponibile,
    // possiamo simulare risposte per alcune chiamate specifiche
    if (endpoint === '/ping') {
      return {
        success: false,
        error: 'Connection failed, working in offline mode'
      };
    }
    
    // Per le prenotazioni, tentiamo di recuperare i dati salvati persistentemente
    if (endpoint.includes('/reservations') && method === 'GET') {
      try {
        const storageKey = 'persistent_reservations';
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
          const reservations = JSON.parse(storedData);
          console.log('Utilizzando dati persistenti da localStorage dopo errore API:', reservations);
          return {
            success: true,
            data: reservations as unknown as T
          };
        }
      } catch (storageError) {
        console.error('Errore nel recuperare dati persistenti:', storageError);
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Implementiamo un endpoint /ping per verificare la connessione al server
export const pingApi = {
  check: async () => {
    return fetchApi('/ping');
  },
  
  // Aggiungiamo una nuova funzione per testare la connessione al database
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
 * API per le attività di pulizia
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
