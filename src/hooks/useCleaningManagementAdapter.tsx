import { useCallback } from 'react';
import { useSupabaseCleaningManagement, CleaningTask as SupabaseCleaningTask } from './useSupabaseCleaningManagement';
import { useReservations } from './useReservations';
import { generateTasksFromReservationsUtil } from './cleaning/cleaningOperations';
import { format } from 'date-fns';

// Transform Supabase CleaningTask to the old interface
export interface CleaningTask {
  id: string;
  apartmentId: string;
  apartmentName: string;
  checkoutDate?: string;
  checkinDate?: string;
  date: string;
  status: "pending" | "inProgress" | "completed" | "cancelled";
  type?: "checkout" | "checkin" | "maintenance" | "deep";
  priority?: "low" | "medium" | "high" | "urgent";
  notes?: string;
  assignedTo?: string;
  lastUpdated?: number;
  syncId?: string;
  deviceId?: string;
}

// Transform Supabase task to old format
const transformSupabaseTask = (task: SupabaseCleaningTask): CleaningTask => ({
  id: task.id,
  apartmentId: task.apartment_id,
  apartmentName: '', // Will be populated by apartment lookup
  date: task.task_date,
  status: task.status === "in_progress" ? "inProgress" : 
          task.status === "pending" ? "pending" :
          task.status === "completed" ? "completed" : "cancelled",
  type: task.task_type === 'checkout' ? 'checkout' : 
        task.task_type === 'maintenance' ? 'maintenance' : 
        task.task_type === 'deep_clean' ? 'deep' : 'checkout',
  priority: task.priority as "low" | "medium" | "high" | "urgent",
  notes: task.notes,
  assignedTo: task.assignee,
  deviceId: task.device_id
});

// Transform old task to Supabase format
const transformToSupabaseTask = (task: Omit<CleaningTask, "id">): Omit<SupabaseCleaningTask, "id" | "createdAt" | "updatedAt"> => ({
  apartmentId: task.apartmentId,
  taskDate: task.date,
  taskType: task.type === 'checkout' ? 'checkout' : 
           task.type === 'maintenance' ? 'maintenance' : 
           task.type === 'deep' ? 'deep_clean' : 'checkout',
  status: task.status === "inProgress" ? "in_progress" : 
          task.status === "pending" ? "pending" :
          task.status === "completed" ? "completed" : "cancelled",
  priority: task.priority || 'medium',
  assignee: task.assignedTo,
  notes: task.notes,
  estimatedDuration: 60
});

export const useCleaningManagementAdapter = () => {
  const { 
    cleaningTasks: supabaseTasks, 
    isLoading, 
    addCleaningTask, 
    updateCleaningTask, 
    deleteCleaningTask,
    refreshData
  } = useSupabaseCleaningManagement();
  
  const { reservations, apartments } = useReservations();

  // Transform Supabase tasks to old format
  const cleaningTasks: CleaningTask[] = supabaseTasks.map(task => {
    const apartment = apartments.find(apt => apt.id === task.apartmentId);
    const transformed = transformSupabaseTask(task);
    return {
      ...transformed,
      apartmentName: apartment?.name || ''
    };
  });

  const addTask = useCallback(async (task: Omit<CleaningTask, "id">) => {
    const supabaseTask = transformToSupabaseTask(task);
    await addCleaningTask(supabaseTask);
  }, [addCleaningTask]);

  const updateTaskStatus = useCallback(async (id: string, status: CleaningTask["status"]) => {
    const existingTask = supabaseTasks.find(t => t.id === id);
    if (existingTask) {
      const supabaseStatus: SupabaseCleaningTask["status"] = 
        status === "inProgress" ? "in_progress" : 
        status === "pending" ? "pending" :
        status === "completed" ? "completed" : "cancelled";
      
      await updateCleaningTask({
        ...existingTask,
        status: supabaseStatus
      });
    }
  }, [supabaseTasks, updateCleaningTask]);

  const updateTaskNotes = useCallback(async (id: string, notes: string) => {
    const existingTask = supabaseTasks.find(t => t.id === id);
    if (existingTask) {
      await updateCleaningTask({
        ...existingTask,
        notes
      });
    }
  }, [supabaseTasks, updateCleaningTask]);

  const updateTaskAssignment = useCallback(async (id: string, assignedTo: string) => {
    const existingTask = supabaseTasks.find(t => t.id === id);
    if (existingTask) {
      await updateCleaningTask({
        ...existingTask,
        assignee: assignedTo
      });
    }
  }, [supabaseTasks, updateCleaningTask]);

  const deleteTask = useCallback(async (id: string) => {
    await deleteCleaningTask(id);
  }, [deleteCleaningTask]);

  const generateTasksFromReservations = useCallback(async () => {
    const newTasks = generateTasksFromReservationsUtil(reservations, apartments, cleaningTasks);
    
    for (const task of newTasks) {
      await addTask(task);
    }
  }, [reservations, apartments, cleaningTasks, addTask]);

  const getTasksByDate = useCallback((date: Date): CleaningTask[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return cleaningTasks.filter(task => 
      format(new Date(task.date), 'yyyy-MM-dd') === dateStr
    );
  }, [cleaningTasks]);

  const getTasksByApartmentId = useCallback((apartmentId: string): CleaningTask[] => {
    return cleaningTasks.filter(task => task.apartmentId === apartmentId);
  }, [cleaningTasks]);

  return {
    cleaningTasks,
    addTask,
    updateTaskStatus,
    updateTaskNotes,
    updateTaskAssignment,
    deleteTask,
    generateTasksFromReservations,
    getTasksByDate,
    getTasksByApartmentId,
    refreshTasks: refreshData,
    isLoading
  };
};
