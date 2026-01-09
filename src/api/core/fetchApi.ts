
/**
 * Core API fetch function with error handling and offline support
 */

import { toast } from "sonner";
import { ApiResponse, HttpMethod } from "../types";
import { API_BASE_URL, apiConnectionFailed, setApiConnectionFailed, offlineMode, setOfflineMode } from "../config";
import { handleServerUnavailable, handleNonJsonResponse } from "../utils/errorHandlers";
import { handleLocalStoragePersistence } from "../utils/persistence";

/**
 * Funzione generica per effettuare chiamate API con miglioramenti per la resilienza
 */
export async function fetchApi<T>(
  endpoint: string, 
  method: HttpMethod = 'GET',
  body?: any,
  timeout: number = 15000
): Promise<ApiResponse<T>> {
  // Se la modalità offline è attiva, usa solo dati locali
  if (offlineMode) {
    return handleServerUnavailable<T>(endpoint, method);
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
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      },
      credentials: 'omit',
      signal: controller.signal
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    
    try {
      const response = await fetch(url, options);
      clearTimeout(timeoutId);
      
      // Resettiamo il flag di connessione fallita
      if (apiConnectionFailed) {
        setApiConnectionFailed(false);
        if (!offlineMode) {
          toast.success('Connessione al server ripristinata');
        }
      }
      
      // Prima verifichiamo se la risposta è HTML invece di JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
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
      
      
      if (!apiConnectionFailed) {
        setApiConnectionFailed(true);
        toast.info('Modalità offline attivata', {
          description: 'L\'app funzionerà con dati locali'
        });
        setOfflineMode(true);
      }
      
      return handleServerUnavailable<T>(endpoint, method);
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout, please try again'
      };
    }
    
    return handleServerUnavailable<T>(endpoint, method);
  }
}
