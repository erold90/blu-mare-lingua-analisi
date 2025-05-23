
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

export interface CleaningContextType {
  cleaningTasks: CleaningTask[];
  addTask: (task: Omit<CleaningTask, "id">) => void;
  updateTaskStatus: (id: string, status: CleaningTask["status"]) => void;
  updateTaskNotes: (id: string, notes: string) => void;
  updateTaskAssignment: (id: string, assignedTo: string) => void;
  deleteTask: (id: string) => void;
  generateTasksFromReservations: () => void;
  getTasksByDate: (date: Date) => CleaningTask[];
  getTasksByApartmentId: (apartmentId: string) => CleaningTask[];
  refreshTasks: () => Promise<void>;
  isLoading: boolean;
}
