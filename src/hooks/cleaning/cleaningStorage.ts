
import { CleaningTask } from "./types";

const STORAGE_KEY = "cleaningTasks";

export const loadCleaningTasks = (): CleaningTask[] => {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : [];
  } catch (error) {
    console.error("Errore nel parsing delle attività di pulizia:", error);
    return [];
  }
};

export const saveCleaningTasks = (tasks: CleaningTask[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};
