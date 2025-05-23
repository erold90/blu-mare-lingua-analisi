
// Re-export from the adapter that maintains compatibility
export { useCleaningManagementAdapter as useCleaningManagement } from '../useCleaningManagementAdapter';
export type { CleaningTask } from '../useCleaningManagementAdapter';

// Also re-export the context type for compatibility
export type { CleaningContextType } from './types';
