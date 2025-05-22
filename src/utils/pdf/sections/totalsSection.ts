
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
 * Generate the totals section of the quote with an elegant design
 */
export const generateTotalsSection = (doc: jsPDF, priceCalculation: PriceCalculation, yPos: number): number => {
  // Add section heading with background
  let currentY = createSection(doc, "TOTALE SOGGIORNO", yPos);
  currentY += 3; // Reduced spacing
  
  // Configure formatting for the totals section
  const baseX = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Create an elegant highlight box for the totals area
  doc.setFillColor(245, 248, 252);
  doc.setDrawColor(220, 230, 240);
  doc.roundedRect(baseX - 5, currentY - 5, pageWidth - (baseX * 2) + 10, 60, 3, 3, 'FD'); // Reduced height
  
  const lineHeight = 6; // Reduced line height
  
  // Add subtotal row
  currentY = addTotalRow(doc, "Prezzo base:", `€ ${priceCalculation.basePrice}`, currentY, {
    valueX: 140,
    lineHeight: lineHeight
  });
  
  // Add extras cost if applicable
  if (priceCalculation.extras > 0) {
    currentY = addTotalRow(doc, "Extra e servizi:", `€ ${priceCalculation.extras}`, currentY, {
      valueX: 140,
      lineHeight: lineHeight
    });
  }
  
  // Add cleaning fee if applicable
  if (priceCalculation.cleaningFee > 0) {
    currentY = addTotalRow(doc, "Pulizia finale:", `€ ${priceCalculation.cleaningFee}`, currentY, {
      valueX: 140,
      lineHeight: lineHeight
    });
  }
  
  // Add tourist tax if applicable
  if (priceCalculation.touristTax > 0) {
    currentY = addTotalRow(doc, "Tassa di soggiorno:", `€ ${priceCalculation.touristTax}`, currentY, {
      valueX: 140,
      lineHeight: lineHeight
    });
  }
  
  // Calculate subtotal
  const subtotal = priceCalculation.basePrice + priceCalculation.extras + 
                  priceCalculation.cleaningFee + priceCalculation.touristTax;
                  
  // Add subtotal with line
  currentY += 2; // Reduced spacing
  doc.setDrawColor(200, 210, 220);
  doc.setLineWidth(0.5);
  doc.line(baseX, currentY, pageWidth - baseX, currentY);
  currentY += 4; // Reduced spacing
  
  currentY = addTotalRow(doc, "Subtotale:", `€ ${subtotal}`, currentY, {
    fontSize: 10,
    keyStyle: 'bold',
    valueStyle: 'bold',
    valueX: 140,
    lineHeight: lineHeight
  });
  
  // Add discount if applicable
  if (priceCalculation.discount > 0) {
    currentY = addTotalRow(doc, "Sconto:", `- € ${priceCalculation.discount}`, currentY, {
      valueX: 140,
      valueStyle: 'italic',
      lineHeight: lineHeight
    });
  }
  
  // Add separator line before the final total
  currentY += 2; // Reduced spacing
  doc.setDrawColor(180, 190, 210);
  doc.setLineWidth(0.7);
  doc.line(baseX, currentY, pageWidth - baseX, currentY);
  currentY += 4; // Reduced spacing
  
  // Add final total with highlight
  doc.setFillColor(235, 245, 255);
  doc.roundedRect(baseX - 2, currentY - 3, pageWidth - (baseX * 2) + 4, 15, 2, 2, 'F'); // Reduced height
  
  // Format the total price
  const formattedTotal = priceCalculation.totalAfterDiscount.toLocaleString('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  // Add the total amount with larger font
  currentY = addTotalRow(doc, "TOTALE:", formattedTotal, currentY, {
    fontSize: 11, // Slightly reduced font
    keyStyle: 'bold',
    valueStyle: 'bold',
    valueX: 140,
    lineHeight: lineHeight
  });
  
  // Add details about payments
  currentY += 10; // Reduced spacing
  doc.setFontSize(9); // Reduced font
  doc.setFont('helvetica', 'bold');
  const depositAmount = Math.round(priceCalculation.totalAfterDiscount * 0.30);
  doc.text(`Caparra da versare: € ${depositAmount}`, baseX, currentY);
  
  currentY += 6; // Reduced spacing
  const balanceAmount = priceCalculation.totalAfterDiscount - depositAmount;
  doc.setFont('helvetica', 'normal');
  doc.text(`Saldo all'arrivo: € ${balanceAmount}`, baseX, currentY);
  
  return currentY + 10; // Reduced padding
};

/**
 * Helper function to add a total row with label and value
 */
const addTotalRow = (
  doc: jsPDF, 
  label: string, 
  value: string, 
  yPos: number,
  options: TotalSectionOptions & { lineHeight?: number } = {}
): number => {
  // Set default options
  const {
    fontSize = 9, // Reduced font size
    keyStyle = 'normal',
    valueStyle = 'normal',
    valueX = 140,
    lineHeight = 8 // Default line height if not provided
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
  
  return yPos + lineHeight; // Return next Y position using provided line height
};
