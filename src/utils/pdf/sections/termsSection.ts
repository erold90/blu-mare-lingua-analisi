
import { jsPDF } from "jspdf";
import { createSection } from "../formatUtils";

/**
 * Generate the terms and conditions section
 */
export const generateTermsSection = (doc: jsPDF, yPos: number): number => {
  // Add section title
  let currentY = createSection(doc, "TERMINI E CONDIZIONI", yPos);
  currentY += 5;
  
  // Add terms content
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const termsContent = [
    "1. La prenotazione è confermata al ricevimento della caparra.",
    "2. Il saldo deve essere effettuato all'arrivo in contanti o con carta di credito.",
    "3. Il check-in è previsto dalle 15:00 alle 19:00. Il check-out entro le 10:00.",
    "4. In caso di cancellazione entro 30 giorni dall'arrivo, la caparra verrà rimborsata al 50%.",
    "5. Gli animali domestici sono ammessi solo se dichiarati al momento della prenotazione.",
    "6. È vietato fumare all'interno degli appartamenti.",
    "7. La pulizia finale è inclusa, ma la cucina deve essere lasciata pulita dagli ospiti."
  ];
  
  termsContent.forEach(term => {
    doc.text(term, 15, currentY, { maxWidth: doc.internal.pageSize.getWidth() - 30 });
    currentY += 6;
  });
  
  // Add a note about validity
  currentY += 10;
  doc.setFont('helvetica', 'italic');
  const validityNote = "Questo preventivo ha una validità di 7 giorni dalla data di emissione.";
  doc.text(validityNote, 15, currentY);
  
  // Reset font
  doc.setFont('helvetica', 'normal');
  
  return currentY;
};
