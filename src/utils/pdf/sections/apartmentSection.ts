
import { jsPDF } from "jspdf";
import { Apartment } from "@/data/apartments";
import { addSectionHeader } from "../formatUtils";

// Generate the apartment section
export const generateApartmentSection = (doc: jsPDF, selectedApt: Apartment, yStart: number) => {
  let y = yStart;
  
  // Add elegant section header
  y = addSectionHeader(doc, "ALLOGGIO SELEZIONATO", y);
  y += 10;
  
  // Create apartment info box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(20, y, doc.internal.pageSize.getWidth() - 40, 50, 3, 3, 'FD');
  
  // Apartment name with styling
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(47, 84, 150);
  doc.text(`${selectedApt.name}`, 25, y + 10);
  doc.setTextColor(0, 0, 0);
  
  // Apartment details in a clean layout
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Create a two-column layout for apartment details
  const colWidth = (doc.internal.pageSize.getWidth() - 50) / 2;
  
  // Left column: Description
  if (selectedApt.description) {
    const descLines = doc.splitTextToSize(selectedApt.description, colWidth - 10);
    doc.text(descLines, 25, y + 20);
  }
  
  // Right column: Features
  const rightColX = 25 + colWidth;
  let rightColY = y + 20;
  
  // Features with icons
  doc.text(`👥 Capacità: ${selectedApt.capacity} persone`, rightColX, rightColY);
  rightColY += 8;
  
  if (selectedApt.bedrooms) {
    doc.text(`🛏️ Camere: ${selectedApt.bedrooms}`, rightColX, rightColY);
    rightColY += 8;
  }
  
  if ('bathrooms' in selectedApt && selectedApt.bathrooms) {
    doc.text(`🚿 Bagni: ${selectedApt.bathrooms}`, rightColX, rightColY);
    rightColY += 8;
  }
  
  if (selectedApt.size) {
    doc.text(`📏 Superficie: ${selectedApt.size} m²`, rightColX, rightColY);
    rightColY += 8;
  }
  
  y += 60;
  
  // Add a list of services if available
  if (selectedApt.services && selectedApt.services.length > 0) {
    // Services box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(220, 225, 235);
    doc.roundedRect(20, y, doc.internal.pageSize.getWidth() - 40, 40, 3, 3, 'FD');
    
    doc.setFont("helvetica", "bold");
    doc.text("✓ Servizi inclusi", 25, y + 10);
    doc.setFont("helvetica", "normal");
    
    // Create a multi-column layout for services
    const serviceColWidth = (doc.internal.pageSize.getWidth() - 50) / 3;
    let serviceX = 25;
    let serviceY = y + 20;
    const maxServicesPerCol = 3;
    
    selectedApt.services.forEach((service, index) => {
      if (index < 9) { // Limit to prevent overcrowding
        // Start a new column after every maxServicesPerCol items
        if (index > 0 && index % maxServicesPerCol === 0) {
          serviceX += serviceColWidth;
          serviceY = y + 20;
        }
        
        doc.text(`• ${service}`, serviceX, serviceY);
        serviceY += 8;
      }
    });
    
    // If there are more services than shown, indicate that
    if (selectedApt.services.length > 9) {
      doc.text("• e altri servizi...", serviceX, serviceY);
    }
    
    y += 50;
  }
  
  return y + 10; // Return the next Y position
};
