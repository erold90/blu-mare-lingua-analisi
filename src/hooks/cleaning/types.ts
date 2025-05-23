
export interface CleaningTask {
  id: string;
  apartmentId: string;
  apartmentName: string; // Added apartmentName property
  checkoutDate?: string; // Data di check-out
  checkinDate?: string; // Data di check-in
  date: string; // Data dell'attività
  status: "pending" | "inProgress" | "completed" | "cancelled";
  type?: "checkout" | "checkin" | "maintenance" | "deep";
  priority?: "low" | "medium" | "high";
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
