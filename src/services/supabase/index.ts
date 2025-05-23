
export { apartmentsService } from './apartmentsService';
export { pricesService } from './pricesService';
export { reservationsService } from './reservationsService';
export { cleaningService } from './cleaningService';
export type { SupabaseError, ServiceResponse } from './types';

// Main service object for backward compatibility
export const supabaseService = {
  apartments: apartmentsService,
  prices: pricesService,
  reservations: reservationsService,
  cleaningTasks: cleaningService
};
