
import { jsPDF } from "jspdf";
import { PriceCalculation } from "@/utils/price/types";

/**
 * Generate the totals section (original total, discount, and final total)
 * @param doc - PDF document
 * @param priceCalculation - Price calculation object
 * @param yPos - Current Y position
 * @returns Next Y position
 */
export const generateTotalsSection = (doc: jsPDF, priceCalculation: PriceCalculation, yPos: number): number => {
  let currentY = yPos;
  
  const originalTotal = priceCalculation.totalBeforeDiscount;
  const discount = priceCalculation.discount;
  const finalTotal = priceCalculation.totalAfterDiscount;
  
  // Draw separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(doc.internal.pageSize.getWidth() - 80, currentY, doc.internal.pageSize.getWidth() - 10, currentY);
  
  // Show original total
  currentY += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Totale originale:", doc.internal.pageSize.getWidth() - 80, currentY);
  doc.text(`€${originalTotal}`, doc.internal.pageSize.getWidth() - 20, currentY, { align: "right" });
  
  // Show discount amount (only if there is a discount)
  if (discount > 0) {
    currentY += 7;
    doc.setTextColor(0, 128, 0); // Green color for discount
    doc.text("Sconto applicato:", doc.internal.pageSize.getWidth() - 80, currentY);
    doc.text(`-€${discount}`, doc.internal.pageSize.getWidth() - 20, currentY, { align: "right" });
    doc.setTextColor(0, 0, 0); // Reset to black
  } else {
    currentY += 7;
  }
  
  // Draw another separator line
  currentY += 5;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(doc.internal.pageSize.getWidth() - 80, currentY, doc.internal.pageSize.getWidth() - 10, currentY);
  
  // Show final total with bold formatting
  currentY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  
  // Draw highlight box for final total
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(doc.internal.pageSize.getWidth() - 85, currentY - 8, 75, 12, 2, 2, 'F');
  
  // Add final total text
  doc.text("TOTALE FINALE:", doc.internal.pageSize.getWidth() - 80, currentY);
  doc.text(`€${finalTotal}`, doc.internal.pageSize.getWidth() - 20, currentY, { align: "right" });
  
  // Add deposit information
  currentY += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text("Caparra da versare:", doc.internal.pageSize.getWidth() - 80, currentY);
  doc.text(`€${priceCalculation.deposit}`, doc.internal.pageSize.getWidth() - 20, currentY, { align: "right" });
  
  // Add saldo information
  currentY += 7;
  const saldo = finalTotal - priceCalculation.deposit;
  doc.text("Saldo all'arrivo:", doc.internal.pageSize.getWidth() - 80, currentY);
  doc.text(`€${saldo}`, doc.internal.pageSize.getWidth() - 20, currentY, { align: "right" });
  
  return currentY + 25; // Return next Y position with some padding
};
