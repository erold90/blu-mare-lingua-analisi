
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types"; 
import { Apartment } from "@/data/apartments";
import { 
  addHeader, 
  formatItalianDate,
  createSection,
  createInfoRow
} from "./formatUtils";

// Generate a minimalist quote PDF based on the provided example
export const generateQuotePdf = (
  formData: FormValues, 
  selectedApts: Apartment[], 
  priceCalculation: PriceCalculation,
  clientName?: string
): jsPDF => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add the header with the villa name
  const villaName = "VILLA MAREBLU"; // This would ideally come from settings
  addHeader(doc, villaName);
  
  // Add quote number and date
  const today = new Date();
  const quoteNumber = `${today.getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  doc.setFontSize(10);
  doc.text(`Preventivo n. ${quoteNumber}`, 10, 45);
  doc.text(`Data: ${formatItalianDate(today)}`, doc.internal.pageSize.getWidth() - 60, 45);
  
  // Client information section
  let yPos = 60;
  yPos = createSection(doc, "CLIENTE", yPos);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(clientName || formData.name || "Cliente", 12, yPos + 10);
  if (formData.email) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.email, 12, yPos + 20);
  }
  yPos += 30;
  
  // Stay details section
  yPos = createSection(doc, "DETTAGLI SOGGIORNO", yPos);
  
  // Check if dates are available
  if (formData.checkIn && formData.checkOut) {
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const nights = priceCalculation.nights || 0;
    
    // Format dates for display
    const checkInFormatted = formatItalianDate(checkInDate);
    const checkOutFormatted = formatItalianDate(checkOutDate);
    
    yPos = createInfoRow(doc, "Periodo:", `${checkInFormatted} - ${checkOutFormatted} (${nights} notti)`, yPos);
  }
  
  // Add guest composition
  const guestComposition = `${formData.adults || 0} adulti, ${formData.children || 0} bambini`;
  yPos = createInfoRow(doc, "Composizione:", guestComposition, yPos);
  
  // Add selected apartments
  const apartmentNames = selectedApts.map(apt => apt.name).join(', ');
  yPos = createInfoRow(doc, "Appartamenti:", apartmentNames, yPos);
  
  // Cost details section
  yPos += 5;
  yPos = createSection(doc, "DETTAGLIO COSTI", yPos);
  
  // Create table headers
  const headers = [["Descrizione", "Importo"]];
  const tableBody = [];
  
  // Add apartment costs
  selectedApts.forEach((apt, index) => {
    const aptPrice = priceCalculation.apartmentPrices?.[apt.id] || 0;
    tableBody.push([apt.name, `€${aptPrice}`]);
  });
  
  // Add cleaning fee
  if (priceCalculation.cleaningFee > 0) {
    tableBody.push(["Pulizie finali", `€${priceCalculation.cleaningFee}`]);
  }
  
  // Add linen fee if applicable
  if (formData.linenOption === "extra" || formData.linenOption === "deluxe") {
    const linenCost = priceCalculation.extras - (formData.hasPets ? 50 : 0);
    if (linenCost > 0) {
      tableBody.push(["Biancheria da letto e bagno", `€${linenCost}`]);
    }
  }
  
  // Add pet fee for apartments that have pets
  if (formData.hasPets) {
    if (formData.selectedApartments?.length === 1) {
      // Single apartment with pets
      tableBody.push(["Supplemento animali", `€50`]);
    } else if (formData.petsInApartment) {
      // Multiple apartments - add pet fee only for those that have pets
      const apartmentsWithPets = Object.entries(formData.petsInApartment)
        .filter(([_, hasPet]) => hasPet);
      
      apartmentsWithPets.forEach(([aptId, _]) => {
        const apartment = selectedApts.find(apt => apt.id === aptId);
        if (apartment) {
          tableBody.push([`Supplemento animali - ${apartment.name}`, `€50`]);
        }
      });
    }
  }
  
  // Add tourist tax (showing as included)
  tableBody.push(["Tassa di soggiorno", "inclusa"]);
  
  // Add the cost details table
  doc.autoTable({
    startY: yPos,
    head: headers,
    body: tableBody,
    theme: 'plain',
    styles: {
      fontSize: 10,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 50, halign: 'right' },
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    margin: { left: 10, right: 10 }
  });
  
  // Get the end position of the table
  const tableEndY = (doc as any).lastAutoTable.finalY || yPos + 50;
  yPos = tableEndY + 10;
  
  // Add original total, discount, and final total
  const originalTotal = priceCalculation.totalBeforeDiscount;
  const discount = priceCalculation.discount;
  const finalTotal = priceCalculation.totalAfterDiscount;
  
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(doc.internal.pageSize.getWidth() - 80, yPos, doc.internal.pageSize.getWidth() - 10, yPos);
  
  yPos += 5;
  doc.setFontSize(10);
  doc.text("Totale originale:", doc.internal.pageSize.getWidth() - 80, yPos);
  doc.text(`€${originalTotal}`, doc.internal.pageSize.getWidth() - 20, yPos, { align: "right" });
  
  yPos += 7;
  doc.text("Sconto applicato:", doc.internal.pageSize.getWidth() - 80, yPos);
  doc.text(`-€${discount}`, doc.internal.pageSize.getWidth() - 20, yPos, { align: "right" });
  
  yPos += 5;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(doc.internal.pageSize.getWidth() - 80, yPos, doc.internal.pageSize.getWidth() - 10, yPos);
  
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text("TOTALE FINALE:", doc.internal.pageSize.getWidth() - 80, yPos);
  doc.text(`€${finalTotal}`, doc.internal.pageSize.getWidth() - 20, yPos, { align: "right" });
  
  // Security deposit section
  yPos += 25;
  yPos = createSection(doc, "CAUZIONE", yPos);
  
  // Calculate security deposit based on number of apartments
  const depositPerApartment = 200;
  const totalDeposit = depositPerApartment * selectedApts.length;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`€${depositPerApartment} per appartamento x ${selectedApts.length} = €${totalDeposit}`, 12, yPos + 10);
  doc.setFont('helvetica', 'italic');
  doc.text("Da versare in contanti all'arrivo", doc.internal.pageSize.getWidth() - 70, yPos + 10);
  
  yPos += 30;
  
  // Add terms and conditions
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("Preventivo valido per 7 giorni dalla data di emissione. I prezzi possono variare in base alla disponibilità.", 10, yPos);
  doc.text("La prenotazione sarà confermata solo dopo il versamento dell'acconto.", 10, yPos + 5);
  
  return doc;
};
