
// Import first to ensure the plugin is loaded and registered
import "jspdf-autotable";
// Then import our config
import "./jspdfConfig";

import { jsPDF } from "jspdf";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types"; 
import { Apartment } from "@/data/apartments";
import { addHeader, addPageNumbers, addBasicFooter } from "./formatUtils";
import { generateQuoteHeader } from "./sections/quoteHeaderSection";
import { generateStayInfoSection } from "./sections/stayInfoSection";
import { generateApartmentListSection } from "./sections/apartmentListSection";
import { generateCostsTableSection } from "./sections/costsTableSection";
import { generateTotalsSection } from "./sections/totalsSection";
import { generateSecurityDepositSection } from "./sections/securityDepositSection";
import { generateTermsSection } from "./sections/termsSection";
import { verifyAutoTable } from "./jspdfConfig";

// Generate a minimalist quote PDF based on the provided example
export const generateQuotePdf = (
  formData: FormValues, 
  selectedApts: Apartment[], 
  priceCalculation: PriceCalculation
): jsPDF => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Verify autoTable is available on this instance
  console.log("autoTable available on new doc:", verifyAutoTable(doc));
  
  // Add the header with the villa name
  const villaName = "VILLA MAREBLU"; // This would ideally come from settings
  addHeader(doc, villaName);
  
  // Generate the document sections
  let yPos = generateQuoteHeader(doc);
  yPos = generateStayInfoSection(doc, formData, priceCalculation, yPos);
  yPos = generateApartmentListSection(doc, selectedApts, yPos);
  
  // Ensure we have enough space for the costs table - always start on a new page for better layout
  doc.addPage();
  yPos = 20; // Reset Y position on new page
  
  // Debug before costs table section
  console.log("Before generating costs table, document position:", yPos);
  console.log("AutoTable availability:", typeof (doc as any).autoTable === 'function');
  
  // Generate the costs table section
  yPos = generateCostsTableSection(doc, selectedApts, priceCalculation, formData, yPos);
  
  // Make sure we have space for the totals section
  if (yPos > doc.internal.pageSize.getHeight() - 100) {
    doc.addPage();
    yPos = 20;
  }
  
  // Generate the totals section with final price
  yPos = generateTotalsSection(doc, priceCalculation, yPos);
  
  // Make sure we have space for the security deposit section
  if (yPos > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    yPos = 20;
  }
  
  // Generate the security deposit section
  yPos = generateSecurityDepositSection(doc, selectedApts, yPos);
  
  // Add terms and conditions at the bottom
  if (yPos > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    yPos = 20;
  }
  
  generateTermsSection(doc, yPos);
  
  // Add page numbers and footer to all pages
  if (doc.getNumberOfPages() > 1) {
    addPageNumbers(doc);
  }
  
  addBasicFooter(doc);
  
  return doc;
};
