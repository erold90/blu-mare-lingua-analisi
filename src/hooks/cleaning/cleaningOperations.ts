
import type { CleaningTask } from "../useCleaningManagement";
import { Reservation, Apartment } from "@/hooks/useReservations";

// Generate tasks from reservations
export const generateTasksFromReservationsUtil = (
  reservations: Reservation[], 
  apartments: Apartment[], 
  cleaningTasks: CleaningTask[]
): Omit<CleaningTask, "id" | "createdAt" | "updatedAt">[] => {
  const newTasks: Omit<CleaningTask, "id" | "createdAt" | "updatedAt">[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  console.log("Analyzing reservations for cleaning tasks generation...");
  console.log("Current reservations:", reservations);
  console.log("Available apartments:", apartments);
  console.log("Existing cleaning tasks:", cleaningTasks);
  
  // For each reservation, create a cleaning task for the checkout day
  reservations.forEach(reservation => {
    console.log("Processing reservation:", reservation);
    
    const checkoutDate = new Date(reservation.endDate);
    checkoutDate.setHours(0, 0, 0, 0);
    
    // Generate cleaning tasks only for future checkouts or today
    if (checkoutDate >= today) {
      console.log(`Checkout date ${reservation.endDate} is valid for task generation`);
      
      // For each apartment in the reservation
      reservation.apartmentIds.forEach(apartmentId => {
        // Find the apartment name
        const apartment = apartments.find(apt => apt.id === apartmentId);
        if (!apartment) {
          console.warn(`Apartment with ID ${apartmentId} not found`);
          return;
        }
        
        // Check if a task already exists for this apartment and date
        const taskKey = `${apartmentId}-${reservation.endDate}-checkout`;
        const existingTask = cleaningTasks.find(task => 
          task.apartmentId === apartmentId && 
          task.taskDate === reservation.endDate &&
          task.taskType === "checkout"
        );
        
        if (existingTask) {
          console.log(`Task already exists for apartment ${apartment.name} on ${reservation.endDate}`);
          return;
        }
        
        console.log(`Creating new cleaning task for apartment ${apartment.name} on ${reservation.endDate}`);
        
        // Create the cleaning task
        newTasks.push({
          apartmentId,
          apartmentName: apartment.name,
          taskDate: reservation.endDate,
          taskType: "checkout",
          status: "pending",
          priority: "medium",
          estimatedDuration: 90,
          notes: `Pulizia dopo il checkout di ${reservation.guestName}`,
          deviceId: crypto.randomUUID()
        });
      });
    } else {
      console.log(`Checkout date ${reservation.endDate} is in the past, skipping`);
    }
  });
  
  console.log(`Generated ${newTasks.length} new cleaning tasks`);
  return newTasks;
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
