
import { jsPDF } from "jspdf";
import { createSection } from "../formatUtils";

/**
 * Generate the terms & conditions section
 */
export const generateTermsSection = (doc: jsPDF, yPos: number): number => {
  // Add section title
  let currentY = createSection(doc, "TERMINI E CONDIZIONI", yPos);
  currentY += 3; // Reduced spacing
  
  // Create a box for the terms
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(10, currentY, pageWidth - 20, 40, 2, 2, 'F'); // Reduced height
  
  // Add the terms content
  doc.setFontSize(8); // Reduced font size
  doc.setFont('helvetica', 'normal');
  
  // Create an array of terms - compact version
  const terms = [
    "• Validità preventivo: 7 giorni dalla data di emissione",
    "• Acconto: 30% tramite bonifico per conferma",
    "• Saldo: all'arrivo in contanti/carta",
    "• Check-in: 15:00-19:00, Check-out: entro 10:00",
    "• Cancellazione: fino a 30gg rimborso 50%, entro 15gg no rimborso"
  ];
  
  // Add terms as bullet points in a compact format
  let termY = currentY + 5;
  const columnWidth = (pageWidth - 30) / 2;
  const middleX = 15 + columnWidth;
  
  // First column
  for (let i = 0; i < Math.ceil(terms.length / 2); i++) {
    doc.text(terms[i], 15, termY);
    termY += 6; // Reduced spacing
  }
  
  // Reset for second column
  termY = currentY + 5;
  
  // Second column
  for (let i = Math.ceil(terms.length / 2); i < terms.length; i++) {
    doc.text(terms[i], middleX, termY);
    termY += 6; // Reduced spacing
  }
  
  // Add footer note
  currentY += 30; // Position after the terms box
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 120);
  doc.text("Grazie per aver scelto Villa Mareblu per il vostro soggiorno.", pageWidth / 2, currentY, { 
    align: "center" 
  });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  return currentY + 5; // Return next Y position
};
