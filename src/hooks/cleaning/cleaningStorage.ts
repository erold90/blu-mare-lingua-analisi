import { CleaningTask } from '../useCleaningManagement';

const STORAGE_KEY = 'vmb_cleaning_tasks';

// Carica attività di pulizia dal localStorage
export const loadCleaningTasks = async (): Promise<CleaningTask[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error loading cleaning tasks from localStorage:', error);
    return [];
  }
};

// Salva attività di pulizia nel localStorage
export const saveCleaningTasks = async (tasks: CleaningTask[]): Promise<void> => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    localStorage.setItem('last_sync_CLEANING_TASKS', Date.now().toString());
  } catch (error) {
    console.error('Error saving cleaning tasks to localStorage:', error);
  }
};

// Sincronizza attività di pulizia
export const syncCleaningTasks = async (): Promise<void> => {
  // Placeholder per sincronizzazione futura
  console.log('Syncing cleaning tasks...');
};
