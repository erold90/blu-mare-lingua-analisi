
import * as React from "react";
import { useReservations } from "@/hooks/useReservations";
import { useCleaningManagement } from "@/hooks/cleaning";
import { format, addDays, isWithinInterval } from "date-fns";
import { it } from "date-fns/locale";

export const useDashboardData = () => {
  const { reservations, apartments } = useReservations();
  const { cleaningTasks } = useCleaningManagement();
  
  // Calcola il numero di prenotazioni future
  const futureReservations = React.useMemo(() => {
    const today = new Date();
    return reservations.filter(res => new Date(res.startDate) >= today).length;
  }, [reservations]);

  // Calcola le pulizie da fare
  const pendingCleanings = React.useMemo(() => {
    return cleaningTasks.filter(task => task.status !== "completed").length;
  }, [cleaningTasks]);
  
  // Calcola il totale degli ospiti attesi
  const totalGuests = React.useMemo(() => {
    return reservations.reduce((acc, res) => {
      return acc + res.adults + res.children;
    }, 0);
  }, [reservations]);
  
  // Calcola il revenue totale
  const totalRevenue = React.useMemo(() => {
    return reservations.reduce((acc, reservation) => {
      return acc + (reservation.finalPrice || 0);
    }, 0);
  }, [reservations]);

  // Calcola occupancy percentage per la stagione estiva (Giugno-Settembre)
  const summerOccupancy = React.useMemo(() => {
    const result: { name: string; occupancy: number }[] = [];
    const today = new Date();
    const year = today.getFullYear();
    const summerStart = new Date(year, 5, 1); // 1 Giugno
    const summerEnd = new Date(year, 8, 30); // 30 Settembre
    const totalDays = 122; // Giorni approssimativi nella stagione estiva
    
    // Per ogni appartamento, calcola i giorni occupati in estate
    apartments.forEach(apt => {
      const apartmentReservations = reservations.filter(r => 
        r.apartmentIds.includes(apt.id));
      
      let daysOccupied = 0;
      apartmentReservations.forEach(reservation => {
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);
        
        // Controlla se la prenotazione si sovrappone all'estate
        if (startDate <= summerEnd && endDate >= summerStart) {
          // Calcola la sovrapposizione
          const overlapStart = startDate > summerStart ? startDate : summerStart;
          const overlapEnd = endDate < summerEnd ? endDate : summerEnd;
          
          // Aggiungi i giorni al conteggio
          const diffTime = overlapEnd.getTime() - overlapStart.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          daysOccupied += diffDays;
        }
      });
      
      const occupancyPercentage = Math.round((daysOccupied / totalDays) * 100);
      result.push({
        name: `${apt.name}`,
        occupancy: occupancyPercentage
      });
    });
    
    return result;
  }, [reservations, apartments]);

  // Revenue mensile estivo (solo da Giugno a Settembre)
  const summerMonthlyRevenue = React.useMemo(() => {
    const data: { name: string; revenue: number }[] = [];
    const summerMonths = ["Giu", "Lug", "Ago", "Set"];
    const summerMonthIndices = [5, 6, 7, 8]; // Giugno è 5, Settembre è 8
    const revenueByMonth: number[] = Array(4).fill(0);
    
    reservations.forEach(reservation => {
      const startDate = new Date(reservation.startDate);
      const month = startDate.getMonth();
      
      // Conta solo se è un mese estivo (Giugno-Settembre)
      const summerIndex = summerMonthIndices.indexOf(month);
      if (summerIndex !== -1) {
        revenueByMonth[summerIndex] += (reservation.finalPrice || 0);
      }
    });
    
    summerMonths.forEach((month, i) => {
      data.push({
        name: month,
        revenue: revenueByMonth[i]
      });
    });
    
    return data;
  }, [reservations]);
  
  // Distribuzione delle prenotazioni per mese
  const reservationsByMonth = React.useMemo(() => {
    const data = Array(12).fill(0).map((_, i) => ({
      name: format(new Date(2023, i, 1), "MMM", { locale: it }),
      count: 0
    }));
    
    reservations.forEach(reservation => {
      const startDate = new Date(reservation.startDate);
      const month = startDate.getMonth();
      data[month].count++;
    });
    
    return data;
  }, [reservations]);
  
  // Distribuzione degli ospiti per tipologia
  const guestDistribution = React.useMemo(() => {
    const totalAdults = reservations.reduce((acc, res) => acc + res.adults, 0);
    const totalChildren = reservations.reduce((acc, res) => acc + res.children, 0);
    const totalCribs = reservations.reduce((acc, res) => acc + (res.cribs || 0), 0);
    
    return [
      { name: "Adulti", value: totalAdults },
      { name: "Bambini", value: totalChildren },
      { name: "Culle", value: totalCribs }
    ];
  }, [reservations]);
  
  // Prenotazioni attive oggi
  const activeReservations = React.useMemo(() => {
    const today = new Date();
    
    return reservations.filter(res => {
      const startDate = new Date(res.startDate);
      const endDate = new Date(res.endDate);
      
      return isWithinInterval(today, { start: startDate, end: endDate });
    });
  }, [reservations]);
  
  // Prossimi check-in e check-out
  const upcomingMovements = React.useMemo(() => {
    const today = new Date();
    const next7Days = addDays(today, 7);
    
    return reservations
      .filter(res => {
        const checkIn = new Date(res.startDate);
        const checkOut = new Date(res.endDate);
        
        return (checkIn >= today && checkIn <= next7Days) || 
               (checkOut >= today && checkOut <= next7Days);
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  }, [reservations]);
  
  // Statistiche delle pulizie
  const cleaningStats = React.useMemo(() => {
    const total = cleaningTasks.length;
    const completed = cleaningTasks.filter(t => t.status === "completed").length;
    const inProgress = cleaningTasks.filter(t => t.status === "inProgress").length;
    const pending = cleaningTasks.filter(t => t.status === "pending").length;
    
    const data = [
      { name: "Completate", value: completed },
      { name: "In corso", value: inProgress },
      { name: "Da fare", value: pending }
    ];
    
    return {
      data,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [cleaningTasks]);
  
  return {
    futureReservations,
    pendingCleanings,
    totalGuests,
    totalRevenue,
    summerOccupancy,
    summerMonthlyRevenue,
    reservationsByMonth,
    guestDistribution,
    activeReservations,
    upcomingMovements,
    cleaningStats,
    apartments
  };
};
