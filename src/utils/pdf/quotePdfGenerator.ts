
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // This registers autoTable with jsPDF
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

// Generate a minimalist quote PDF based on the provided example
export const generateQuotePdf = (
  formData: FormValues, 
  selectedApts: Apartment[], 
  priceCalculation: PriceCalculation
): jsPDF => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add the header with the villa name
  const villaName = "VILLA MAREBLU"; // This would ideally come from settings
  addHeader(doc, villaName);
  
  // Generate the document sections
  let yPos = generateQuoteHeader(doc);
  yPos = generateStayInfoSection(doc, formData, priceCalculation, yPos);
  yPos = generateApartmentListSection(doc, selectedApts, yPos);
  yPos = generateCostsTableSection(doc, selectedApts, priceCalculation, formData, yPos);
  yPos = generateTotalsSection(doc, priceCalculation, yPos);
  yPos = generateSecurityDepositSection(doc, selectedApts, yPos);
  
  // Add terms and conditions at the bottom
  generateTermsSection(doc, yPos);
  
  return doc;
};
