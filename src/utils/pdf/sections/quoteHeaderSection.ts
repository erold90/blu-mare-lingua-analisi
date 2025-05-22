
import { jsPDF } from "jspdf";
import { formatItalianDate, addHeader } from "../formatUtils";

/**
 * Generate the header section of the quote PDF with quote number and date
 */
export const generateQuoteHeader = (doc: jsPDF): number => {
  // Add quote number and date with more professional styling
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  
  // Format the quote number with year-month-sequential 
  const quoteNumber = `${currentYear}-${currentMonth}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  
  // Add quote identification - more compact
  doc.setFillColor(245, 248, 252);
  doc.roundedRect(10, 40, doc.internal.pageSize.getWidth() - 20, 12, 2, 2, 'F'); // Reduced height
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Preventivo n. ${quoteNumber}`, 15, 48);
  
  // Add date on the right
  const formattedDate = formatItalianDate(today);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${formattedDate}`, doc.internal.pageSize.getWidth() - 60, 48);
  
  // Reset font
  doc.setFont('helvetica', 'normal');
  
  return 55; // Return next Y position (reduced from 60)
};
