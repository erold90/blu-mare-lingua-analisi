
import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { MoreHorizontal, Edit, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reservation, Apartment } from "@/hooks/useReservations";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ReservationTableProps {
  reservations: Reservation[];
  apartments: Apartment[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewSummary?: (reservation: Reservation) => void;
}

export const ReservationTable = ({
  reservations,
  apartments,
  onEdit,
  onDelete,
  onViewSummary
}: ReservationTableProps) => {
  const getSelectedApartments = (apartmentIds: string[]) => {
    return apartments.filter(apt => apartmentIds.includes(apt.id));
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: "Pagato", className: "bg-green-100 text-green-800" },
      deposit: { label: "Caparra", className: "bg-yellow-100 text-yellow-800" },
      notPaid: { label: "Non Pagato", className: "bg-red-100 text-red-800" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: it });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Periodo</TableHead>
            <TableHead>Ospiti</TableHead>
            <TableHead>Appartamenti</TableHead>
            <TableHead>Prezzo</TableHead>
            <TableHead>Stato Pagamento</TableHead>
            <TableHead>Biancheria</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Nessuna prenotazione trovata
              </TableCell>
            </TableRow>
          ) : (
            reservations.map((reservation) => {
              const selectedApartments = getSelectedApartments(reservation.apartmentIds);
              
              return (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{reservation.guestName}</span>
                      {reservation.hasPets && (
                        <Badge variant="outline" className="w-fit mt-1 text-xs bg-blue-100 text-blue-800">
                          🐕 Animali
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>Dal: {formatDate(reservation.startDate)}</span>
                      <span>Al: {formatDate(reservation.endDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{reservation.adults} adulti</div>
                      {reservation.children > 0 && (
                        <div>{reservation.children} bambini</div>
                      )}
                      {reservation.cribs > 0 && (
                        <div>{reservation.cribs} culle</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {selectedApartments.map(apt => (
                        <Badge key={apt.id} variant="secondary" className="text-xs">
                          {apt.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    €{reservation.finalPrice.toFixed(2)}
                    {reservation.paymentStatus === "deposit" && reservation.depositAmount && (
                      <div className="text-xs text-muted-foreground">
                        Caparra: €{reservation.depositAmount.toFixed(2)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(reservation.paymentStatus)}
                  </TableCell>
                  <TableCell>
                    {reservation.hasLinen ? (
                      <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        Sì
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        No
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onViewSummary && (
                          <DropdownMenuItem onClick={() => onViewSummary(reservation)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Riepilogo
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onEdit(reservation.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(reservation.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
