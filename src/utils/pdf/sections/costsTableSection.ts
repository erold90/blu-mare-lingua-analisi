
import { jsPDF } from "jspdf";
// Import both the helper function and jspdf-autotable directly
import "jspdf-autotable";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { Apartment } from "@/data/apartments";
import { createSection } from "../formatUtils";
import { 
  generateTable, 
  drawManualTable,
  createApartmentRows,
  createExtrasRows,
  createIncludedServicesRows 
} from "../tables";

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
  // Make sure we start at a good position, never too low on the page
  if (yPos > doc.internal.pageSize.getHeight() - 200) {
    doc.addPage();
    yPos = 20;
  }
  
  // Ensure jspdf-autotable is available
  console.log("Checking autoTable availability:", typeof (doc as any).autoTable === 'function');
  
  // Create section heading with improved visibility
  let currentY = createSection(doc, "DETTAGLIO COSTI", yPos);
  
  // Add light background to the entire costs section
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(250, 250, 250);
  doc.rect(10, currentY, pageWidth - 20, 160, 'F');
  
  currentY += 10; // Add more spacing for better readability
  
  // Create table headers with better styling
  const headers = [["Descrizione", "Importo"]];
  
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
  
  // Log table data for debugging
  console.log("Table data:", JSON.stringify(tableBody));
  
  let tableEndY: number;
  
  try {
    // First attempt: try using autoTable directly on the document
    if (typeof (doc as any).autoTable === 'function') {
      console.log("Using direct autoTable");
      const result = (doc as any).autoTable({
        startY: currentY,
        head: headers,
        body: tableBody,
        theme: 'plain',
        styles: {
          fontSize: 10,
          lineWidth: 0.1,
          cellPadding: 5, // Increased padding for better readability
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 50, halign: 'right' },
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          lineWidth: 0.5,
        },
        margin: { left: 15, right: 15 }, // Wider margins
        didDrawCell: (data: any) => {
          // Add alternating row colors for better readability
          if (data.section === 'body' && data.row.index % 2 === 1) {
            doc.setFillColor(248, 248, 248);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          }
        }
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
  
  return tableEndY + 15; // Return the next Y position with more padding
};
