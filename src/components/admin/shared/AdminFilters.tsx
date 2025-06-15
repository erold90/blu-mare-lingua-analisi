
import { useState } from "react";
import { CalendarIcon, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export interface FilterState {
  searchTerm?: string;
  apartmentId?: string;
  paymentStatus?: string;
  dateFrom?: Date;
  dateTo?: Date;
  guestName?: string;
}

interface AdminFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  apartments?: Array<{ id: string; name: string }>;
  showPaymentStatus?: boolean;
  showDateRange?: boolean;
  showApartments?: boolean;
  showGuestName?: boolean;
  placeholder?: string;
}

export const AdminFilters = ({
  filters,
  onFiltersChange,
  apartments = [],
  showPaymentStatus = true,
  showDateRange = true,
  showApartments = true,
  showGuestName = true,
  placeholder = "Cerca..."
}: AdminFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };
  
  const clearFilters = () => {
    onFiltersChange({});
  };
  
  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== "" && value !== null
    ).length;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
      {/* Search input sempre visibile */}
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder={placeholder}
          value={filters.searchTerm || ""}
          onChange={(e) => updateFilter("searchTerm", e.target.value)}
          className="w-full"
        />
      </div>
      
      {/* Pulsante filtri avanzati */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-1" />
            Filtri
            {getActiveFiltersCount() > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
              >
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtri Avanzati</h4>
              {getActiveFiltersCount() > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Pulisci
                </Button>
              )}
            </div>
            
            {showGuestName && (
              <div className="space-y-2">
                <Label>Nome Ospite</Label>
                <Input
                  placeholder="Cerca per nome ospite"
                  value={filters.guestName || ""}
                  onChange={(e) => updateFilter("guestName", e.target.value)}
                />
              </div>
            )}
            
            {showApartments && apartments.length > 0 && (
              <div className="space-y-2">
                <Label>Appartamento</Label>
                <Select 
                  value={filters.apartmentId || ""} 
                  onValueChange={(value) => updateFilter("apartmentId", value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti gli appartamenti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti gli appartamenti</SelectItem>
                    {apartments.map((apt) => (
                      <SelectItem key={apt.id} value={apt.id}>
                        {apt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {showPaymentStatus && (
              <div className="space-y-2">
                <Label>Stato Pagamento</Label>
                <Select 
                  value={filters.paymentStatus || ""} 
                  onValueChange={(value) => updateFilter("paymentStatus", value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti gli stati" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti gli stati</SelectItem>
                    <SelectItem value="notPaid">Non Pagato</SelectItem>
                    <SelectItem value="deposit">Caparra</SelectItem>
                    <SelectItem value="paid">Pagato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {showDateRange && (
              <div className="space-y-2">
                <Label>Periodo</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? format(filters.dateFrom, "dd/MM", { locale: it }) : "Da"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date) => updateFilter("dateFrom", date)}
                        locale={it}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? format(filters.dateTo, "dd/MM", { locale: it }) : "A"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date) => updateFilter("dateTo", date)}
                        locale={it}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
