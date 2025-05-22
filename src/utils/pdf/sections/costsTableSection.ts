
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { Apartment } from "@/data/apartments";
import { createSection } from "../formatUtils";
import { TableCell } from "../types";
import { 
  generateTable, 
  drawManualTable,
  createApartmentRows,
  createExtrasRows,
  createIncludedServicesRows 
} from "../tables";

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
  // Create section heading with improved visibility
  const sectionTitle = "DETTAGLIO COSTI";
  let currentY = createSection(doc, sectionTitle, yPos);
  currentY += 8; // Add more spacing for better readability
  
  // Create an elegant cost table with better styling
  // Set background for better readability
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(245, 247, 250);
  doc.rect(10, currentY - 3, pageWidth - 20, 150, 'F');
  
  // Create table headers with better styling
  const headers: (string | TableCell)[][] = [
    [{ content: "Descrizione", styles: { fontStyle: 'bold', fillColor: [230, 236, 242] } }, 
     { content: "Importo", styles: { fontStyle: 'bold', fillColor: [230, 236, 242], halign: 'right' } }]
  ];
  
  // Build the table data with more details
  const apartmentRows = createApartmentRows(selectedApts, priceCalculation);
  const extrasRows = createExtrasRows(priceCalculation, formData, selectedApts);
  const includedServicesRows = createIncludedServicesRows(priceCalculation);
  
  // Combine all rows
  const tableBody = [
    ...apartmentRows,
    ...extrasRows,
    ...includedServicesRows
  ];
  
  let tableEndY: number;
  
  try {
    // Try using autoTable directly on the document
    if (typeof (doc as any).autoTable === 'function') {
      console.log("Using direct autoTable");
      const result = (doc as any).autoTable({
        startY: currentY,
        head: headers,
        body: tableBody,
        theme: 'grid',
        styles: {
          fontSize: 9,
          lineWidth: 0.1,
          cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
          lineColor: [220, 220, 220]
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 40, halign: 'right' },
        },
        headStyles: {
          fillColor: [230, 236, 242],
          textColor: [0, 30, 80],
          fontStyle: 'bold',
          lineWidth: 0.3,
        },
        margin: { left: 15, right: 15 },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        tableLineColor: [200, 200, 200],
        tableLineWidth: 0.1,
      });
      
      // Get the end position of the table
      tableEndY = result.finalY || (currentY + tableBody.length * 12);
    } else {
      // Fallback to our helper function
      console.log("Using fallback table generation method");
      tableEndY = generateTable(doc, headers, tableBody, currentY);
    }
  } catch (error) {
    console.error("Error generating table with autoTable:", error);
    
    // Last resort: use manual table generation
    console.log("Falling back to manual table generation");
    tableEndY = drawManualTable(doc, headers, tableBody, currentY);
  }
  
  return tableEndY + 10; // Return the next Y position with padding
};
