
/**
 * Types for API responses and configurations
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface FetchOptions {
  endpoint: string;
  method?: HttpMethod;
  body?: any;
  timeout?: number;
}
