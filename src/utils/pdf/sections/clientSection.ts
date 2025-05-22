
import { jsPDF } from "jspdf";
import { FormValues } from "@/utils/quoteFormSchema";
import { formatItalianDate } from "../formatUtils";

// Generate the client info section
export const generateClientSection = (doc: jsPDF, formData: FormValues, clientName?: string) => {
  const today = new Date();
  const formattedDate = formatItalianDate(today);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Data preventivo: ${formattedDate}`, 20, 30);
  
  // Add styled client information box
  if (clientName || formData.name) {
    // Create client info box with light background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(220, 225, 235);
    doc.roundedRect(20, 35, doc.internal.pageSize.getWidth() - 130, 25, 3, 3, 'FD');
    
    // Client name with styling
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Cliente: ${clientName || formData.name}`, 25, 43);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    // Contact details with icons (simulated with characters)
    let y = 53;
    if (formData.email) {
      doc.text(`✉ ${formData.email}`, 25, y);
      y += 7;
    }
    
    if (formData.phone) {
      doc.text(`☎ ${formData.phone}`, 25, y);
    }
    
    // Add reference number for the quote in right area
    doc.setFillColor(47, 84, 150);
    doc.setDrawColor(47, 84, 150);
    doc.roundedRect(doc.internal.pageSize.getWidth() - 100, 35, 80, 25, 3, 3, 'FD');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("PREVENTIVO N.", doc.internal.pageSize.getWidth() - 90, 43);
    
    // Generate a quote number based on date
    const quoteNumber = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(quoteNumber, doc.internal.pageSize.getWidth() - 90, 53);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
  }
  
  return 70; // Return next Y position
};
