import React, { useState } from "react";
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
  Mail
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

const mockReservations = [
  {
    id: "1",
    guestName: "Marco Rossi",
    apartment: "Appartamento 1",
    checkIn: "2025-07-28",
    checkOut: "2025-08-02",
    guests: 4,
    status: "confirmed",
    phone: "+39 333 1234567",
    email: "marco.rossi@email.com",
    totalPrice: 1200
  },
  {
    id: "2", 
    guestName: "Laura Bianchi",
    apartment: "Appartamento 3",
    checkIn: "2025-07-30",
    checkOut: "2025-08-05",
    guests: 2,
    status: "pending",
    phone: "+39 347 9876543",
    email: "laura.bianchi@email.com",
    totalPrice: 900
  },
  {
    id: "3",
    guestName: "Andrea Verdi",
    apartment: "Appartamento 2",
    checkIn: "2025-08-01",
    checkOut: "2025-08-07",
    guests: 6,
    status: "checkedIn",
    phone: "+39 339 5551234",
    email: "andrea.verdi@email.com",
    totalPrice: 1800
  }
];

const statusConfig = {
  confirmed: { label: "Confermata", color: "bg-blue-50 text-blue-700 border-blue-200" },
  pending: { label: "In Attesa", color: "bg-amber-50 text-amber-700 border-amber-200" },
  checkedIn: { label: "Check-in", color: "bg-green-50 text-green-700 border-green-200" },
  checkedOut: { label: "Check-out", color: "bg-slate-50 text-slate-700 border-slate-200" },
  cancelled: { label: "Cancellata", color: "bg-red-50 text-red-700 border-red-200" }
};

export function ModernReservations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReservations = mockReservations.filter(reservation => {
    const matchesSearch = reservation.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.apartment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                <SelectItem value="confirmed">Confermata</SelectItem>
                <SelectItem value="pending">In Attesa</SelectItem>
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
        {filteredReservations.map((reservation) => (
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
                      <h3 className="font-semibold text-slate-900">{reservation.guestName}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center text-sm text-slate-500">
                          <Phone className="h-4 w-4 mr-1" />
                          {reservation.phone}
                        </div>
                        <div className="flex items-center text-sm text-slate-500">
                          <Mail className="h-4 w-4 mr-1" />
                          {reservation.email}
                        </div>
                      </div>
                    </div>
                    <Badge className={statusConfig[reservation.status as keyof typeof statusConfig].color}>
                      {statusConfig[reservation.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>

                  {/* Reservation Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{reservation.apartment}</p>
                        <p className="text-xs text-slate-500">{reservation.guests} ospiti</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Check-in</p>
                        <p className="text-xs text-slate-500">{new Date(reservation.checkIn).toLocaleDateString('it-IT')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Check-out</p>
                        <p className="text-xs text-slate-500">{new Date(reservation.checkOut).toLocaleDateString('it-IT')}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">€{reservation.totalPrice}</p>
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
        ))}
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