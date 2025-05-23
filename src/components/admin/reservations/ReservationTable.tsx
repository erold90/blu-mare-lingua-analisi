
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { Reservation, Apartment } from "@/hooks/useReservations";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface ReservationTableProps {
  reservations: Reservation[];
  apartments: Apartment[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ReservationTable = ({ 
  reservations, 
  apartments, 
  onEdit, 
  onDelete 
}: ReservationTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Appartamenti</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Prezzo</TableHead>
            <TableHead>Stato Pagamento</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                Nessuna prenotazione trovata
              </TableCell>
            </TableRow>
          ) : (
            reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell className="font-medium">
                  {reservation.guestName}
                </TableCell>
                <TableCell>
                  {reservation.apartmentIds.map(id => {
                    const apartment = apartments.find(a => a.id === id);
                    return apartment?.name;
                  }).join(", ")}
                </TableCell>
                <TableCell>
                  {format(new Date(reservation.startDate), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  {format(new Date(reservation.endDate), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>€{reservation.finalPrice}</TableCell>
                <TableCell>
                  {reservation.paymentStatus === "notPaid" && "Non Pagato"}
                  {reservation.paymentStatus === "deposit" && 
                    `Caparra: €${reservation.depositAmount}`}
                  {reservation.paymentStatus === "paid" && "Pagato"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(reservation.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(reservation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
