
import { format } from "date-fns";
import { Info, Pencil, Trash2 } from "lucide-react";
import { Reservation, Apartment } from "@/hooks/useSupabaseReservations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MobileReservationCardProps {
  reservation: Reservation;
  apartments: Apartment[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (reservation: Reservation) => void;
}

export const MobileReservationCard = ({ 
  reservation, 
  apartments, 
  onEdit, 
  onDelete, 
  onViewDetails 
}: MobileReservationCardProps) => {
  // Find apartment names
  const apartmentNames = reservation.apartmentIds.map(id => {
    const apartment = apartments.find(a => a.id === id);
    return apartment?.name || '';
  }).join(", ");

  // Calculate number of nights
  const startDate = new Date(reservation.startDate);
  const endDate = new Date(reservation.endDate);
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

  // Get payment status icon/color
  let statusColor = "bg-gray-200";
  if (reservation.paymentStatus === "paid") {
    statusColor = "bg-green-200";
  } else if (reservation.paymentStatus === "deposit") {
    statusColor = "bg-yellow-200";
  } else {
    statusColor = "bg-red-200";
  }

  return (
    <Card className="mb-3">
      <CardHeader className="px-4 py-2 flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${statusColor}`} />
          <CardTitle className="text-base">{reservation.guestName}</CardTitle>
        </div>
        <div className="text-sm font-medium">€{reservation.finalPrice}</div>
      </CardHeader>
      <CardContent className="px-4 py-2">
        <div className="text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-in:</span>
            <span>{format(startDate, 'dd/MM/yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-out:</span>
            <span>{format(endDate, 'dd/MM/yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Durata:</span>
            <span>{nights} {nights === 1 ? 'notte' : 'notti'}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground truncate">
            {apartmentNames}
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-2 py-2 flex justify-between gap-1">
        <Button variant="ghost" size="sm" onClick={() => onViewDetails(reservation)}>
          <Info className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(reservation.id)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDelete(reservation.id)} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
