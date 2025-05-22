
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
  currentY += 5; // Add some spacing
  
  // Calculate security deposit based on number of apartments
  const depositPerApartment = 200;
  const totalDeposit = depositPerApartment * selectedApts.length;
  
  // Add a light background for the deposit information
  doc.setFillColor(245, 248, 252);
  doc.setDrawColor(220, 230, 240);
  doc.roundedRect(12, currentY, doc.internal.pageSize.getWidth() - 24, 40, 3, 3, 'FD');
  
  // Add heading inside the box
  currentY += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 50, 100);
  doc.text("Dettagli cauzione:", 20, currentY);
  doc.setTextColor(0, 0, 0);
  
  // Add deposit amount with detailed explanation
  currentY += 13;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const depositText = `€ ${depositPerApartment} per appartamento × ${selectedApts.length} ${selectedApts.length > 1 ? 'appartamenti' : 'appartamento'} = € ${totalDeposit} totali`;
  doc.text(depositText, 20, currentY);
  
  // Add payment note with more details
  doc.setFont('helvetica', 'italic');
  currentY += 12;
  const pageWidth = doc.internal.pageSize.getWidth();
  const paymentNote = "La cauzione deve essere versata in contanti o con carta di credito all'arrivo e sarà restituita alla partenza dopo il controllo dell'appartamento, a condizione che non vi siano danni o mancanze.";
  doc.setFontSize(9);
  doc.text(paymentNote, 20, currentY, { maxWidth: pageWidth - 40, align: 'left' });
  
  // Reset font
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Add separator
  currentY += 20;
  currentY = drawSeparatorLine(doc, currentY, {
    color: [220, 230, 240],
    marginLeft: 12,
    marginRight: 12
  });
  
  return currentY + 5; // Return next Y position with some padding
};
