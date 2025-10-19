import { useState, useEffect, useCallback } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { useArchivedReservations } from '@/hooks/useArchivedReservations';

export interface SeasonalRevenueData {
  totalReservations: number;
  totalRevenue: number;
  averageRevenue: number;
  monthlyData: Array<{
    month: string;
    monthNumber: number;
    revenue: number;
    reservations: number;
  }>;
  apartmentBreakdown: Array<{
    apartmentId: string;
    apartmentName: string;
    revenue: number;
    reservations: number;
  }>;
}

export interface SeasonalFilters {
  apartmentId?: string;
  period: 'daily' | 'monthly' | 'seasonal';
  year: number;
}

export function useSeasonalRevenue() {
  const { reservations } = useReservations();
  const { getAllReservationsForRevenue } = useArchivedReservations();
  const [data, setData] = useState<SeasonalRevenueData>({
    totalReservations: 0,
    totalRevenue: 0,
    averageRevenue: 0,
    monthlyData: [],
    apartmentBreakdown: []
  });
  const [loading, setLoading] = useState(false);
  
  const calculateSeasonalRevenue = useCallback(async (filters: SeasonalFilters) => {
    setLoading(true);
    
    try {
      // Definisce la stagione estiva (1 giugno - 30 settembre)
      const currentYear = filters.year;
      const seasonStart = new Date(currentYear, 5, 1); // 1 giugno (mese 5 = giugno)
      const seasonEnd = new Date(currentYear, 8, 30); // 30 settembre (mese 8 = settembre)
      
      // Get ALL reservations (active + archived) for this year
      const allReservations = await getAllReservationsForRevenue(currentYear);
      
      // Filtra le prenotazioni della stagione estiva
      let filteredReservations = allReservations.filter(reservation => {
        const startDate = new Date(reservation.start_date);
        const endDate = new Date(reservation.end_date);
        
        // Verifica se la prenotazione ha giorni nella stagione estiva
        const hasOverlap = startDate <= seasonEnd && endDate >= seasonStart;
        
        // Filtra per appartamento se specificato
        if (filters.apartmentId) {
          const apartmentIds = Array.isArray(reservation.apartment_ids) 
            ? reservation.apartment_ids 
            : JSON.parse(reservation.apartment_ids || '[]');
          if (!apartmentIds.includes(filters.apartmentId)) {
            return false;
          }
        }
        
        return hasOverlap && reservation.final_price && reservation.final_price > 0;
      });

      // Calcola statistiche totali
      const totalReservations = filteredReservations.length;
      const totalRevenue = filteredReservations.reduce((sum, res) => sum + (res.final_price || 0), 0);
      const averageRevenue = totalReservations > 0 ? totalRevenue / totalReservations : 0;

      // Calcola dati mensili (giugno-settembre)
      const monthlyData = [];
      const monthNames = ['Giugno', 'Luglio', 'Agosto', 'Settembre'];
      
      for (let monthIndex = 5; monthIndex <= 8; monthIndex++) { // giugno = 5, settembre = 8
        const monthStart = new Date(currentYear, monthIndex, 1);
        const monthEnd = new Date(currentYear, monthIndex + 1, 0); // ultimo giorno del mese
        
        const monthReservations = filteredReservations.filter(reservation => {
          const startDate = new Date(reservation.start_date);
          const endDate = new Date(reservation.end_date);
          
          // Verifica se la prenotazione ha giorni in questo mese
          return startDate <= monthEnd && endDate >= monthStart;
        });

        const monthRevenue = monthReservations.reduce((sum, res) => sum + (res.final_price || 0), 0);
        
        monthlyData.push({
          month: monthNames[monthIndex - 5],
          monthNumber: monthIndex + 1,
          revenue: monthRevenue,
          reservations: monthReservations.length
        });
      }

      // Calcola breakdown per appartamento
      const apartmentMap = new Map();
      const apartmentNames = {
        'appartamento-1': 'Appartamento 1',
        'appartamento-2': 'Appartamento 2', 
        'appartamento-3': 'Appartamento 3',
        'appartamento-4': 'Appartamento 4'
      };

      filteredReservations.forEach(reservation => {
        const apartmentIds = Array.isArray(reservation.apartment_ids) 
          ? reservation.apartment_ids 
          : JSON.parse(reservation.apartment_ids || '[]');
        
        apartmentIds.forEach((aptId: string) => {
          if (!apartmentMap.has(aptId)) {
            apartmentMap.set(aptId, {
              apartmentId: aptId,
              apartmentName: apartmentNames[aptId as keyof typeof apartmentNames] || aptId,
              revenue: 0,
              reservations: 0
            });
          }
          
          const aptData = apartmentMap.get(aptId);
          aptData.revenue += reservation.final_price || 0;
          aptData.reservations += 1;
        });
      });

      const apartmentBreakdown = Array.from(apartmentMap.values())
        .sort((a, b) => b.revenue - a.revenue);

      setData({
        totalReservations,
        totalRevenue,
        averageRevenue,
        monthlyData,
        apartmentBreakdown
      });
      
    } catch (error) {
      console.error('Error calculating seasonal revenue:', error);
    } finally {
      setLoading(false);
    }
  }, [reservations, getAllReservationsForRevenue]);

  return {
    data,
    loading,
    calculateSeasonalRevenue
  };
}