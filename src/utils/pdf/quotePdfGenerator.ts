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

// Generate an elegant and professional quote PDF
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
  
  // Add the stay info section with a professional layout
  yPos = generateStayInfoSection(doc, formData, priceCalculation, yPos);
  
  // Add the apartment list section - keep it on the same page if possible
  if (yPos > doc.internal.pageSize.getHeight() - 80) {
    doc.addPage();
    yPos = 20; // Reset Y position on new page
  }
  
  yPos = generateApartmentListSection(doc, selectedApts, yPos);
  
  // Generate costs section - position it right after apartment list with proper spacing
  if (yPos > doc.internal.pageSize.getHeight() - 180) {
    doc.addPage();
    yPos = 20; // Reset Y position on new page
  } else {
    yPos += 10; // Add spacing between sections
  }
  
  // Generate the costs table with detailed breakdown
  yPos = generateCostsTableSection(doc, selectedApts, priceCalculation, formData, yPos);
  
  // Position the totals section properly
  if (yPos > doc.internal.pageSize.getHeight() - 130) {
    doc.addPage();
    yPos = 20;
  }
  
  // Generate the totals section with final price
  yPos = generateTotalsSection(doc, priceCalculation, yPos);
  
  // Add security deposit section
  if (yPos > doc.internal.pageSize.getHeight() - 80) {
    doc.addPage();
    yPos = 20;
  }
  
  yPos = generateSecurityDepositSection(doc, selectedApts, yPos);
  
  // Add terms and conditions at the bottom
  if (yPos > doc.internal.pageSize.getHeight() - 100) {
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
