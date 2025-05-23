
import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reservation, Apartment } from "@/hooks/useReservations";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";

interface ReservationSummaryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation | null;
  apartments: Apartment[];
}

export const ReservationSummaryDialog = ({ 
  isOpen, 
  onOpenChange, 
  reservation,
  apartments 
}: ReservationSummaryDialogProps) => {
  const isMobile = useIsMobile();

  if (!reservation) return null;

  const selectedApartments = apartments.filter(apt => 
    reservation.apartmentIds.includes(apt.id)
  );

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: it });
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "cash": return "Contanti";
      case "bankTransfer": return "Bonifico";
      case "creditCard": return "Carta di Credito";
      default: return method;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "notPaid": return "Non Pagato";
      case "deposit": return "Caparra";
      case "paid": return "Pagato";
      default: return status;
    }
  };

  const printPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RIEPILOGO PRENOTAZIONE', 105, 20, { align: 'center' });
    
    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    let yPos = 40;
    
    // Guest information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAZIONI OSPITE', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${reservation.guestName}`, 20, yPos);
    yPos += 7;
    doc.text(`Adulti: ${reservation.adults}`, 20, yPos);
    yPos += 7;
    doc.text(`Bambini: ${reservation.children}`, 20, yPos);
    yPos += 7;
    if (reservation.cribs > 0) {
      doc.text(`Culle: ${reservation.cribs}`, 20, yPos);
      yPos += 7;
    }
    doc.text(`Animali domestici: ${reservation.hasPets ? 'Sì' : 'No'}`, 20, yPos);
    yPos += 7;
    doc.text(`Biancheria: ${reservation.hasLinen ? 'Sì' : 'No'}`, 20, yPos);
    yPos += 15;
    
    // Stay details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DETTAGLI SOGGIORNO', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Appartamenti: ${selectedApartments.map(apt => apt.name).join(', ')}`, 20, yPos);
    yPos += 7;
    doc.text(`Check-in: ${formatDate(reservation.startDate)}`, 20, yPos);
    yPos += 7;
    doc.text(`Check-out: ${formatDate(reservation.endDate)}`, 20, yPos);
    yPos += 15;
    
    // Payment details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DETTAGLI PAGAMENTO', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Prezzo totale: €${reservation.finalPrice.toFixed(2)}`, 20, yPos);
    yPos += 7;
    doc.text(`Metodo di pagamento: ${getPaymentMethodText(reservation.paymentMethod)}`, 20, yPos);
    yPos += 7;
    doc.text(`Stato pagamento: ${getPaymentStatusText(reservation.paymentStatus)}`, 20, yPos);
    yPos += 7;
    
    if (reservation.paymentStatus === "deposit" && reservation.depositAmount) {
      doc.text(`Importo caparra: €${reservation.depositAmount.toFixed(2)}`, 20, yPos);
      yPos += 7;
    }
    
    // Notes
    if (reservation.notes) {
      yPos += 8;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTE', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const splitNotes = doc.splitTextToSize(reservation.notes, 170);
      doc.text(splitNotes, 20, yPos);
    }
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text(`Generato il ${format(new Date(), "dd/MM/yyyy 'alle' HH:mm", { locale: it })}`, 20, pageHeight - 20);
    
    // Save PDF
    doc.save(`prenotazione-${reservation.guestName.replace(/\s+/g, '-')}-${reservation.id}.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-2xl max-h-[90vh] overflow-y-auto",
        isMobile && "w-[95vw] p-4"
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Riepilogo Prenotazione
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Guest Information */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold border-b pb-2">Informazioni Ospite</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Nome:</span> {reservation.guestName}
              </div>
              <div>
                <span className="font-medium">Adulti:</span> {reservation.adults}
              </div>
              <div>
                <span className="font-medium">Bambini:</span> {reservation.children}
              </div>
              {reservation.cribs > 0 && (
                <div>
                  <span className="font-medium">Culle:</span> {reservation.cribs}
                </div>
              )}
              <div>
                <span className="font-medium">Animali:</span> {reservation.hasPets ? 'Sì' : 'No'}
              </div>
              <div>
                <span className="font-medium">Biancheria:</span> {reservation.hasLinen ? 'Sì' : 'No'}
              </div>
            </div>
          </div>

          {/* Stay Details */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold border-b pb-2">Dettagli Soggiorno</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Appartamenti:</span>
                <div className="mt-1">
                  {selectedApartments.map(apt => (
                    <span key={apt.id} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs mr-2 mb-1">
                      {apt.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium">Check-in:</span> {formatDate(reservation.startDate)}
              </div>
              <div>
                <span className="font-medium">Check-out:</span> {formatDate(reservation.endDate)}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold border-b pb-2">Dettagli Pagamento</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Prezzo totale:</span> €{reservation.finalPrice.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Metodo:</span> {getPaymentMethodText(reservation.paymentMethod)}
              </div>
              <div>
                <span className="font-medium">Stato:</span> 
                <span className={cn(
                  "ml-1 px-2 py-1 rounded-full text-xs",
                  reservation.paymentStatus === "paid" ? "bg-green-100 text-green-800" :
                  reservation.paymentStatus === "deposit" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                )}>
                  {getPaymentStatusText(reservation.paymentStatus)}
                </span>
              </div>
              {reservation.paymentStatus === "deposit" && reservation.depositAmount && (
                <div>
                  <span className="font-medium">Caparra:</span> €{reservation.depositAmount.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {reservation.notes && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold border-b pb-2">Note</h3>
              <p className="text-sm bg-gray-50 p-3 rounded-md">
                {reservation.notes}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className={cn("gap-2", isMobile && "flex-col")}>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className={isMobile ? "w-full" : ""}
          >
            Chiudi
          </Button>
          <Button 
            onClick={printPDF}
            className={cn("gap-2", isMobile && "w-full")}
          >
            <Printer className="h-4 w-4" />
            Stampa PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
