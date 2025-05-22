
import { jsPDF } from "jspdf";
import { PriceCalculation } from "@/utils/price/types";
import { createSection } from "../formatUtils";

interface TotalSectionOptions {
  keyWidth?: number;
  valueX?: number;
  fontSize?: number;
  keyStyle?: 'bold' | 'normal' | 'italic';
  valueStyle?: 'bold' | 'normal' | 'italic';
}

/**
 * Generate the totals section of the quote
 */
export const generateTotalsSection = (doc: jsPDF, priceCalculation: PriceCalculation, yPos: number): number => {
  // Add section heading with background
  let currentY = createSection(doc, "TOTALE SOGGIORNO", yPos);
  currentY += 10;
  
  // Configure formatting for the totals section
  const baseX = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const midPoint = pageWidth / 2;
  
  // Create a highlight box for the totals area
  doc.setFillColor(245, 250, 255);
  doc.setDrawColor(230, 240, 250);
  doc.roundedRect(baseX - 5, currentY - 5, pageWidth - (baseX * 2) + 10, 90, 3, 3, 'FD');
  
  // Add subtotal row
  currentY = addTotalRow(doc, "Totale appartamenti:", `€ ${priceCalculation.basePrice}`, currentY, {
    valueX: 120
  });
  
  // Add extras cost if applicable
  if (priceCalculation.extras > 0) {
    currentY = addTotalRow(doc, "Extra e servizi:", `€ ${priceCalculation.extras}`, currentY, {
      valueX: 120
    });
  }
  
  // Add cleaning fee if applicable
  if (priceCalculation.cleaningFee > 0) {
    currentY = addTotalRow(doc, "Pulizia finale:", `€ ${priceCalculation.cleaningFee}`, currentY, {
      valueX: 120
    });
  }
  
  // Add tourist tax if applicable
  if (priceCalculation.touristTax > 0) {
    currentY = addTotalRow(doc, "Tassa di soggiorno:", `€ ${priceCalculation.touristTax}`, currentY, {
      valueX: 120
    });
  }
  
  // Add separator line before the total
  currentY += 5;
  doc.setDrawColor(190, 200, 220);
  doc.setLineWidth(0.5);
  doc.line(baseX, currentY, pageWidth - baseX, currentY);
  currentY += 10;
  
  // Add grand total with highlight
  doc.setFillColor(235, 245, 255);
  doc.roundedRect(baseX - 2, currentY - 5, pageWidth - (baseX * 2) + 4, 25, 2, 2, 'F');
  
  // Format the total price - Fix: use totalAfterDiscount instead of total
  const formattedTotal = priceCalculation.totalAfterDiscount.toLocaleString('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  // Add the total amount with larger font
  addTotalRow(doc, "TOTALE:", formattedTotal, currentY, {
    fontSize: 12,
    keyStyle: 'bold',
    valueStyle: 'bold',
    valueX: 120
  });
  
  // Add a note about reservation
  currentY += 30;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  const reservationNote = "Per confermare la prenotazione è richiesto un acconto del 30% del totale.";
  doc.text(reservationNote, baseX, currentY);
  
  // Add payment details
  currentY += 8;
  const paymentNote = "Il saldo dovrà essere versato all'arrivo in contanti o con carta di credito.";
  doc.text(paymentNote, baseX, currentY);
  
  // Reset font
  doc.setFont('helvetica', 'normal');
  
  return currentY + 15; // Return next Y position with some padding
};

/**
 * Helper function to add a total row with label and value
 */
const addTotalRow = (
  doc: jsPDF, 
  label: string, 
  value: string, 
  yPos: number,
  options: TotalSectionOptions = {}
): number => {
  // Set default options
  const {
    fontSize = 10,
    keyStyle = 'normal',
    valueStyle = 'normal',
    valueX = 120
  } = options;
  
  const baseX = 15;
  
  // Set font size and style for label
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', keyStyle);
  doc.text(label, baseX, yPos);
  
  // Set font for value (may be different style)
  doc.setFont('helvetica', valueStyle);
  
  // Add value at the correct position
  doc.text(value, valueX, yPos);
  
  // Reset font
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10); // Reset to default font size
  
  return yPos + 8; // Return next Y position
};
