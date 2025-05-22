
import { jsPDF } from "jspdf";
import { formatItalianDate, addHeader } from "../formatUtils";

/**
 * Generate the header section of the quote PDF with quote number and date
 */
export const generateQuoteHeader = (doc: jsPDF): number => {
  // Add quote number and date
  const today = new Date();
  const quoteNumber = `${today.getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  doc.setFontSize(10);
  doc.text(`Preventivo n. ${quoteNumber}`, 10, 45);
  doc.text(`Data: ${formatItalianDate(today)}`, doc.internal.pageSize.getWidth() - 60, 45);
  
  return 60; // Return next Y position
};
