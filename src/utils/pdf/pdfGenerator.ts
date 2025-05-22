
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // This registers autoTable with jsPDF
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

/**
 * Main function to create and download the quote PDF
 * @param formData - Form data from the quote form
 * @param apartments - List of all apartments
 * @returns Filename of the generated PDF
 */
export const downloadPDF = (formData: FormValues, apartments: Apartment[]): string => {
  try {
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
    
    // Calculate the total price - use memoized version if available
    console.time("Price calculation");
    const priceCalculation = calculateTotalPrice(formData, apartments);
    console.timeEnd("Price calculation");
    
    // Generate the PDF using the minimalist template
    console.time("PDF generation");
    const doc = generateQuotePdf(formData, selectedApts, priceCalculation);
    
    // Add page numbers if multiple pages
    if (doc.getNumberOfPages() > 1) {
      addPageNumbers(doc);
    }
    
    // Add basic footer with company information
    addBasicFooter(doc);
    console.timeEnd("PDF generation");
    
    // Generate a meaningful filename
    const today = new Date();
    const fileName = `Preventivo_Villa_Mareblu_${format(today, "yyyyMMdd")}.pdf`;
    
    // Save the PDF
    doc.save(fileName);
    
    console.log(`PDF preventivo generato: ${fileName}`);
    return fileName;
  } catch (error) {
    console.error("Errore durante la generazione del PDF:", error);
    throw error;
  }
};
