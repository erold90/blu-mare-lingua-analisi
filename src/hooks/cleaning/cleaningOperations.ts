
import { CleaningTask } from "../useCleaningManagement";
import { Reservation, Apartment } from "@/hooks/useReservations";

// Generate tasks from reservations
export const generateTasksFromReservationsUtil = (
  reservations: Reservation[], 
  apartments: Apartment[], 
  cleaningTasks: CleaningTask[]
): Omit<CleaningTask, "id" | "createdAt" | "updatedAt">[] => {
  const newTasks: Omit<CleaningTask, "id" | "createdAt" | "updatedAt">[] = [];
  
  // For each reservation, create a cleaning task for the checkout day
  reservations.forEach(reservation => {
    const checkoutDate = new Date(reservation.endDate);
    
    // For each apartment in the reservation
    reservation.apartmentIds.forEach(apartmentId => {
      // Find the apartment name
      const apartment = apartments.find(apt => apt.id === apartmentId);
      if (!apartment) return;
      
      // Create the cleaning task
      newTasks.push({
        apartmentId,
        apartmentName: apartment.name,
        taskDate: checkoutDate.toISOString().split('T')[0],
        taskType: "checkout",
        status: "pending",
        priority: "medium",
        estimatedDuration: 90,
        notes: `Pulizia dopo il checkout di ${reservation.guestName}`
      });
    });
  });
  
  // Filter out tasks that already exist
  const existingDates = cleaningTasks.map(task => 
    `${task.apartmentId}-${task.taskDate}`
  );
  
  return newTasks.filter(task => {
    const taskKey = `${task.apartmentId}-${task.taskDate}`;
    return !existingDates.includes(taskKey);
  });
};

// Filter tasks by date
export const getTasksByDateUtil = (cleaningTasks: CleaningTask[], date: Date): CleaningTask[] => {
  const dateStr = date.toISOString().split('T')[0];
  return cleaningTasks.filter(task => task.taskDate === dateStr);
};

// Filter tasks by apartment ID
export const getTasksByApartmentIdUtil = (cleaningTasks: CleaningTask[], apartmentId: string): CleaningTask[] => {
  return cleaningTasks.filter(task => task.apartmentId === apartmentId);
};
