
import { Apartment } from "@/hooks/useReservations";

export interface CleaningTask {
  id: string;
  apartmentId: string;
  apartmentName: string;
  date: string; // ISO date string
  status: "pending" | "inProgress" | "completed";
  notes?: string;
  assignedTo?: string;
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
}
