
/**
 * Error handling utilities for API responses
 */

import { ApiResponse } from "../types";
import { loadPersistentData } from "./persistence";

export function handleNonJsonResponse<T>(endpoint: string): ApiResponse<T> {
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
  
  if (endpoint.includes('/reservations')) {
    return loadPersistentData<T>('persistent_reservations');
  }
  
  if (endpoint.includes('/cleaning')) {
    return loadPersistentData<T>('persistent_cleaning_tasks');
  }
  
  return {
    success: false,
    error: `Risposta non valida dall'API: formato non JSON`
  };
}

export function handleServerUnavailable<T>(endpoint: string, method: string): ApiResponse<T> {
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
  
  if (endpoint.includes('/reservations') && method === 'GET') {
    return loadPersistentData<T>('persistent_reservations');
  }
  
  if (endpoint.includes('/cleaning') && method === 'GET') {
    return loadPersistentData<T>('persistent_cleaning_tasks');
  }

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
