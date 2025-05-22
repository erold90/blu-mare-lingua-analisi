
import { jsPDF } from "jspdf";
import { Apartment } from "@/data/apartments";
import { createSection } from "../formatUtils";
import { formatText, drawSeparatorLine } from "../utils/pdfSharedUtils";

/**
 * Generate the security deposit section with improved layout
 */
export const generateSecurityDepositSection = (doc: jsPDF, selectedApts: Apartment[], yPos: number): number => {
  // Create section header with background
  let currentY = createSection(doc, "CAUZIONE", yPos);
  currentY += 2; // Reduced spacing
  
  // Calculate security deposit based on number of apartments
  const depositPerApartment = 200;
  const totalDeposit = depositPerApartment * selectedApts.length;
  
  // Add a light background for the deposit information
  doc.setFillColor(245, 248, 252);
  doc.setDrawColor(220, 230, 240);
  doc.roundedRect(12, currentY, doc.internal.pageSize.getWidth() - 24, 25, 3, 3, 'FD'); // Reduced height
  
  // Add heading inside the box
  currentY += 6; // Reduced spacing
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 50, 100);
  doc.text("Dettagli cauzione:", 20, currentY);
  doc.setTextColor(0, 0, 0);
  
  // Add deposit amount with detailed explanation
  currentY += 8; // Reduced spacing
  doc.setFontSize(9); // Reduced font
  doc.setFont('helvetica', 'normal');
  
  const depositText = `€ ${depositPerApartment} per appartamento × ${selectedApts.length} ${selectedApts.length > 1 ? 'appartamenti' : 'appartamento'} = € ${totalDeposit} totali`;
  doc.text(depositText, 20, currentY);
  
  // Add payment note with more details - more compact version
  doc.setFont('helvetica', 'italic');
  currentY += 8; // Reduced spacing
  const pageWidth = doc.internal.pageSize.getWidth();
  const paymentNote = "Cauzione in contanti/carta all'arrivo, restituita alla partenza dopo controllo dell'appartamento.";
  doc.setFontSize(8); // Reduced font
  doc.text(paymentNote, 20, currentY, { maxWidth: pageWidth - 40, align: 'left' });
  
  // Reset font
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  return currentY + 5; // Reduced spacing
};
