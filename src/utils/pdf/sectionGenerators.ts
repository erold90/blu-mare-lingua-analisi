
import { jsPDF } from "jspdf";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { PriceCalculation } from "@/utils/quoteCalculator";
import { formatItalianDate, addSeparatorLine } from "./formatUtils";

// Generate the client info section
export const generateClientSection = (doc: jsPDF, formData: FormValues, clientName?: string) => {
  const today = new Date();
  const formattedDate = formatItalianDate(today);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Data preventivo: ${formattedDate}`, 20, 30);
  doc.text(`Rif: ${clientName || formData.name || "Cliente"}`, 20, 35);
};

// Generate the stay details section
export const generateStayDetailsSection = (doc: jsPDF, formData: FormValues) => {
  let y = 45;
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Dettagli del Soggiorno", 20, y);
  y += 2;
  
  // Add separator line
  addSeparatorLine(doc, y);
  y += 8;
  
  // Set font for details
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  // Date information
  if (formData.checkIn && formData.checkOut) {
    const checkIn = formatItalianDate(new Date(formData.checkIn));
    const checkOut = formatItalianDate(new Date(formData.checkOut));
    doc.text(`Check-in: ${checkIn}`, 20, y);
    y += 7;
    doc.text(`Check-out: ${checkOut}`, 20, y);
    y += 7;
    
    // Calculate stay duration
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    doc.text(`Durata del soggiorno: ${diffDays} notti`, 20, y);
    y += 10;
  }
  
  // Guest information
  const totalGuests = (formData.adults || 0) + (formData.children || 0);
  doc.text(`Numero totale di ospiti: ${totalGuests}`, 20, y);
  y += 7;
  doc.text(`- Adulti: ${formData.adults || 0}`, 30, y);
  y += 7;
  doc.text(`- Bambini: ${formData.children || 0}`, 30, y);
  
  return y + 10; // Return the next Y position
};

// Generate the apartment section
export const generateApartmentSection = (doc: jsPDF, selectedApt: Apartment, yStart: number) => {
  let y = yStart;
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Appartamento Selezionato", 20, y);
  y += 2;
  
  // Add separator line
  addSeparatorLine(doc, y);
  y += 8;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${selectedApt.name}`, 20, y);
  y += 7;
  
  if (selectedApt.description) {
    const pageWidth = doc.internal.pageSize.width;
    const descLines = doc.splitTextToSize(selectedApt.description, pageWidth - 40);
    doc.text(descLines, 20, y);
    y += descLines.length * 7 + 3;
  }
  
  doc.text(`Capacità massima: ${selectedApt.capacity} persone`, 20, y);
  
  return y + 7; // Return the next Y position
};

// Generate the costs table
export const generateCostsTable = (doc: jsPDF, priceCalculation: PriceCalculation, formData: FormValues, yStart: number) => {
  let y = yStart + 10;
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Dettaglio Costi", 20, y);
  y += 2;
  
  // Add separator line
  addSeparatorLine(doc, y);
  
  // Prepare table data
  const tableBody = [];
  
  // Base apartment cost
  tableBody.push(["Costo base appartamento", "", `€ ${priceCalculation.basePrice.toFixed(2)}`]);
  
  // Selected extras
  if (formData.linenOption && priceCalculation.extras > 0) {
    let linenText;
    switch(formData.linenOption) {
      case "extra":
        linenText = "Biancheria Extra";
        break;
      case "deluxe":
        linenText = "Biancheria Deluxe";
        break;
      default:
        linenText = "Biancheria Standard";
    }
    tableBody.push([linenText, "", `€ ${priceCalculation.extras.toFixed(2)}`]);
  }
  
  // Final cleaning
  tableBody.push(["Pulizia finale", "", `€ ${priceCalculation.cleaningFee.toFixed(2)}`]);
  
  // Tourist tax
  tableBody.push(["Tassa di soggiorno", "", `€ ${priceCalculation.touristTax.toFixed(2)}`]);
  
  // Discount (if applicable)
  if (priceCalculation.discount > 0) {
    tableBody.push(["Sconto", "", `- € ${priceCalculation.discount.toFixed(2)}`]);
  }
  
  // Total
  tableBody.push(["Totale", "", `€ ${priceCalculation.totalAfterDiscount.toFixed(2)}`]);
  
  return tableBody;
};

// Generate notes section
export const generateNotesSection = (doc: jsPDF, yStart: number) => {
  let y = yStart + 15;
  
  doc.setFontSize(10);
  doc.text("Note:", 20, y);
  y += 5;
  
  const notes = "Il presente preventivo ha validità di 7 giorni dalla data di emissione.";
  const pageWidth = doc.internal.pageSize.width;
  const noteLines = doc.splitTextToSize(notes, pageWidth - 40);
  doc.text(noteLines, 20, y);
  y += noteLines.length * 5 + 10;
  
  doc.text("Per confermare la prenotazione è richiesto un acconto del 30% del totale.", 20, y);
  y += 5;
  doc.text("Il saldo dovrà essere effettuato all'arrivo.", 20, y);
};
