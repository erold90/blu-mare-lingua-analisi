
/**
 * LocalStorage persistence utilities
 */

import { ApiResponse } from "../types";

export function handleLocalStoragePersistence(method: string, endpoint: string, body?: any): void {
  if (method !== 'GET' && (endpoint.includes('/reservations') || endpoint.includes('/cleaning'))) {
    const persistentStorageKey = endpoint.includes('/reservations') 
      ? 'persistent_reservations' 
      : 'persistent_cleaning_tasks';
    
    try {
      if (method === 'POST' && body) {
        saveItemToPersistentStorage(persistentStorageKey, body);
      } else if (method === 'PUT' && body) {
        updateItemInPersistentStorage(persistentStorageKey, body);
      } else if (method === 'DELETE') {
        const id = endpoint.split('/').pop();
        if (id) {
          removeItemFromPersistentStorage(persistentStorageKey, id);
        }
      }
    } catch (storageError) {
    }
  }
}

export function loadPersistentData<T>(storageKey: string): ApiResponse<T> {
  try {
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      const data = JSON.parse(storedData);
      return {
        success: true,
        data: data as unknown as T
      };
    }
  } catch (storageError) {
  }
  
  return {
    success: true,
    data: [] as unknown as T
  };
}

function saveItemToPersistentStorage(storageKey: string, item: any): void {
  try {
    const storedData = localStorage.getItem(storageKey);
    let data = storedData ? JSON.parse(storedData) : [];
    data.push(item);
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
  }
}

function updateItemInPersistentStorage(storageKey: string, item: any): void {
  try {
    if (!item.id) {
      return;
    }
    
    const storedData = localStorage.getItem(storageKey);
    if (!storedData) return;
    
    let data = JSON.parse(storedData);
    const index = data.findIndex((i: any) => i.id === item.id);
    if (index >= 0) {
      data[index] = item;
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  } catch (error) {
  }
}

function removeItemFromPersistentStorage(storageKey: string, itemId: string): void {
  try {
    const storedData = localStorage.getItem(storageKey);
    if (!storedData) return;
    
    let data = JSON.parse(storedData);
    data = data.filter((i: any) => i.id !== itemId);
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
  }
}
