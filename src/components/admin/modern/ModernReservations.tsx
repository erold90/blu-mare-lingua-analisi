import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  User,
  Building,
  Clock,
  Phone,
  Mail,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Reservation {
  id: string;
  guest_name: string;
  apartment_ids: any; // Json type from Supabase
  start_date: string;
  end_date: string;
  adults: number;
  children: number;
  payment_status: string;
  final_price: number;
  has_pets: boolean;
  linen_option: string;
  notes?: string;
  created_at: string;
}

const statusConfig = {
  notPaid: { label: "Non Pagata", color: "bg-red-50 text-red-700 border-red-200" },
  deposit: { label: "Acconto", color: "bg-amber-50 text-amber-700 border-amber-200" },
  paid: { label: "Pagata", color: "bg-green-50 text-green-700 border-green-200" },
  cancelled: { label: "Cancellata", color: "bg-slate-50 text-slate-700 border-slate-200" }
};

const getReservationStatus = (reservation: Reservation) => {
  const today = new Date();
  const startDate = new Date(reservation.start_date);
  const endDate = new Date(reservation.end_date);
  
  if (today >= startDate && today <= endDate) {
    return "checkedIn";
  } else if (today > endDate) {
    return "checkedOut";  
  } else {
    return reservation.payment_status;
  }
};

const getApartmentNames = (apartmentIds: any) => {
  const apartmentMap: Record<string, string> = {
    'appartamento-1': 'Appartamento 1',
    'appartamento-2': 'Appartamento 2', 
    'appartamento-3': 'Appartamento 3',
    'appartamento-4': 'Appartamento 4'
  };
  
  // Gestisce sia array che stringhe da Supabase
  const ids = Array.isArray(apartmentIds) ? apartmentIds : [apartmentIds];
  return ids.map(id => apartmentMap[id] || id).join(', ');
};

export function ModernReservations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Carica le prenotazioni da Supabase
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching reservations:', error);
        toast.error('Errore nel caricamento delle prenotazioni');
        return;
      }

      setReservations(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Errore nel caricamento delle prenotazioni');
    } finally {
      setLoading(false);
    }
  };

  // Effetto per caricare i dati all'avvio
  useEffect(() => {
    fetchReservations();
  }, []);

  // Real-time updates per le prenotazioni
  useEffect(() => {
    const channel = supabase
      .channel('reservations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reservations' },
        (payload) => {
          console.log('Reservation change detected:', payload);
          fetchReservations(); // Ricarica i dati quando ci sono cambiamenti
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getApartmentNames(reservation.apartment_ids).toLowerCase().includes(searchTerm.toLowerCase());
    const reservationStatus = getReservationStatus(reservation);
    const matchesStatus = statusFilter === "all" || reservationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Caricamento prenotazioni...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Prenotazioni</h2>
          <p className="text-slate-500">Gestisci tutte le prenotazioni</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuova Prenotazione
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-slate-200/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Cerca per ospite o appartamento..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="notPaid">Non Pagata</SelectItem>
                  <SelectItem value="deposit">Acconto</SelectItem>
                  <SelectItem value="paid">Pagata</SelectItem>
                  <SelectItem value="checkedIn">Check-in</SelectItem>
                  <SelectItem value="checkedOut">Check-out</SelectItem>
                  <SelectItem value="cancelled">Cancellata</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <div className="grid gap-4">
        {filteredReservations.map((reservation) => {
          const reservationStatus = getReservationStatus(reservation);
          const totalGuests = reservation.adults + reservation.children;
          
          return (
          <Card key={reservation.id} className="border-slate-200/60 hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Guest Info */}
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{reservation.guest_name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="text-sm text-slate-500">
                          {reservation.has_pets && "🐕 Con animali"}
                          {reservation.linen_option !== 'no' && " • 🛏️ Biancheria"}
                        </div>
                      </div>
                    </div>
                    <Badge className={statusConfig[reservationStatus as keyof typeof statusConfig]?.color || "bg-slate-50 text-slate-700 border-slate-200"}>
                      {statusConfig[reservationStatus as keyof typeof statusConfig]?.label || reservationStatus}
                    </Badge>
                  </div>

                  {/* Reservation Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{getApartmentNames(reservation.apartment_ids)}</p>
                        <p className="text-xs text-slate-500">{totalGuests} ospiti ({reservation.adults} adulti, {reservation.children} bambini)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Check-in</p>
                        <p className="text-xs text-slate-500">{new Date(reservation.start_date).toLocaleDateString('it-IT')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Check-out</p>
                        <p className="text-xs text-slate-500">{new Date(reservation.end_date).toLocaleDateString('it-IT')}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">€{reservation.final_price}</p>
                      <p className="text-xs text-slate-500">Totale</p>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Visualizza Dettagli</DropdownMenuItem>
                    <DropdownMenuItem>Modifica</DropdownMenuItem>
                    <DropdownMenuItem>Conferma Check-in</DropdownMenuItem>
                    <DropdownMenuItem>Invia Email</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Cancella</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        );
        })}
      </div>

      {filteredReservations.length === 0 && (
        <Card className="border-slate-200/60">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Nessuna prenotazione trovata</h3>
            <p className="text-slate-500 mb-4">Non ci sono prenotazioni che corrispondono ai tuoi criteri di ricerca.</p>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi Prenotazione
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}