// Temporary fix for build errors during admin cleanup
// This file helps bypass old admin files during the reconstruction

export const ADMIN_REBUILD_MODE = true;

// Redirect all old admin imports to safe defaults
export const safeAdminImport = () => ({
  reservations: [],
  loading: false,
  error: null,
  apartments: [],
  refreshData: () => Promise.resolve(),
  isLoading: false,
  getApartmentAvailability: () => true,
  addReservation: () => Promise.resolve({ data: null, error: null }),
  updateReservation: () => Promise.resolve({ data: null, error: null }),
  deleteReservation: () => Promise.resolve({ error: null }),
  fetchReservations: () => Promise.resolve(),
});

// Safe default for CleaningTask
export interface SafeCleaningTask {
  id: string;
  apartment_id: string;
  status: string;
  priority: string;
  task_date: string;
  task_type: string;
  assignee?: string;
  notes?: string;
}

export const safeCleaningData = (): SafeCleaningTask[] => [];