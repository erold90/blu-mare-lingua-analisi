
import { jsPDF } from "jspdf";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { createSection, createInfoRow, formatItalianDate } from "../formatUtils";

/**
 * Generate the stay details section of the quote
 */
export const generateStayInfoSection = (doc: jsPDF, formData: FormValues, priceCalculation: PriceCalculation, yPos: number): number => {
  let currentY = createSection(doc, "DETTAGLI SOGGIORNO", yPos);
  
  // Check if dates are available
  if (formData.checkIn && formData.checkOut) {
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const nights = priceCalculation.nights || 0;
    
    // Format dates for display
    const checkInFormatted = formatItalianDate(checkInDate);
    const checkOutFormatted = formatItalianDate(checkOutDate);
    
    currentY = createInfoRow(doc, "Periodo:", `${checkInFormatted} - ${checkOutFormatted} (${nights} notti)`, currentY);
  }
  
  // Add guest composition
  const guestComposition = `${formData.adults || 0} adulti, ${formData.children || 0} bambini`;
  currentY = createInfoRow(doc, "Composizione:", guestComposition, currentY);
  
  return currentY; // Return next Y position
};
