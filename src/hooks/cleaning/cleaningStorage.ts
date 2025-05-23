
import { CleaningTask } from "./types";
import { discoveryStorage, DISCOVERY_STORAGE_KEYS } from "@/services/discoveryStorage";

export const loadCleaningTasks = (): CleaningTask[] => {
  try {
    const savedTasks = discoveryStorage.getItem<CleaningTask[]>(DISCOVERY_STORAGE_KEYS.CLEANING_TASKS);
    return savedTasks || [];
  } catch (error) {
    console.error("Errore nel parsing delle attività di pulizia:", error);
    return [];
  }
};

export const saveCleaningTasks = (tasks: CleaningTask[]): void => {
  discoveryStorage.setItem(DISCOVERY_STORAGE_KEYS.CLEANING_TASKS, tasks);
};
