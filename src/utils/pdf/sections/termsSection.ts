
import { jsPDF } from "jspdf";
import { createSection } from "../formatUtils";

/**
 * Generate the terms and conditions section of the quote
 */
export const generateTermsSection = (doc: jsPDF, yPos: number): number => {
  // Create section heading with background
  let currentY = createSection(doc, "TERMINI E CONDIZIONI", yPos);
  currentY += 10;
  
  // Set font for terms
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Add terms content with better formatting
  const baseX = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 30;
  
  // Add light background for terms
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(230, 235, 240);
  doc.roundedRect(baseX - 5, currentY - 5, contentWidth + 10, 100, 3, 3, 'FD');
  
  // Add individual terms with proper spacing
  doc.setFont('helvetica', 'bold');
  doc.text("1. Prenotazione e pagamento", baseX, currentY);
  doc.setFont('helvetica', 'normal');
  currentY += 10;
  doc.text(
    "La prenotazione è considerata confermata solo dopo il versamento della caparra confirmatoria del 30% dell'importo totale. " +
    "Il saldo dovrà essere versato all'arrivo in contanti o con carta di credito.",
    baseX, currentY, { maxWidth: contentWidth }
  );
  
  currentY += 15;
  doc.setFont('helvetica', 'bold');
  doc.text("2. Cancellazione", baseX, currentY);
  doc.setFont('helvetica', 'normal');
  currentY += 10;
  doc.text(
    "In caso di cancellazione fino a 30 giorni prima dell'arrivo, la caparra verrà restituita al 100%. " +
    "Per cancellazioni tra 30 e 15 giorni prima dell'arrivo, verrà trattenuto il 50% della caparra. " +
    "Per cancellazioni a meno di 15 giorni dall'arrivo, l'intera caparra verrà trattenuta.",
    baseX, currentY, { maxWidth: contentWidth }
  );
  
  currentY += 20;
  doc.setFont('helvetica', 'bold');
  doc.text("3. Check-in e Check-out", baseX, currentY);
  doc.setFont('helvetica', 'normal');
  currentY += 10;
  doc.text(
    "Il check-in è previsto dalle ore 15:00 alle 19:00. Il check-out deve essere effettuato entro le ore 10:00. " +
    "Orari diversi devono essere concordati in anticipo.",
    baseX, currentY, { maxWidth: contentWidth }
  );
  
  // Add note about full terms
  currentY += 20;
  doc.setFont('helvetica', 'italic');
  doc.text(
    "Questo preventivo è valido per 7 giorni dalla data di emissione. Il regolamento completo della struttura " + 
    "sarà disponibile all'arrivo o su richiesta.",
    baseX, currentY, { maxWidth: contentWidth }
  );
  
  // Reset font
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  return currentY + 15;
};
