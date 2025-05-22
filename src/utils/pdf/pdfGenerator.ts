
// Import first to ensure the plugin is loaded and registered
import "jspdf-autotable";
// Then import our config
import "./jspdfConfig";

import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPrice } from "@/utils/quoteCalculator";
import { PriceCalculation } from "@/utils/price/types"; 
import { Apartment } from "@/data/apartments";
import { 
  formatItalianDate,
  addPageNumbers,
  addBasicFooter
} from "./formatUtils";
import { generateQuotePdf } from "./quotePdfGenerator";
import { verifyAutoTable } from "./jspdfConfig";

/**
 * Main function to create and download the quote PDF
 * Creates a professional, elegant PDF quote for the customer
 */
export const downloadPDF = (formData: FormValues, apartments: Apartment[]): string => {
  try {
    console.log("Starting professional PDF quote generation");
    
    // Verify autoTable availability
    const testDoc = new jsPDF();
    console.log("autoTable available:", verifyAutoTable(testDoc));
    
    // Validate input data
    if (!formData.checkIn || !formData.checkOut) {
      throw new Error("Date di arrivo/partenza non specificate");
    }
    
    // Find the selected apartments
    const selectedApartmentIds = formData.selectedApartments || [formData.selectedApartment];
    const selectedApts = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
    
    if (selectedApts.length === 0) {
      throw new Error("Nessun appartamento selezionato");
    }
    
    // Calculate the total price
    console.time("Price calculation");
    const priceCalculation = calculateTotalPrice(formData, apartments);
    console.timeEnd("Price calculation");
    
    // Generate the PDF using the elegant template
    console.time("PDF generation");
    const doc = generateQuotePdf(formData, selectedApts, priceCalculation);
    
    // Add page numbers if multiple pages
    if (doc.getNumberOfPages() > 1) {
      addPageNumbers(doc);
    }
    
    // Add basic footer with company information
    addBasicFooter(doc);
    console.timeEnd("PDF generation");
    
    // Generate a meaningful filename with date and customer name if available
    const today = new Date();
    let fileName = `Preventivo_Villa_Mareblu_${format(today, "yyyyMMdd")}`;
    
    // Add customer name to filename if available
    if (formData.name) {
      // Clean up name for the filename (remove spaces and special characters)
      const cleanName = formData.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
      fileName += `_${cleanName}`;
    }
    
    fileName += ".pdf";
    
    // Save the PDF
    doc.save(fileName);
    
    console.log(`PDF preventivo generato: ${fileName}`);
    return fileName;
  } catch (error) {
    console.error("Errore durante la generazione del PDF:", error);
    throw error;
  }
};

// Re-export for backward compatibility
export { downloadPDF as default };
