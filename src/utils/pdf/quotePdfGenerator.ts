
// Import first to ensure the plugin is registered
import "jspdf-autotable";
// Then import our config
import "./jspdfConfig";

import { jsPDF } from "jspdf";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types"; 
import { Apartment } from "@/data/apartments";
import { addHeader } from "./formatUtils";
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
  
  // Debug before costs table section
  console.log("Before generateCostsTableSection, autoTable availability:", 
             typeof (doc as any).autoTable === 'function');
  
  yPos = generateCostsTableSection(doc, selectedApts, priceCalculation, formData, yPos);
  yPos = generateTotalsSection(doc, priceCalculation, yPos);
  yPos = generateSecurityDepositSection(doc, selectedApts, yPos);
  
  // Add terms and conditions at the bottom
  generateTermsSection(doc, yPos);
  
  return doc;
};
