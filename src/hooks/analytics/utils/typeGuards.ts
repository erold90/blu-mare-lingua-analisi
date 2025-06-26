
// Type guards ottimizzati e sicuri per le operazioni Supabase
export interface SupabaseResponse<T = any> {
  data: T;
  error: any;
}

export interface SupabaseCountResponse<T = any> extends SupabaseResponse<T> {
  count: number | null;
}

export interface OptimizedVisitCounts {
  visits_today: number;
  visits_month: number;
  visits_year: number;
}

// Type guard robusto per risposte Supabase
export const isSupabaseResponse = (result: any): result is SupabaseResponse => {
  return result && 
         typeof result === 'object' && 
         'data' in result && 
         'error' in result;
};

// Type guard per risposte con count
export const isSupabaseCountResponse = (result: any): result is SupabaseCountResponse => {
  return isSupabaseResponse(result) && 
         'count' in result && 
         (result.count === null || typeof result.count === 'number');
};

// Type guard per conteggi ottimizzati
export const isOptimizedVisitCounts = (data: any): data is OptimizedVisitCounts => {
  return data && 
         typeof data === 'object' &&
         typeof data.visits_today === 'number' &&
         typeof data.visits_month === 'number' &&
         typeof data.visits_year === 'number';
};

// Validatore per pagine URL
export const isValidPageUrl = (page: string): boolean => {
  if (!page || typeof page !== 'string') return false;
  if (page.length > 500) return false; // Limite ragionevole
  
  // Skip admin areas
  if (page.includes('/area-riservata') || page.includes('/admin')) return false;
  
  return true;
};

// Sanitizzatore URL
export const sanitizePageUrl = (page: string): string => {
  if (!page) return '/';
  
  // Rimuovi parametri sensibili
  const url = new URL(page, window.location.origin);
  const cleanedPath = url.pathname;
  
  // Mantieni solo query params safe
  const safeParams = new URLSearchParams();
  for (const [key, value] of url.searchParams) {
    if (!key.toLowerCase().includes('token') && 
        !key.toLowerCase().includes('password') &&
        !key.toLowerCase().includes('secret')) {
      safeParams.set(key, value);
    }
  }
  
  return cleanedPath + (safeParams.toString() ? '?' + safeParams.toString() : '');
};
