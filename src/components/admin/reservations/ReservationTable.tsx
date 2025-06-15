
import { format } from "date-fns";
import { Edit, Eye, Trash2 } from "lucide-react";
import { Reservation, Apartment } from "@/hooks/useSupabaseReservations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPaymentStatusConfig, formatPaymentStatus, formatDate, getApartmentColor } from "@/utils/admin/statusConfig";

interface ReservationTableProps {
  reservations: Reservation[];
  apartments: Apartment[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewSummary: (reservation: Reservation) => void;
}

export const ReservationTable = ({
  reservations,
  apartments,
  onEdit,
  onDelete,
  onViewSummary,
}: ReservationTableProps) => {
  const getApartmentNames = (apartmentIds: string[]) => {
    return apartmentIds.map(id => {
      const apartment = apartments.find(a => a.id === id);
      return apartment?.name || '';
    }).join(", ");
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ospite</TableHead>
            <TableHead>Appartamento</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Ospiti</TableHead>
            <TableHead>Prezzo</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
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
            reservations.map(reservation => {
              const paymentConfig = getPaymentStatusConfig(reservation.paymentStatus as any);
              
              return (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">
                    {reservation.guestName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {reservation.apartmentIds.map((aptId, index) => {
                        const apt = apartments.find(a => a.id === aptId);
                        return (
                          <Badge 
                            key={aptId} 
                            className={`${getApartmentColor(index)} text-white text-xs`}
                          >
                            {apt?.name || "N/A"}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(reservation.startDate)}</TableCell>
                  <TableCell>{formatDate(reservation.endDate)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {reservation.adults} {reservation.adults === 1 ? 'adulto' : 'adulti'}
                      {reservation.children > 0 && (
                        <div className="text-muted-foreground">
                          {reservation.children} {reservation.children === 1 ? 'bambino' : 'bambini'}
                        </div>
                      )}
                      {reservation.cribs > 0 && (
                        <div className="text-muted-foreground text-xs">
                          {reservation.cribs} {reservation.cribs === 1 ? 'culla' : 'culle'}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    €{reservation.finalPrice}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={paymentConfig.color}
                    >
                      {formatPaymentStatus(reservation.paymentStatus, reservation.depositAmount)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewSummary(reservation)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(reservation.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(reservation.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
