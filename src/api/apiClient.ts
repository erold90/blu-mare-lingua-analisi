
/**
 * API Client - Main export file
 * Exports all API endpoints and utilities from modular structure
 */

// Export all API endpoints
export { reservationsApi } from './endpoints/reservations';
export { apartmentsApi } from './endpoints/apartments';
export { pricesApi } from './endpoints/prices';
export { syncApi } from './endpoints/sync';
export { systemApi } from './endpoints/system';

// Export utilities
export { checkServerStatus, setOfflineModeManual as setOfflineMode, isOfflineMode } from './utils/serverStatus';

// Export types
export type { ApiResponse, HttpMethod } from './types';
