
import { jsPDF } from "jspdf";
import { Apartment } from "@/data/apartments";
import { createSection, createInfoRow } from "../formatUtils";

/**
 * Generate the apartment list section of the quote
 */
export const generateApartmentListSection = (doc: jsPDF, selectedApts: Apartment[], yPos: number): number => {
  // Add selected apartments
  const apartmentNames = selectedApts.map(apt => apt.name).join(', ');
  return createInfoRow(doc, "Appartamenti:", apartmentNames, yPos);
};
