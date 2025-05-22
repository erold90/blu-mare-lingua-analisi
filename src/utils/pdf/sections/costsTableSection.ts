
import { jsPDF } from "jspdf";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { Apartment } from "@/data/apartments";
import { createSection } from "../formatUtils";

/**
 * Generate the cost details table section of the quote
 */
export const generateCostsTableSection = (
  doc: jsPDF, 
  selectedApts: Apartment[], 
  priceCalculation: PriceCalculation,
  formData: FormValues,
  yPos: number
): number => {
  let currentY = yPos + 5;
  currentY = createSection(doc, "DETTAGLIO COSTI", currentY);
  
  // Create table headers
  const headers = [["Descrizione", "Importo"]];
  const tableBody = [];
  
  // Add apartment costs
  selectedApts.forEach((apt) => {
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
    startY: currentY,
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
  const tableEndY = (doc as any).lastAutoTable.finalY || currentY + 50;
  return tableEndY + 10; // Return the next Y position
};
