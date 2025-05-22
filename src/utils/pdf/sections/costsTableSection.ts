
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // This registers autoTable with jsPDF
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { Apartment } from "@/data/apartments";
import { createSection } from "../formatUtils";

/**
 * Generate the cost details table section of the quote
 * @param doc - PDF document
 * @param selectedApts - Selected apartments
 * @param priceCalculation - Price calculation object
 * @param formData - Form data from the quote form
 * @param yPos - Current Y position
 * @returns Next Y position
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
  if (selectedApts.length === 1) {
    // For single apartment, show nights info
    const aptPrice = priceCalculation.basePrice || 0;
    tableBody.push([
      `${selectedApts[0].name} (${priceCalculation.nights} notti)`, 
      `€${aptPrice}`
    ]);
  } else {
    // For multiple apartments, list each one separately
    selectedApts.forEach((apt) => {
      const aptPrice = priceCalculation.apartmentPrices?.[apt.id] || 0;
      tableBody.push([apt.name, `€${aptPrice}`]);
    });
    
    // Add a subtotal row for apartment base prices
    tableBody.push([
      "Subtotale appartamenti", 
      `€${priceCalculation.basePrice}`
    ]);
  }
  
  // Add extras if applicable
  if (priceCalculation.extras > 0) {
    // Calculate linen cost
    let linenCost = 0;
    if (formData.linenOption === "extra") {
      const totalPeople = (formData.adults || 0) + (formData.children || 0);
      linenCost = totalPeople * 15;
    }
    
    // Calculate pet cost
    let petCost = 0;
    if (formData.hasPets) {
      if (selectedApts.length === 1) {
        petCost = 50; // Single apartment with pets
      } else if (formData.petsInApartment) {
        // Count apartments with pets
        const apartmentsWithPets = Object.values(formData.petsInApartment).filter(Boolean).length;
        petCost = apartmentsWithPets * 50;
      }
    }
    
    // Add linen fee if applicable
    if (linenCost > 0) {
      const linenLabel = formData.linenOption === "deluxe" ? 
        "Biancheria deluxe" : "Biancheria da letto e bagno";
      tableBody.push([linenLabel, `€${linenCost}`]);
    }
    
    // Add pet fee if applicable
    if (petCost > 0) {
      if (selectedApts.length === 1) {
        tableBody.push(["Supplemento animali", `€${petCost}`]);
      } else {
        const apartmentsWithPets = Object.entries(formData.petsInApartment || {})
          .filter(([_, hasPet]) => hasPet);
        
        if (apartmentsWithPets.length === 1) {
          const [aptId, _] = apartmentsWithPets[0];
          const apartment = selectedApts.find(apt => apt.id === aptId);
          if (apartment) {
            tableBody.push([`Supplemento animali - ${apartment.name}`, `€${petCost}`]);
          }
        } else if (apartmentsWithPets.length > 1) {
          tableBody.push([`Supplemento animali (${apartmentsWithPets.length} appartamenti)`, `€${petCost}`]);
        }
      }
    }
  }
  
  // Add cleaning fee
  if (priceCalculation.cleaningFee > 0) {
    tableBody.push([{
      content: "Pulizie finali", 
      styles: { textColor: [0, 128, 0] }
    }, {
      content: "incluse",
      styles: { textColor: [0, 128, 0], halign: 'right' }
    }]);
  }
  
  // Add tourist tax (showing as included)
  tableBody.push([{
    content: "Tassa di soggiorno", 
    styles: { textColor: [0, 128, 0] }
  }, {
    content: "inclusa",
    styles: { textColor: [0, 128, 0], halign: 'right' }
  }]);
  
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
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    margin: { left: 10, right: 10 },
    didDrawCell: (data) => {
      // Add alternating row colors
      if (data.section === 'body' && data.row.index % 2 === 1) {
        doc.setFillColor(248, 248, 248);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
      }
    }
  });
  
  // Get the end position of the table
  const tableEndY = (doc as any).lastAutoTable.finalY || currentY + 50;
  return tableEndY + 10; // Return the next Y position
};
