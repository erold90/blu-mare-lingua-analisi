
import { jsPDF } from "jspdf";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { PriceCalculation } from "@/utils/quoteCalculator";
import { formatItalianDate, addSeparatorLine, addHeaderBackground } from "./formatUtils";
import { AutoTableResult } from "./types";

// Generate the client info section
export const generateClientSection = (doc: jsPDF, formData: FormValues, clientName?: string) => {
  const today = new Date();
  const formattedDate = formatItalianDate(today);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Data preventivo: ${formattedDate}`, 20, 30);
  
  if (clientName || formData.name) {
    doc.text(`Rif: ${clientName || formData.name}`, 20, 35);
    
    // Add client contact details if available
    let y = 40;
    if (formData.email) {
      doc.text(`Email: ${formData.email}`, 20, y);
      y += 5;
    }
    
    if (formData.phone) {
      doc.text(`Telefono: ${formData.phone}`, 20, y);
      y += 5;
    }
  }
  
  return 45; // Return next Y position
};

// Generate the stay details section
export const generateStayDetailsSection = (doc: jsPDF, formData: FormValues) => {
  let y = 50;
  
  // Add section heading with background
  doc.setFillColor(235, 235, 235);
  doc.rect(20, y - 5, doc.internal.pageSize.getWidth() - 40, 8, 'F');
  
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
    
    // Add arrival time information
    doc.text("Orario check-in: Dalle 15:00 alle 19:00", 20, y);
    y += 7;
    doc.text("Orario check-out: Entro le 10:00", 20, y);
    y += 10;
  }
  
  // Guest information
  const totalGuests = (formData.adults || 0) + (formData.children || 0);
  doc.text(`Numero totale di ospiti: ${totalGuests}`, 20, y);
  y += 7;
  doc.text(`- Adulti: ${formData.adults || 0}`, 30, y);
  y += 7;
  doc.text(`- Bambini: ${formData.children || 0}`, 30, y);
  
  // Pet information if applicable
  if (formData.hasPets && formData.petsCount && formData.petsCount > 0) {
    y += 7;
    doc.text(`- Animali domestici: ${formData.petsCount}`, 30, y);
    
    if (formData.petSize) {
      let petSizeText = "";
      switch(formData.petSize) {
        case "small": petSizeText = "piccola taglia"; break;
        case "medium": petSizeText = "media taglia"; break;
        case "large": petSizeText = "grande taglia"; break;
      }
      y += 7;
      doc.text(`  (${petSizeText})`, 30, y);
    }
  }
  
  return y + 10; // Return the next Y position
};

// Generate the apartment section
export const generateApartmentSection = (doc: jsPDF, selectedApt: Apartment, yStart: number) => {
  let y = yStart;
  
  // Add section heading with background
  doc.setFillColor(235, 235, 235);
  doc.rect(20, y - 5, doc.internal.pageSize.getWidth() - 40, 8, 'F');
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Appartamento Selezionato", 20, y);
  y += 2;
  
  // Add separator line
  addSeparatorLine(doc, y);
  y += 8;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Nome: ${selectedApt.name}`, 20, y);
  y += 7;
  
  doc.setFont("helvetica", "normal");
  
  if (selectedApt.description) {
    const pageWidth = doc.internal.pageSize.width;
    const descLines = doc.splitTextToSize(selectedApt.description, pageWidth - 40);
    doc.text(descLines, 20, y);
    y += descLines.length * 7 + 3;
  }
  
  // Add more apartment details
  doc.text(`Capacità massima: ${selectedApt.capacity} persone`, 20, y);
  y += 7;
  
  if (selectedApt.bedrooms) {
    doc.text(`Camere da letto: ${selectedApt.bedrooms}`, 20, y);
    y += 7;
  }
  
  if (selectedApt.bathrooms) {
    doc.text(`Bagni: ${selectedApt.bathrooms}`, 20, y);
    y += 7;
  }
  
  if (selectedApt.size) {
    doc.text(`Superficie: ${selectedApt.size} m²`, 20, y);
    y += 7;
  }
  
  // Add a list of amenities if available
  if (selectedApt.amenities && selectedApt.amenities.length > 0) {
    y += 3;
    doc.setFont("helvetica", "bold");
    doc.text("Servizi inclusi:", 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    
    selectedApt.amenities.forEach((amenity, index) => {
      if (index < 6) { // Limit to prevent overcrowding
        doc.text(`- ${amenity}`, 30, y);
        y += 7;
      } else if (index === 6) {
        doc.text(`- e altri servizi...`, 30, y);
        y += 7;
      }
    });
  }
  
  return y + 7; // Return the next Y position
};

// Generate the costs table
export const generateCostsTable = (doc: jsPDF, priceCalculation: PriceCalculation, formData: FormValues, yStart: number) => {
  let y = yStart + 10;
  
  // Add section heading with background
  doc.setFillColor(235, 235, 235);
  doc.rect(20, y - 5, doc.internal.pageSize.getWidth() - 40, 8, 'F');
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Dettaglio Costi", 20, y);
  y += 2;
  
  // Add separator line
  addSeparatorLine(doc, y);
  
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
  const touristTaxDetails = `${priceCalculation.touristTaxPerPerson.toFixed(2)}€ x ${formData.adults} persone x ${priceCalculation.nights} notti`;
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
  tableBody.push(["Totale", "", `€ ${priceCalculation.totalAfterDiscount.toFixed(2)}`]);
  
  // Calculate deposit (30% of total)
  const deposit = priceCalculation.totalAfterDiscount * 0.3;
  tableBody.push(["Caparra (30%)", "Da versare alla prenotazione", `€ ${deposit.toFixed(2)}`]);
  
  // Calculate remaining balance
  const remainingBalance = priceCalculation.totalAfterDiscount - deposit;
  tableBody.push(["Saldo", "Da versare all'arrivo", `€ ${remainingBalance.toFixed(2)}`]);
  
  // Security deposit (refundable)
  tableBody.push(["Cauzione", "Rimborsabile a fine soggiorno", `€ 200.00`]);
  
  return tableBody;
};

// Generate notes section
export const generateNotesSection = (doc: jsPDF, yStart: number) => {
  let y = yStart + 15;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Termini e Condizioni:", 20, y);
  y += 8;
  
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
  
  notes.forEach(note => {
    doc.text(note, 20, y);
    y += 5;
  });
  
  y += 5;
  doc.setFont("helvetica", "italic");
  const pageWidth = doc.internal.pageSize.getWidth();
  const thanksNote = "Grazie per aver scelto i nostri appartamenti per il vostro soggiorno in Toscana. Vi aspettiamo!";
  const thanksLines = doc.splitTextToSize(thanksNote, pageWidth - 40);
  doc.text(thanksLines, 20, y);
  
  return y + 10;
};

// Generate payment methods section
export const generatePaymentMethodsSection = (doc: jsPDF, yStart: number) => {
  let y = yStart + 10;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Modalità di Pagamento:", 20, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const paymentMethods = [
    "• Bonifico Bancario:",
    "  IBAN: IT00 A000 0000 0000 0000 0000",
    "  Intestatario: Casa Vacanze Toscana",
    "  Causale: Acconto/Saldo + Nome Cliente + Date Soggiorno",
    "",
    "• Carta di Credito (solo al check-in)",
    "• Contanti (solo al check-in, fino a €1.999,99)"
  ];
  
  paymentMethods.forEach(method => {
    doc.text(method, 20, y);
    y += 5;
  });
  
  return y;
};
