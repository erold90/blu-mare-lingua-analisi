
// Re-export from the new Supabase module
export { useSupabaseReservations as useReservations } from './useSupabaseReservations';
export { SupabaseReservationsProvider as ReservationsProvider } from './useSupabaseReservations';

// Re-export types as well
export type { Reservation, Apartment } from './useSupabaseReservations';
