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

// Generate a compact, professional quote PDF
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
  
  // Generate the document sections with minimal spacing
  let yPos = generateQuoteHeader(doc);
  
  // Add the stay info section with a professional layout
  yPos = generateStayInfoSection(doc, formData, priceCalculation, yPos);
  yPos += 5; // Small spacing between sections
  
  // Add the apartment list section - keep it brief
  yPos = generateApartmentListSection(doc, selectedApts, yPos);
  yPos += 5; // Small spacing between sections
  
  // Generate costs section right after
  yPos = generateCostsTableSection(doc, selectedApts, priceCalculation, formData, yPos);
  yPos += 5; // Small spacing between sections
  
  // Generate the totals section
  yPos = generateTotalsSection(doc, priceCalculation, yPos);
  yPos += 5; // Small spacing between sections
  
  // Add security deposit section
  yPos = generateSecurityDepositSection(doc, selectedApts, yPos);
  yPos += 5; // Small spacing between sections
  
  // Add compact terms and conditions
  yPos = generateTermsSection(doc, yPos);
  
  // Add page numbers and footer only if multiple pages
  if (doc.getNumberOfPages() > 1) {
    addPageNumbers(doc);
  }
  
  addBasicFooter(doc);
  
  return doc;
};
