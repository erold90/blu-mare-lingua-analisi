
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface ServiceResponse<T> {
  data?: T;
  error?: SupabaseError;
}
