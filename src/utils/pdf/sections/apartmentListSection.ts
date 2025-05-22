
import { jsPDF } from "jspdf";
import { Apartment } from "@/data/apartments";
import { createSection, createInfoRow } from "../formatUtils";

/**
 * Generate the apartment list section of the quote
 */
export const generateApartmentListSection = (doc: jsPDF, selectedApts: Apartment[], yPos: number): number => {
  // Add a short description before listing apartments
  let currentY = yPos;
  
  // Add selected apartments with detailed information
  if (selectedApts.length === 1) {
    // Single apartment scenario
    const apt = selectedApts[0];
    currentY = createInfoRow(doc, "Appartamento:", apt.name, currentY);
    currentY = createInfoRow(doc, "Posti letto:", `${apt.beds} (${apt.bedrooms} camere)`, currentY);
    currentY = createInfoRow(doc, "Dimensione:", `${apt.size} m²`, currentY);
  } else {
    // Multiple apartments scenario
    currentY = createInfoRow(doc, "Appartamenti:", selectedApts.map(apt => apt.name).join(', '), currentY);
    
    // Add a detail row for each apartment
    selectedApts.forEach(apt => {
      const aptDetails = `${apt.name}: ${apt.beds} posti letto, ${apt.bedrooms} camere, ${apt.size} m²`;
      currentY = createInfoRow(doc, "", aptDetails, currentY);
    });
  }
  
  return currentY; // Return next Y position
};
