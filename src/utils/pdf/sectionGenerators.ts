
import { jsPDF } from "jspdf";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { PriceCalculation } from "@/utils/price/types";
import { 
  formatItalianDate, 
  addSeparatorLine, 
  addHeaderBackground, 
  addSectionHeader,
  addInfoBox
} from "./formatUtils";
import { AutoTableResult } from "./types";

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

// Generate the costs table
export const generateCostsTable = (doc: jsPDF, priceCalculation: PriceCalculation, formData: FormValues, yStart: number) => {
  let y = yStart;
  
  // Add elegant section header
  y = addSectionHeader(doc, "DETTAGLIO COSTI", y);
  y += 10;
  
  // Prepare table data
  const tableBody = [];
  
  // Base apartment cost
  tableBody.push(["Costo base appartamento", `${priceCalculation.nights} notti`, `€ ${priceCalculation.basePrice.toFixed(2)}`]);
  
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
  tableBody.push(["Pulizia finale", "Obbligatoria", `€ ${priceCalculation.cleaningFee.toFixed(2)}`]);
  
  // Tourist tax
  // Use default value of 2.0 if touristTaxPerPerson is not defined
  const taxPerPerson = priceCalculation.touristTaxPerPerson || 2.0;
  const touristTaxDetails = `${taxPerPerson.toFixed(2)}€ x ${formData.adults} persone x ${priceCalculation.nights} notti`;
  tableBody.push(["Tassa di soggiorno", touristTaxDetails, `€ ${priceCalculation.touristTax.toFixed(2)}`]);
  
  // Pets fee if applicable
  if (formData.hasPets && formData.petsCount && formData.petsCount > 0) {
    tableBody.push(["Supplemento animali", `${formData.petsCount} animali`, `€ ${(formData.petsCount * 30).toFixed(2)}`]);
  }
  
  // Subtotal
  tableBody.push(["Subtotale", "", `€ ${priceCalculation.subtotal.toFixed(2)}`]);
  
  // Discount (if applicable)
  if (priceCalculation.discount > 0) {
    tableBody.push(["Sconto", "", `- € ${priceCalculation.discount.toFixed(2)}`]);
  }
  
  // Total
  tableBody.push([
    { content: "TOTALE", styles: { fontStyle: 'bold' } }, 
    "", 
    { content: `€ ${priceCalculation.totalAfterDiscount.toFixed(2)}`, styles: { fontStyle: 'bold' } }
  ]);
  
  // Calculate deposit (30% of total)
  const deposit = Math.round(priceCalculation.deposit);
  tableBody.push(["Caparra (30%)", "Da versare alla prenotazione", `€ ${deposit.toFixed(2)}`]);
  
  // Calculate remaining balance
  const remainingBalance = Math.round(priceCalculation.totalAfterDiscount - deposit);
  tableBody.push(["Saldo", "Da versare all'arrivo", `€ ${remainingBalance.toFixed(2)}`]);
  
  // Security deposit (refundable)
  tableBody.push(["Cauzione", "Rimborsabile a fine soggiorno", `€ 200.00`]);
  
  return tableBody;
};

// Generate notes section
export const generateNotesSection = (doc: jsPDF, yStart: number) => {
  let y = yStart + 15;
  
  // Add elegant section header
  y = addSectionHeader(doc, "TERMINI E CONDIZIONI", y);
  y += 10;
  
  // Add styled notes box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(20, y, doc.internal.pageSize.getWidth() - 40, 70, 3, 3, 'FD');
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const notes = [
    "• Il presente preventivo ha validità di 7 giorni dalla data di emissione.",
    "• Per confermare la prenotazione è richiesto un acconto del 30% del totale tramite bonifico bancario.",
    "• Il saldo dovrà essere effettuato all'arrivo in contanti o con carta di credito.",
    "• La cauzione di €200 sarà restituita a fine soggiorno previa verifica dell'appartamento.",
    "• In caso di cancellazione entro 30 giorni dall'arrivo, l'acconto sarà rimborsato al 50%.",
    "• In caso di cancellazione entro 15 giorni dall'arrivo, l'acconto non sarà rimborsato.",
    "• Orario di check-in: dalle 15:00 alle 19:00. Check-in tardivi su richiesta.",
    "• Orario di check-out: entro le 10:00 del giorno di partenza.",
    "• È vietato fumare all'interno dell'appartamento."
  ];
  
  // Break notes into two columns
  const notesPerColumn = Math.ceil(notes.length / 2);
  const colWidth = (doc.internal.pageSize.getWidth() - 50) / 2;
  
  // First column
  let firstColY = y + 10;
  for (let i = 0; i < notesPerColumn; i++) {
    doc.text(notes[i], 25, firstColY);
    firstColY += 7;
  }
  
  // Second column
  let secondColY = y + 10;
  for (let i = notesPerColumn; i < notes.length; i++) {
    doc.text(notes[i], 25 + colWidth, secondColY);
    secondColY += 7;
  }
  
  // Add thank you note at the bottom
  y += 80;
  doc.setFont("helvetica", "italic");
  doc.setTextColor(47, 84, 150);
  const pageWidth = doc.internal.pageSize.getWidth();
  const thanksNote = "Grazie per aver scelto i nostri appartamenti per il vostro soggiorno in Toscana. Vi aspettiamo!";
  const thanksLines = doc.splitTextToSize(thanksNote, pageWidth - 40);
  doc.text(thanksLines, 20, y);
  doc.setTextColor(0, 0, 0);
  
  return y + 10;
};

// Generate payment methods section
export const generatePaymentMethodsSection = (doc: jsPDF, yStart: number) => {
  let y = yStart + 10;
  
  // Add elegant section header
  y = addSectionHeader(doc, "MODALITÀ DI PAGAMENTO", y);
  y += 10;
  
  // Create payment methods box with nice styling
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(20, y, doc.internal.pageSize.getWidth() - 40, 55, 3, 3, 'FD');
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("🏦 Bonifico Bancario", 25, y + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("IBAN: IT00 A000 0000 0000 0000 0000", 25, y + 20);
  doc.text("Intestatario: Casa Vacanze Toscana", 25, y + 28);
  doc.text("Causale: Acconto/Saldo + Nome Cliente + Date Soggiorno", 25, y + 36);
  
  doc.setFont("helvetica", "bold");
  doc.text("💳 Altri Metodi di Pagamento (al check-in)", 25, y + 46);
  doc.setFont("helvetica", "normal");
  
  // Create two columns for payment methods
  const colWidth = (doc.internal.pageSize.getWidth() - 50) / 2;
  doc.text("• Carta di Credito/Debito", 25, y + 54);
  doc.text("• Contanti (fino a €1.999,99)", 25 + colWidth, y + 54);
  
  return y + 65;
};
