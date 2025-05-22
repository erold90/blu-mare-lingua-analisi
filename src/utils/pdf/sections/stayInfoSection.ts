
import { jsPDF } from "jspdf";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { createSection, formatItalianDate } from "../formatUtils";

/**
 * Generate the stay details section of the quote with elegant design
 */
export const generateStayInfoSection = (doc: jsPDF, formData: FormValues, priceCalculation: PriceCalculation, yPos: number): number => {
  // Create section title
  let currentY = createSection(doc, "DETTAGLI SOGGIORNO", yPos);
  
  // Add a light background to make the section stand out
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(245, 248, 252);
  doc.roundedRect(10, currentY, pageWidth - 20, 60, 3, 3, 'F'); // Reduced height
  
  // Add some padding
  currentY += 5; // Reduced padding
  
  // Configure label position
  const labelX = 25; // X position for labels
  const valueX = 85; // X position for values
  const lineHeight = 6; // Reduced line height
  
  // Check if dates are available
  if (formData.checkIn && formData.checkOut) {
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const nights = priceCalculation.nights || 0;
    
    // Format dates for display
    const checkInFormatted = formatItalianDate(checkInDate);
    const checkOutFormatted = formatItalianDate(checkOutDate);
    
    // Improved layout with clear date information
    doc.setFont('helvetica', 'bold');
    doc.text("Periodo:", labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dal ${checkInFormatted} al ${checkOutFormatted}`, valueX, currentY);
    currentY += lineHeight;
    
    doc.setFont('helvetica', 'bold');
    doc.text("Durata:", labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${nights} notti`, valueX, currentY);
    currentY += lineHeight;
  }
  
  // Add guest composition with more details
  const adults = formData.adults || 0;
  const children = formData.children || 0;
  const totalGuests = adults + children;
  
  doc.setFont('helvetica', 'bold');
  doc.text("Ospiti:", labelX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${totalGuests} totali (${adults} adulti, ${children} bambini)`, valueX, currentY);
  currentY += lineHeight;
  
  // Add name if available with better formatting
  if (formData.name) {
    doc.setFont('helvetica', 'bold');
    doc.text("Nome:", labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.name, valueX, currentY);
    currentY += lineHeight;
  }
  
  // Add email if available
  if (formData.email) {
    doc.setFont('helvetica', 'bold');
    doc.text("Email:", labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.email, valueX, currentY);
    currentY += lineHeight;
  }
  
  // Add phone if available
  if (formData.phone) {
    doc.setFont('helvetica', 'bold');
    doc.text("Telefono:", labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.phone, valueX, currentY);
    currentY += lineHeight;
  }
  
  // Add a note about the guest - only if there's space
  if (formData.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text("Note:", labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.notes, valueX, currentY);
    currentY += lineHeight;
  }
  
  // Reset font
  doc.setFont('helvetica', 'normal');
  
  return currentY + 5; // Return next Y position with minimal padding
};
