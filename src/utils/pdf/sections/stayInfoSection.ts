
import { jsPDF } from "jspdf";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { createSection, createInfoRow, formatItalianDate } from "../formatUtils";

/**
 * Generate the stay details section of the quote with elegant design
 */
export const generateStayInfoSection = (doc: jsPDF, formData: FormValues, priceCalculation: PriceCalculation, yPos: number): number => {
  // Create section title
  let currentY = createSection(doc, "DETTAGLI SOGGIORNO", yPos);
  
  // Add a light background to make the section stand out
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(245, 248, 252);
  doc.roundedRect(10, currentY, pageWidth - 20, 90, 3, 3, 'F');
  
  // Add some padding
  currentY += 10;
  
  // Check if dates are available
  if (formData.checkIn && formData.checkOut) {
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const nights = priceCalculation.nights || 0;
    
    // Format dates for display
    const checkInFormatted = formatItalianDate(checkInDate);
    const checkOutFormatted = formatItalianDate(checkOutDate);
    
    // Improved layout with clear date information
    currentY = createInfoRow(doc, "Periodo:", `Dal ${checkInFormatted} al ${checkOutFormatted}`, currentY, 25);
    currentY = createInfoRow(doc, "Durata:", `${nights} notti`, currentY, 25);
  }
  
  // Add guest composition with more details
  const adults = formData.adults || 0;
  const children = formData.children || 0;
  const totalGuests = adults + children;
  
  currentY = createInfoRow(doc, "Ospiti:", `${totalGuests} totali (${adults} adulti, ${children} bambini)`, currentY, 25);
  
  // Add name if available with better formatting
  if (formData.name) {
    currentY = createInfoRow(doc, "Nome:", formData.name, currentY, 25);
  }
  
  // Add email if available
  if (formData.email) {
    currentY = createInfoRow(doc, "Email:", formData.email, currentY, 25);
  }
  
  // Add phone if available
  if (formData.phone) {
    currentY = createInfoRow(doc, "Telefono:", formData.phone, currentY, 25);
  }
  
  // Add a note about the guest
  if (formData.notes) {
    currentY += 5;
    currentY = createInfoRow(doc, "Note:", formData.notes, currentY, 25);
  }
  
  return currentY + 10; // Return next Y position with padding
};
