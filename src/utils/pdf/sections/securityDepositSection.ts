
import { jsPDF } from "jspdf";
import { Apartment } from "@/data/apartments";
import { createSection } from "../formatUtils";
import { formatText, drawSeparatorLine } from "../utils/pdfSharedUtils";

/**
 * Generate the security deposit section
 */
export const generateSecurityDepositSection = (doc: jsPDF, selectedApts: Apartment[], yPos: number): number => {
  // Create section header with background
  let currentY = createSection(doc, "CAUZIONE", yPos);
  currentY += 5; // Add some spacing
  
  // Calculate security deposit based on number of apartments
  const depositPerApartment = 200;
  const totalDeposit = depositPerApartment * selectedApts.length;
  
  // Add a light background for the deposit information
  doc.setFillColor(245, 245, 245);
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(12, currentY, doc.internal.pageSize.getWidth() - 24, 30, 3, 3, 'FD');
  
  // Add heading inside the box
  currentY += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("Dettagli cauzione:", 20, currentY);
  
  // Add deposit amount
  currentY += 13;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const depositText = `€${depositPerApartment} per appartamento x ${selectedApts.length} = €${totalDeposit} totali`;
  doc.text(depositText, 20, currentY);
  
  // Add payment note in italic
  doc.setFont('helvetica', 'italic');
  currentY += 10;
  const paymentNote = "La cauzione deve essere versata in contanti all'arrivo e sarà restituita alla partenza dopo il controllo dell'appartamento.";
  doc.text(paymentNote, 20, currentY, { maxWidth: doc.internal.pageSize.getWidth() - 40 });
  
  // Reset font
  doc.setFont('helvetica', 'normal');
  
  // Add separator
  currentY += 15;
  currentY = drawSeparatorLine(doc, currentY, {
    color: [220, 220, 220],
    marginLeft: 12,
    marginRight: 12
  });
  
  return currentY + 5; // Return next Y position with some padding
};
