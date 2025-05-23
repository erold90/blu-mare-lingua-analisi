
import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { MoreVertical, Edit, Trash2, Eye, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reservation, Apartment } from "@/hooks/useReservations";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface MobileReservationCardProps {
  reservation: Reservation;
  apartments: Apartment[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (reservation: Reservation) => void;
  onViewSummary?: (reservation: Reservation) => void;
}

export const MobileReservationCard = ({
  reservation,
  apartments,
  onEdit,
  onDelete,
  onViewDetails,
  onViewSummary
}: MobileReservationCardProps) => {
  const selectedApartments = apartments.filter(apt => 
    reservation.apartmentIds.includes(apt.id)
  );

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "deposit":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "notPaid":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid": return "Pagato";
      case "deposit": return "Caparra";
      case "notPaid": return "Non Pagato";
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM", { locale: it });
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {reservation.guestName}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant="outline" 
              className={cn("text-xs", getPaymentStatusColor(reservation.paymentStatus))}
            >
              {getPaymentStatusText(reservation.paymentStatus)}
            </Badge>
            {reservation.hasPets && (
              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                🐕 Animali
              </Badge>
            )}
            {reservation.hasLinen && (
              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                Biancheria
              </Badge>
            )}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(reservation)}>
              <Eye className="mr-2 h-4 w-4" />
              Dettagli
            </DropdownMenuItem>
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
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Periodo:</span>
          <span className="font-medium">
            {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Ospiti:</span>
          <span className="font-medium">
            {reservation.adults} adulti
            {reservation.children > 0 && `, ${reservation.children} bambini`}
            {reservation.cribs > 0 && `, ${reservation.cribs} culle`}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Appartamenti:</span>
          <span className="font-medium text-right">
            {selectedApartments.map(apt => apt.name).join(", ")}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Prezzo:</span>
          <span className="font-semibold text-lg">
            €{reservation.finalPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
