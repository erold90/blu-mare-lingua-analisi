
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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

// Main function to create and download the quote PDF
export const downloadPDF = (formData: FormValues, apartments: Apartment[], clientName?: string) => {
  try {
    // Find the selected apartments
    const selectedApartmentIds = formData.selectedApartments || [formData.selectedApartment];
    const selectedApts = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
    
    if (selectedApts.length === 0) {
      throw new Error("Nessun appartamento selezionato");
    }
    
    // Calculate the total price
    const priceCalculation = calculateTotalPrice(formData, apartments);
    
    // Generate the PDF using the new minimalist template
    const doc = generateQuotePdf(formData, selectedApts, priceCalculation, clientName);
    
    // Add page numbers if multiple pages
    if (doc.getNumberOfPages() > 1) {
      addPageNumbers(doc);
    }
    
    // Add basic footer
    addBasicFooter(doc);
    
    // Save the PDF
    const today = new Date();
    const fileName = `Preventivo_${clientName || formData.name || "Cliente"}_${format(today, "yyyyMMdd")}.pdf`;
    
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error("Errore durante la generazione del PDF:", error);
    throw error;
  }
};
