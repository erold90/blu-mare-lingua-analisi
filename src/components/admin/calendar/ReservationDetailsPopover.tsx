
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Reservation } from "@/hooks/useReservations";
import { Calendar, Users, Phone, Euro, MapPin } from "lucide-react";

interface ReservationDetailsPopoverProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  apartments: Array<{ id: string; name: string }>;
}

export const ReservationDetailsPopover: React.FC<ReservationDetailsPopoverProps> = ({
  reservation,
  isOpen,
  onClose,
  apartments
}) => {
  if (!reservation) return null;

  const startDate = new Date(reservation.startDate);
  const endDate = new Date(reservation.endDate);
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'deposit': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagato';
      case 'deposit': return 'Acconto';
      default: return 'Non pagato';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dettagli Prenotazione
          </DialogTitle>
          <DialogDescription>
            Visualizza tutti i dettagli della prenotazione selezionata.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Info cliente */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">{reservation.guestName}</h3>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Users className="h-4 w-4" />
              <span>{reservation.adults} adulti</span>
              {reservation.children > 0 && <span>• {reservation.children} bambini</span>}
              {reservation.cribs > 0 && <span>• {reservation.cribs} lettini</span>}
            </div>
          </div>

          {/* Date soggiorno */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xs text-green-600 mb-1">Check-in</div>
              <div className="font-semibold text-green-900">
                {format(startDate, "d MMM yyyy", { locale: it })}
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-xs text-orange-600 mb-1">Check-out</div>
              <div className="font-semibold text-orange-900">
                {format(endDate, "d MMM yyyy", { locale: it })}
              </div>
            </div>
          </div>

          {/* Appartamenti */}
          <div>
            <div className="text-sm font-medium mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Appartamenti
            </div>
            <div className="flex flex-wrap gap-1">
              {reservation.apartmentIds.map(aptId => {
                const apt = apartments.find(a => a.id === aptId);
                return (
                  <Badge key={aptId} variant="outline">
                    {apt?.name || 'Appartamento'}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Dettagli finanziari */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Prezzo totale
              </span>
              <span className="font-bold text-lg">€ {reservation.finalPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Stato pagamento</span>
              <Badge className={getPaymentStatusColor(reservation.paymentStatus)}>
                {getPaymentStatusText(reservation.paymentStatus)}
              </Badge>
            </div>
            {reservation.depositAmount && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span>Acconto</span>
                <span>€ {reservation.depositAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Note */}
          {reservation.notes && (
            <div>
              <div className="text-sm font-medium mb-1">Note</div>
              <div className="text-sm bg-gray-50 p-2 rounded text-gray-700">
                {reservation.notes}
              </div>
            </div>
          )}

          {/* Servizi extra */}
          <div className="flex flex-wrap gap-2">
            {reservation.hasLinen && (
              <Badge variant="secondary" className="text-xs">
                Biancheria inclusa
              </Badge>
            )}
            {reservation.hasPets && (
              <Badge variant="secondary" className="text-xs">
                Con animali
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {nights} {nights === 1 ? 'notte' : 'notti'}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
