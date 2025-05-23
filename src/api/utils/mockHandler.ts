
/**
 * Mock database request handler
 */

import { ApiResponse } from "../types";
import { MockDatabaseService } from "@/utils/mockDatabaseService";
import { DataType } from "@/services/externalStorage";

export function handleMockDatabaseRequest<T>(endpoint: string, method: string, body?: any): ApiResponse<T> {
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
    let dataType;
    if (endpoint.includes('reservations')) dataType = DataType.RESERVATIONS;
    else if (endpoint.includes('cleaning')) dataType = DataType.CLEANING_TASKS;
    else if (endpoint.includes('apartments')) dataType = DataType.APARTMENTS;
    else if (endpoint.includes('prices')) dataType = DataType.PRICES;
    
    if (dataType) {
      MockDatabaseService.synchronize(dataType);
    } else {
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
  
  return {
    success: true,
    data: { message: "Operazione simulata completata" } as unknown as T
  };
}
