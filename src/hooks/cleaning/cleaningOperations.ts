
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
  today.setHours(0, 0, 0, 0); // Normalizza l'ora per confronto date
  
  console.log('Generazione tasks - Dati di input:', {
    reservationsCount: reservations.length,
    apartmentsCount: apartments.length,
    existingTasksCount: existingTasks.length
  });
  
  reservations.forEach(reservation => {
    const checkOutDate = new Date(reservation.endDate);
    checkOutDate.setHours(0, 0, 0, 0); // Normalizza l'ora
    
    console.log(`Processando prenotazione ${reservation.guestName}:`, {
      endDate: reservation.endDate,
      checkOutDate: checkOutDate.toISOString(),
      today: today.toISOString(),
      isValidForCleaning: checkOutDate >= today
    });
    
    // Genera attività di pulizia per check-out futuri o di oggi
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

          console.log(`Controllo appartamento ${apartment.name}:`, {
            apartmentId,
            taskDate: reservation.endDate,
            existingTask: !!existingTask
          });

          if (!existingTask) {
            const newTask = {
              apartmentId: apartmentId,
              apartmentName: apartment.name,
              taskDate: reservation.endDate,
              taskType: "checkout" as const,
              status: "pending" as const,
              priority: "medium" as const,
              estimatedDuration: 90,
              notes: `Pulizia post check-out - Ospite: ${reservation.guestName}`,
              deviceId: crypto.randomUUID()
            };
            
            newTasks.push(newTask);
            console.log('Nuovo task aggiunto:', newTask);
          }
        } else {
          console.warn(`Appartamento non trovato per ID: ${apartmentId}`);
        }
      });
    }
  });

  console.log(`Generati ${newTasks.length} nuovi task di pulizia`);
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
