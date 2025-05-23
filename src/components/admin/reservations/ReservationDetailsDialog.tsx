
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { Reservation } from "@/hooks/useSupabaseReservations";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Apartment } from "@/hooks/useSupabaseReservations";

interface ReservationDetailsDialogProps {
  reservation: Reservation | null;
  apartments: Apartment[];
  onClose: () => void;
  onEdit: (id: string) => void;
}

export const ReservationDetailsDialog = ({ 
  reservation, 
  apartments, 
  onClose, 
  onEdit 
}: ReservationDetailsDialogProps) => {
  if (!reservation) return null;

  // Find apartment names
  const apartmentNames = reservation.apartmentIds.map(id => {
    const apartment = apartments.find(a => a.id === id);
    return apartment?.name || '';
  }).join(", ");

  // Format payment status for display
  const getPaymentStatusText = () => {
    switch (reservation.paymentStatus) {
      case "notPaid": return "Non Pagato";
      case "deposit": return `Caparra: €${reservation.depositAmount}`;
      case "paid": return "Pagato";
      default: return "";
    }
  };

  return (
    <Dialog open={!!reservation} onOpenChange={() => onClose()}>
      <DialogContent className="w-[95vw] p-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dettagli Prenotazione</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{reservation.guestName}</h3>
            <p className="text-muted-foreground">
              {reservation.adults} {reservation.adults === 1 ? 'adulto' : 'adulti'}
              {reservation.children > 0 && `, ${reservation.children} ${reservation.children === 1 ? 'bambino' : 'bambini'}`}
              {reservation.cribs > 0 && `, ${reservation.cribs} ${reservation.cribs === 1 ? 'culla' : 'culle'}`}
              {reservation.hasPets && ', con animali'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium">Check-in</p>
              <p>{format(new Date(reservation.startDate), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Check-out</p>
              <p>{format(new Date(reservation.endDate), 'dd/MM/yyyy')}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium">Appartamento</p>
            <p>{apartmentNames}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium">Prezzo Totale</p>
              <p>€{reservation.finalPrice}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Stato Pagamento</p>
              <p>{getPaymentStatusText()}</p>
            </div>
          </div>
          
          {reservation.notes && (
            <div>
              <p className="text-sm font-medium">Note</p>
              <p className="text-sm">{reservation.notes}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="outline"
            onClick={() => onClose()}
            className="w-full"
          >
            Chiudi
          </Button>
          <Button onClick={() => onEdit(reservation.id)} className="w-full">
            <Pencil className="h-4 w-4 mr-2" />
            Modifica
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
