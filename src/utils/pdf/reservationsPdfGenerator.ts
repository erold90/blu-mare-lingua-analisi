
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Reservation, Apartment } from "@/hooks/useSupabaseReservations";
import { formatPaymentStatus } from "@/utils/admin/statusConfig";

interface ReservationsByApartment {
  [apartmentId: string]: {
    apartment: Apartment;
    reservations: Reservation[];
  };
}

export const generateReservationsPdf = (reservations: Reservation[], apartments: Apartment[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = 20;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Riepilogo Prenotazioni', margin, yPosition);
  
  // Subtitle with date
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const currentDate = format(new Date(), "d MMMM yyyy", { locale: it });
  doc.text(`Generato il ${currentDate}`, margin, yPosition);
  
  yPosition += 15;

  // Group reservations by apartment
  const reservationsByApartment: ReservationsByApartment = {};
  
  reservations.forEach(reservation => {
    reservation.apartmentIds.forEach(apartmentId => {
      if (!reservationsByApartment[apartmentId]) {
        const apartment = apartments.find(apt => apt.id === apartmentId);
        if (apartment) {
          reservationsByApartment[apartmentId] = {
            apartment,
            reservations: []
          };
        }
      }
      if (reservationsByApartment[apartmentId]) {
        reservationsByApartment[apartmentId].reservations.push(reservation);
      }
    });
  });

  // Sort reservations within each apartment by arrival date
  Object.keys(reservationsByApartment).forEach(apartmentId => {
    reservationsByApartment[apartmentId].reservations.sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  });

  // Generate content for each apartment
  Object.keys(reservationsByApartment).forEach((apartmentId) => {
    const { apartment, reservations: apartmentReservations } = reservationsByApartment[apartmentId];
    
    yPosition = addApartmentSection(doc, apartment, apartmentReservations, yPosition, pageWidth, margin);
  });

  // Add summary
  yPosition = addSummarySection(doc, reservations, yPosition, margin);

  // Save the PDF
  const fileName = `prenotazioni_${format(new Date(), "yyyy-MM-dd", { locale: it })}.pdf`;
  doc.save(fileName);
};

const addApartmentSection = (
  doc: jsPDF, 
  apartment: Apartment, 
  reservations: Reservation[], 
  yPosition: number, 
  pageWidth: number, 
  margin: number
): number => {
  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Apartment header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setFillColor(59, 130, 246);
  doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(apartment.name, margin + 5, yPosition + 2);
  
  yPosition += 15;
  doc.setTextColor(0, 0, 0);

  if (reservations.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('Nessuna prenotazione', margin + 5, yPosition);
    return yPosition + 15;
  }

  return addReservationsTable(doc, reservations, yPosition, pageWidth, margin, apartment);
};

const addReservationsTable = (
  doc: jsPDF, 
  reservations: Reservation[], 
  yPosition: number, 
  pageWidth: number, 
  margin: number, 
  apartment: Apartment
): number => {
  const headers = ['Ospite', 'Check-in', 'Check-out', 'Ospiti', 'Prezzo', 'Pagamento'];
  const columnWidths = [45, 25, 25, 20, 25, 35];
  
  // Draw table headers
  yPosition = drawTableHeaders(doc, headers, columnWidths, yPosition, pageWidth, margin);

  // Draw reservation rows
  reservations.forEach((reservation, index) => {
    yPosition = drawReservationRow(doc, reservation, index, columnWidths, yPosition, pageWidth, margin, apartment, headers);
  });

  return yPosition + 10;
};

const drawTableHeaders = (
  doc: jsPDF, 
  headers: string[], 
  columnWidths: number[], 
  yPosition: number, 
  pageWidth: number, 
  margin: number
): number => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition - 3, pageWidth - (margin * 2), 8, 'F');
  
  let xPosition = margin;
  headers.forEach((header, index) => {
    doc.text(header, xPosition + 2, yPosition + 2);
    xPosition += columnWidths[index];
  });
  
  return yPosition + 10;
};

const drawReservationRow = (
  doc: jsPDF, 
  reservation: Reservation, 
  index: number, 
  columnWidths: number[], 
  yPosition: number, 
  pageWidth: number, 
  margin: number, 
  apartment: Apartment, 
  headers: string[]
): number => {
  // Check if we need a new page
  if (yPosition > 270) {
    doc.addPage();
    yPosition = 20;
    
    // Repeat apartment header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`${apartment.name} (continua)`, margin + 5, yPosition + 2);
    yPosition += 15;
    doc.setTextColor(0, 0, 0);
    
    // Repeat headers
    yPosition = drawTableHeaders(doc, headers, columnWidths, yPosition, pageWidth, margin);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  // Alternating row colors
  if (index % 2 === 1) {
    doc.setFillColor(248, 248, 248);
    doc.rect(margin, yPosition - 2, pageWidth - (margin * 2), 6, 'F');
  }
  
  let xPosition = margin;
  
  // Guest name
  doc.text(reservation.guestName, xPosition + 2, yPosition + 2);
  xPosition += columnWidths[0];
  
  // Check-in date
  const checkInDate = format(new Date(reservation.startDate), "dd/MM/yy", { locale: it });
  doc.text(checkInDate, xPosition + 2, yPosition + 2);
  xPosition += columnWidths[1];
  
  // Check-out date
  const checkOutDate = format(new Date(reservation.endDate), "dd/MM/yy", { locale: it });
  doc.text(checkOutDate, xPosition + 2, yPosition + 2);
  xPosition += columnWidths[2];
  
  // Guests
  const guestInfo = `${reservation.adults}${reservation.children > 0 ? `+${reservation.children}` : ''}`;
  doc.text(guestInfo, xPosition + 2, yPosition + 2);
  xPosition += columnWidths[3];
  
  // Price
  doc.text(`€${reservation.finalPrice}`, xPosition + 2, yPosition + 2);
  xPosition += columnWidths[4];
  
  // Payment status
  const paymentStatus = formatPaymentStatus(reservation.paymentStatus, reservation.depositAmount);
  doc.text(paymentStatus, xPosition + 2, yPosition + 2);
  
  return yPosition + 8;
};

const addSummarySection = (doc: jsPDF, reservations: Reservation[], yPosition: number, margin: number): number => {
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Riepilogo Generale', margin, yPosition);
  
  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const totalReservations = reservations.length;
  const totalRevenue = reservations.reduce((sum, res) => sum + res.finalPrice, 0);
  const paidReservations = reservations.filter(res => res.paymentStatus === 'paid').length;
  const depositReservations = reservations.filter(res => res.paymentStatus === 'deposit').length;
  const unpaidReservations = reservations.filter(res => res.paymentStatus === 'notPaid').length;
  
  doc.text(`Totale prenotazioni: ${totalReservations}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Ricavi totali: €${totalRevenue.toFixed(2)}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Pagate: ${paidReservations} | Con caparra: ${depositReservations} | Non pagate: ${unpaidReservations}`, margin, yPosition);

  return yPosition;
};
