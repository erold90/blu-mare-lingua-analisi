
import { jsPDF } from "jspdf";
import { Apartment } from "@/data/apartments";
import { createSection } from "../formatUtils";

/**
 * Generate the security deposit section
 */
export const generateSecurityDepositSection = (doc: jsPDF, selectedApts: Apartment[], yPos: number): number => {
  let currentY = createSection(doc, "CAUZIONE", yPos);
  
  // Calculate security deposit based on number of apartments
  const depositPerApartment = 200;
  const totalDeposit = depositPerApartment * selectedApts.length;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`€${depositPerApartment} per appartamento x ${selectedApts.length} = €${totalDeposit}`, 12, currentY + 10);
  doc.setFont('helvetica', 'italic');
  doc.text("Da versare in contanti all'arrivo", doc.internal.pageSize.getWidth() - 70, currentY + 10);
  
  return currentY + 30; // Return next Y position
};
