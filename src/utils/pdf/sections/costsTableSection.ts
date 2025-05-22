
import { jsPDF } from "jspdf";
// Import both the helper function and jspdf-autotable directly
import "jspdf-autotable";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { Apartment } from "@/data/apartments";
import { createSection } from "../formatUtils";
import { 
  generateTable, 
  drawManualTable 
} from "../tables/tableUtils";
import { 
  createApartmentRows, 
  createExtrasRows, 
  createIncludedServicesRows 
} from "../tables/priceTableData";

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
  
  // Create section heading
  let currentY = createSection(doc, "DETTAGLIO COSTI", yPos);
  currentY += 5; // Add some spacing
  
  // Create table headers
  const headers = [["Descrizione", "Importo"]];
  
  // Build the table data
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
    // First attempt: try using autoTable directly on the document
    if (typeof (doc as any).autoTable === 'function') {
      (doc as any).autoTable({
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
        didDrawCell: (data: any) => {
          // Add alternating row colors
          if (data.section === 'body' && data.row.index % 2 === 1) {
            doc.setFillColor(248, 248, 248);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          }
        }
      });
      
      // Get the end position of the table
      tableEndY = (doc as any).lastAutoTable.finalY;
    } else {
      // Fallback to our helper function
      tableEndY = generateTable(doc, headers, tableBody, currentY);
    }
  } catch (error) {
    console.error("Error generating table with autoTable:", error);
    
    // Last resort: use manual table generation
    console.log("Falling back to manual table generation");
    tableEndY = drawManualTable(doc, headers, tableBody, currentY);
  }
  
  return tableEndY + 10; // Return the next Y position with some padding
};
