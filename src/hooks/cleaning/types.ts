
// Cleaning types - unified with Supabase
export interface CleaningTask {
  id: string;
  apartmentId: string;
  taskDate: string;
  taskType: 'checkout' | 'checkin' | 'maintenance' | 'deep' | 'inspection';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration?: number;
  actualDuration?: number;
  assignee?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  deviceId?: string;
}

export interface CleaningContextType {
  cleaningTasks: CleaningTask[];
  isLoading: boolean;
  addTask: (task: Omit<CleaningTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateTaskStatus: (id: string, status: CleaningTask['status']) => Promise<boolean>;
  updateTaskNotes: (id: string, notes: string) => Promise<boolean>;
  updateTaskAssignment: (id: string, assignee: string) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  refreshTasks: () => Promise<void>;
  generateTasksForReservation: (reservation: any) => Promise<CleaningTask[]>;
}
