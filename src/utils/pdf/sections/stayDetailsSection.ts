
import { jsPDF } from "jspdf";
import { FormValues } from "@/utils/quoteFormSchema";
import { formatItalianDate, addSectionHeader } from "../formatUtils";

// Generate the stay details section
export const generateStayDetailsSection = (doc: jsPDF, formData: FormValues) => {
  let y = 75;
  
  // Add elegant section header
  y = addSectionHeader(doc, "DETTAGLI DEL SOGGIORNO", y);
  y += 8;
  
  // Set font for details
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  // Create two columns for better layout
  const colWidth = (doc.internal.pageSize.getWidth() - 40) / 2;
  
  // Left column: Date information
  if (formData.checkIn && formData.checkOut) {
    // Date box with icon
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(220, 225, 235);
    doc.roundedRect(20, y, colWidth - 5, 45, 3, 3, 'FD');
    
    doc.setFont("helvetica", "bold");
    doc.text("📆 Date del soggiorno", 25, y + 8);
    doc.setFont("helvetica", "normal");
    
    const checkIn = formatItalianDate(new Date(formData.checkIn));
    const checkOut = formatItalianDate(new Date(formData.checkOut));
    
    doc.text(`Arrivo: ${checkIn}`, 25, y + 20);
    doc.text(`Partenza: ${checkOut}`, 25, y + 30);
    
    // Calculate stay duration
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    doc.setFont("helvetica", "bold");
    doc.text(`Durata: ${diffDays} notti`, 25, y + 40);
    doc.setFont("helvetica", "normal");
  }
  
  // Right column: Guest information
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(20 + colWidth + 5, y, colWidth - 5, 45, 3, 3, 'FD');
  
  doc.setFont("helvetica", "bold");
  doc.text("👥 Composizione ospiti", 25 + colWidth + 5, y + 8);
  doc.setFont("helvetica", "normal");
  
  const totalGuests = (formData.adults || 0) + (formData.children || 0);
  doc.text(`Adulti: ${formData.adults || 0}`, 25 + colWidth + 5, y + 20);
  doc.text(`Bambini: ${formData.children || 0}`, 25 + colWidth + 5, y + 30);
  
  doc.setFont("helvetica", "bold");
  doc.text(`Totale: ${totalGuests} persone`, 25 + colWidth + 5, y + 40);
  doc.setFont("helvetica", "normal");
  
  y += 55;
  
  // Check-in/out times box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(20, y, doc.internal.pageSize.getWidth() - 40, 30, 3, 3, 'FD');
  
  doc.setFont("helvetica", "bold");
  doc.text("⏰ Orari", 25, y + 8);
  doc.setFont("helvetica", "normal");
  
  doc.text("Check-in: Dalle 15:00 alle 19:00", 25, y + 18);
  doc.text("Check-out: Entro le 10:00", (doc.internal.pageSize.getWidth() / 2) + 10, y + 18);
  
  // Pet information if applicable
  if (formData.hasPets && formData.petsCount && formData.petsCount > 0) {
    y += 40;
    
    // Pet info box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(220, 225, 235);
    doc.roundedRect(20, y, doc.internal.pageSize.getWidth() - 40, 30, 3, 3, 'FD');
    
    doc.setFont("helvetica", "bold");
    doc.text("🐾 Animali domestici", 25, y + 8);
    doc.setFont("helvetica", "normal");
    
    let petSizeText = "";
    if (formData.petSize) {
      switch(formData.petSize) {
        case "small": petSizeText = "piccola taglia"; break;
        case "medium": petSizeText = "media taglia"; break;
        case "large": petSizeText = "grande taglia"; break;
      }
    }
    
    doc.text(`${formData.petsCount} animal${formData.petsCount > 1 ? 'i' : 'e'} di ${petSizeText}`, 25, y + 20);
    
    return y + 40; // Return the next Y position
  }
  
  return y + 40; // Return the next Y position
};
