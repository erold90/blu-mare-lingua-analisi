
import { useState, useMemo } from "react";
import { Reservation } from "@/hooks/useSupabaseReservations";
import { normalizeDate } from "@/utils/admin/dateValidation";

export interface FilterState {
  searchTerm?: string;
  apartmentId?: string;
  paymentStatus?: string;
  dateFrom?: Date;
  dateTo?: Date;
  guestName?: string;
}

export const useAdminFilters = (data: Reservation[]) => {
  const [filters, setFilters] = useState<FilterState>({});
  
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Filtro per termine di ricerca (cerca in nome ospite)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = item.guestName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Filtro per nome ospite specifico
      if (filters.guestName) {
        const guestLower = filters.guestName.toLowerCase();
        if (!item.guestName.toLowerCase().includes(guestLower)) return false;
      }
      
      // Filtro per appartamento
      if (filters.apartmentId) {
        if (!item.apartmentIds.includes(filters.apartmentId)) return false;
      }
      
      // Filtro per stato pagamento
      if (filters.paymentStatus) {
        if (item.paymentStatus !== filters.paymentStatus) return false;
      }
      
      // Filtro per data inizio
      if (filters.dateFrom) {
        const itemStartDate = normalizeDate(item.startDate);
        const filterDate = normalizeDate(filters.dateFrom);
        if (itemStartDate < filterDate) return false;
      }
      
      // Filtro per data fine
      if (filters.dateTo) {
        const itemEndDate = normalizeDate(item.endDate);
        const filterDate = normalizeDate(filters.dateTo);
        if (itemEndDate > filterDate) return false;
      }
      
      return true;
    });
  }, [data, filters]);
  
  const clearFilters = () => setFilters({});
  
  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== "" && value !== null
    ).length;
  };
  
  return {
    filters,
    setFilters,
    filteredData,
    clearFilters,
    getActiveFiltersCount
  };
};
