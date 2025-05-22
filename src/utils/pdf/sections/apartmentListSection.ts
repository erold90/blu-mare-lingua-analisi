
import { jsPDF } from "jspdf";
import { Apartment } from "@/data/apartments";
import { createSection } from "../formatUtils";

/**
 * Generate the apartment list section of the quote
 */
export const generateApartmentListSection = (doc: jsPDF, selectedApts: Apartment[], yPos: number): number => {
  let currentY = yPos;
  const lineHeight = 6; // Reduced line height
  
  // Add selected apartments with detailed information
  if (selectedApts.length === 1) {
    // Single apartment scenario - more compact
    const apt = selectedApts[0];
    doc.setFont('helvetica', 'bold');
    doc.text("Appartamento:", 15, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(apt.name, 85, currentY);
    currentY += lineHeight;
    
    doc.setFont('helvetica', 'bold');
    doc.text("Caratteristiche:", 15, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${apt.beds} posti letto, ${apt.bedrooms} camere, ${apt.size} m²`, 85, currentY);
    currentY += lineHeight;
  } else {
    // Multiple apartments scenario - more compact list
    doc.setFont('helvetica', 'bold');
    doc.text("Appartamenti:", 15, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedApts.map(apt => apt.name).join(', '), 85, currentY);
    currentY += lineHeight;
    
    // Add a compact detail row for each apartment
    selectedApts.forEach(apt => {
      const aptDetails = `${apt.name}: ${apt.beds} posti, ${apt.bedrooms} camere, ${apt.size} m²`;
      doc.text(aptDetails, 15, currentY);
      currentY += lineHeight;
    });
  }
  
  return currentY; // Return next Y position
};
