
import { jsPDF } from "jspdf";
import { PriceCalculation } from "@/utils/price/types";

/**
 * Generate the totals section (original total, discount, and final total)
 */
export const generateTotalsSection = (doc: jsPDF, priceCalculation: PriceCalculation, yPos: number): number => {
  let currentY = yPos;
  
  const originalTotal = priceCalculation.totalBeforeDiscount;
  const discount = priceCalculation.discount;
  const finalTotal = priceCalculation.totalAfterDiscount;
  
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(doc.internal.pageSize.getWidth() - 80, currentY, doc.internal.pageSize.getWidth() - 10, currentY);
  
  currentY += 5;
  doc.setFontSize(10);
  doc.text("Totale originale:", doc.internal.pageSize.getWidth() - 80, currentY);
  doc.text(`€${originalTotal}`, doc.internal.pageSize.getWidth() - 20, currentY, { align: "right" });
  
  currentY += 7;
  doc.text("Sconto applicato:", doc.internal.pageSize.getWidth() - 80, currentY);
  doc.text(`-€${discount}`, doc.internal.pageSize.getWidth() - 20, currentY, { align: "right" });
  
  currentY += 5;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(doc.internal.pageSize.getWidth() - 80, currentY, doc.internal.pageSize.getWidth() - 10, currentY);
  
  currentY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text("TOTALE FINALE:", doc.internal.pageSize.getWidth() - 80, currentY);
  doc.text(`€${finalTotal}`, doc.internal.pageSize.getWidth() - 20, currentY, { align: "right" });
  
  return currentY + 25; // Return next Y position
};
