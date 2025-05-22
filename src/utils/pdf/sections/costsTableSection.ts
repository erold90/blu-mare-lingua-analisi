
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
  
  let currentY = yPos + 5;
  currentY = createSection(doc, "DETTAGLIO COSTI", currentY);
  
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
    // Try using the autoTable plugin
    tableEndY = generateTable(doc, headers, tableBody, currentY);
  } catch (error) {
    console.error("Error generating table with autoTable:", error);
    
    // Fallback to manual table generation
    console.log("Falling back to manual table generation");
    tableEndY = drawManualTable(doc, headers, tableBody, currentY);
  }
  
  return tableEndY + 10; // Return the next Y position with some padding
};
