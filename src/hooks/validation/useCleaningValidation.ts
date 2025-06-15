
import { CleaningTask } from "@/hooks/useCleaningManagement";
import { toast } from "sonner";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function useCleaningValidation() {
  const validateTaskDate = (date: string): ValidationResult => {
    const errors: string[] = [];
    const taskDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (taskDate < today) {
      errors.push("Non è possibile creare attività nel passato");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateTaskConflicts = (
    newTask: Omit<CleaningTask, "id" | "createdAt" | "updatedAt">,
    existingTasks: CleaningTask[]
  ): ValidationResult => {
    const errors: string[] = [];
    
    // Check for overlapping tasks on same apartment and date
    const conflictingTasks = existingTasks.filter(task => 
      task.apartmentId === newTask.apartmentId &&
      task.taskDate === newTask.taskDate &&
      task.status !== 'cancelled'
    );
    
    if (conflictingTasks.length > 0) {
      errors.push(`Esiste già un'attività per ${newTask.apartmentName} in questa data`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateTaskDuration = (duration: number): ValidationResult => {
    const errors: string[] = [];
    
    if (duration <= 0) {
      errors.push("La durata deve essere maggiore di 0 minuti");
    }
    
    if (duration > 480) { // 8 hours
      errors.push("La durata non può superare le 8 ore");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateBeforeCreate = (
    task: Omit<CleaningTask, "id" | "createdAt" | "updatedAt">,
    existingTasks: CleaningTask[]
  ): boolean => {
    const dateValidation = validateTaskDate(task.taskDate);
    const conflictValidation = validateTaskConflicts(task, existingTasks);
    const durationValidation = validateTaskDuration(task.estimatedDuration || 60);
    
    const allErrors = [
      ...dateValidation.errors,
      ...conflictValidation.errors,
      ...durationValidation.errors
    ];
    
    if (allErrors.length > 0) {
      allErrors.forEach(error => toast.error(error));
      return false;
    }
    
    return true;
  };

  return {
    validateTaskDate,
    validateTaskConflicts,
    validateTaskDuration,
    validateBeforeCreate
  };
}
