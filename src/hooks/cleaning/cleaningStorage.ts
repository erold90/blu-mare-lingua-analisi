
import { CleaningTask } from "./types";
import { externalStorage, DataType } from "@/services/externalStorage";

export const loadCleaningTasks = async (): Promise<CleaningTask[]> => {
  try {
    const tasks = await externalStorage.loadData<CleaningTask[]>(DataType.CLEANING_TASKS);
    return tasks || [];
  } catch (error) {
    console.error("Errore nel caricamento delle attività di pulizia:", error);
    return [];
  }
};

export const saveCleaningTasks = async (tasks: CleaningTask[]): Promise<void> => {
  try {
    await externalStorage.saveData(DataType.CLEANING_TASKS, tasks);
  } catch (error) {
    console.error("Errore nel salvataggio delle attività di pulizia:", error);
  }
};

// Force a sync of cleaning tasks
export const syncCleaningTasks = async (): Promise<void> => {
  try {
    await externalStorage.synchronize(DataType.CLEANING_TASKS);
  } catch (error) {
    console.error("Errore nella sincronizzazione delle attività di pulizia:", error);
    throw error;
  }
};
