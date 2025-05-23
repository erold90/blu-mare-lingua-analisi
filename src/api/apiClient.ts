
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
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' // Per inviare i cookie con la richiesta
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    console.log(`Calling API: ${method} ${url}`);
    const response = await fetch(url, options);
    
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
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

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
