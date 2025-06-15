
import { CleaningTask } from '../useCleaningManagement';
import { Reservation, Apartment } from '@/hooks/useReservations';

// Genera attività di pulizia dalle prenotazioni
export const generateTasksFromReservationsUtil = (
  reservations: Reservation[],
  apartments: Apartment[],
  existingTasks: CleaningTask[]
): Omit<CleaningTask, "id" | "createdAt" | "updatedAt">[] => {
  const newTasks: Omit<CleaningTask, "id" | "createdAt" | "updatedAt">[] = [];
  const today = new Date();
  
  reservations.forEach(reservation => {
    const checkOutDate = new Date(reservation.endDate);
    
    // Genera attività di pulizia solo per check-out futuri o di oggi
    if (checkOutDate >= today) {
      reservation.apartmentIds.forEach(apartmentId => {
        const apartment = apartments.find(apt => apt.id === apartmentId);
        if (apartment) {
          // Verifica se esiste già un'attività per questo appartamento e data
          const existingTask = existingTasks.find(task => 
            task.apartmentId === apartmentId && 
            task.taskDate === reservation.endDate &&
            task.taskType === "checkout"
          );

          if (!existingTask) {
            newTasks.push({
              apartmentId: apartmentId,
              apartmentName: apartment.name,
              taskDate: reservation.endDate,
              taskType: "checkout",
              status: "pending",
              priority: "medium",
              estimatedDuration: 90,
              notes: `Pulizia post check-out - Ospite: ${reservation.guestName}`
            });
          }
        }
      });
    }
  });

  return newTasks;
};

// Ottieni attività per data
export const getTasksByDateUtil = (tasks: CleaningTask[], date: Date): CleaningTask[] => {
  const dateString = date.toISOString().split('T')[0];
  return tasks.filter(task => task.taskDate === dateString);
};

// Ottieni attività per appartamento
export const getTasksByApartmentIdUtil = (tasks: CleaningTask[], apartmentId: string): CleaningTask[] => {
  return tasks.filter(task => task.apartmentId === apartmentId);
};
