
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
  
  // Configure label position
  const labelX = 25; // X position for labels
  doc.setFont('helvetica', 'bold');
  
  // Check if dates are available
  if (formData.checkIn && formData.checkOut) {
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const nights = priceCalculation.nights || 0;
    
    // Format dates for display
    const checkInFormatted = formatItalianDate(checkInDate);
    const checkOutFormatted = formatItalianDate(checkOutDate);
    
    // Improved layout with clear date information
    doc.text("Periodo:", labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dal ${checkInFormatted} al ${checkOutFormatted}`, labelX + 60, currentY);
    currentY += 8;
    
    doc.setFont('helvetica', 'bold');
    doc.text("Durata:", labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${nights} notti`, labelX + 60, currentY);
    currentY += 8;
  }
  
  // Add guest composition with more details
  const adults = formData.adults || 0;
  const children = formData.children || 0;
  const totalGuests = adults + children;
  
  doc.setFont('helvetica', 'bold');
  doc.text("Ospiti:", labelX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${totalGuests} totali (${adults} adulti, ${children} bambini)`, labelX + 60, currentY);
  currentY += 8;
  
  // Add name if available with better formatting
  if (formData.name) {
    doc.setFont('helvetica', 'bold');
    doc.text("Nome:", labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.name, labelX + 60, currentY);
    currentY += 8;
  }
  
  // Add email if available
  if (formData.email) {
    doc.setFont('helvetica', 'bold');
    doc.text("Email:", labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.email, labelX + 60, currentY);
    currentY += 8;
  }
  
  // Add phone if available
  if (formData.phone) {
    doc.setFont('helvetica', 'bold');
    doc.text("Telefono:", labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.phone, labelX + 60, currentY);
    currentY += 8;
  }
  
  // Add a note about the guest
  if (formData.notes) {
    currentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text("Note:", labelX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.notes, labelX + 60, currentY);
    currentY += 8;
  }
  
  // Reset font
  doc.setFont('helvetica', 'normal');
  
  return currentY + 10; // Return next Y position with padding
};
