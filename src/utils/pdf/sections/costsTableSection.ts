
import { jsPDF } from "jspdf";
// Import both the helper function and jspdf-autotable directly
import { applyAutoTable } from "../jspdfConfig";
// Direct import to ensure the plugin is registered
import "jspdf-autotable";

import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { Apartment } from "@/data/apartments";
import { createSection } from "../formatUtils";
import { TableCell } from "../types";

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
  // Ensure jspdf-autotable is available
  console.log("Checking autoTable availability:", typeof (doc as any).autoTable === 'function');
  
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
  
  // Debug before calling autoTable
  console.log("Before calling autoTable, function type:", typeof (doc as any).autoTable);
  
  let tableEndY = currentY + 50; // Default fallback position
  
  try {
    // Use our helper function instead of direct call
    const result = applyAutoTable(doc, {
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
    
    console.log("autoTable result:", result);
    
    // Get the end position of the table from the result
    if (result && typeof result === 'object' && 'finalY' in result) {
      tableEndY = result.finalY;
    }
  } catch (error) {
    console.error("Error generating table:", error);
    
    // Fallback to manual table generation
    console.log("Falling back to manual table generation");
    
    const startX = 10;
    let currentTableY = currentY;
    
    // Draw header row
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, currentTableY, 190, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text("Descrizione", startX + 5, currentTableY + 7);
    doc.text("Importo", startX + 145, currentTableY + 7);
    
    currentTableY += 10;
    
    // Draw data rows
    doc.setFont(undefined, 'normal');
    tableBody.forEach((row, index) => {
      // Set alternating row background
      if (index % 2 === 1) {
        doc.setFillColor(248, 248, 248);
        doc.rect(startX, currentTableY, 190, 10, 'F');
      }
      
      // Fix the type issue - properly check if row items are objects or strings
      // These are the lines with the errors:
      const firstCell = row[0];
      const secondCell = row[1];
      
      // Type-safe way to access content
      const label = typeof firstCell === 'object' && firstCell !== null ? 
        (firstCell as TableCell).content : String(firstCell);
      
      const value = typeof secondCell === 'object' && secondCell !== null ? 
        (secondCell as TableCell).content : String(secondCell);
      
      // Set text color for styled cells
      if (typeof firstCell === 'object' && firstCell !== null && 
          (firstCell as TableCell).styles?.textColor) {
        const color = (firstCell as TableCell).styles?.textColor;
        if (Array.isArray(color) && color.length >= 3) {
          doc.setTextColor(color[0], color[1], color[2]);
        }
      } else {
        // Reset to default text color
        doc.setTextColor(0, 0, 0);
      }
      
      doc.text(label, startX + 5, currentTableY + 7);
      
      // Set text color for second cell
      if (typeof secondCell === 'object' && secondCell !== null && 
          (secondCell as TableCell).styles?.textColor) {
        const color = (secondCell as TableCell).styles?.textColor;
        if (Array.isArray(color) && color.length >= 3) {
          doc.setTextColor(color[0], color[1], color[2]);
        }
      } else {
        // Reset to default text color
        doc.setTextColor(0, 0, 0);
      }
      
      // Right align the value
      const valueWidth = doc.getTextWidth(value);
      doc.text(value, startX + 190 - 5 - valueWidth, currentTableY + 7);
      
      currentTableY += 10;
    });
    
    // Reset text color to default
    doc.setTextColor(0, 0, 0);
    
    tableEndY = currentTableY;
  }
  
  return tableEndY + 10; // Return the next Y position
};
