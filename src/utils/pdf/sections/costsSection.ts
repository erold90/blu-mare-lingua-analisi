
import { jsPDF } from "jspdf";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { addSectionHeader } from "../formatUtils";

// Generate the costs table
export const generateCostsTable = (doc: jsPDF, priceCalculation: PriceCalculation, formData: FormValues, yStart: number) => {
  let y = yStart;
  
  // Add elegant section header
  y = addSectionHeader(doc, "DETTAGLIO COSTI", y);
  y += 10;
  
  // Prepare table data
  const tableBody = [];
  
  // Base apartment cost
  tableBody.push(["Costo base appartamento", `${priceCalculation.nights} notti`, `€ ${priceCalculation.basePrice.toFixed(2)}`]);
  
  // Selected extras
  if (formData.linenOption && priceCalculation.extras > 0) {
    let linenText;
    switch(formData.linenOption) {
      case "extra":
        linenText = "Biancheria Extra";
        break;
      case "deluxe":
        linenText = "Biancheria Deluxe";
        break;
      default:
        linenText = "Biancheria Standard";
    }
    tableBody.push([linenText, "", `€ ${priceCalculation.extras.toFixed(2)}`]);
  }
  
  // Final cleaning
  tableBody.push(["Pulizia finale", "Obbligatoria", `€ ${priceCalculation.cleaningFee.toFixed(2)}`]);
  
  // Tourist tax
  // Use default value of 2.0 if touristTaxPerPerson is not defined
  const taxPerPerson = priceCalculation.touristTaxPerPerson || 2.0;
  const touristTaxDetails = `${taxPerPerson.toFixed(2)}€ x ${formData.adults} persone x ${priceCalculation.nights} notti`;
  tableBody.push(["Tassa di soggiorno", touristTaxDetails, `€ ${priceCalculation.touristTax.toFixed(2)}`]);
  
  // Pets fee if applicable
  if (formData.hasPets && formData.petsCount && formData.petsCount > 0) {
    tableBody.push(["Supplemento animali", `${formData.petsCount} animali`, `€ ${(formData.petsCount * 30).toFixed(2)}`]);
  }
  
  // Subtotal
  tableBody.push(["Subtotale", "", `€ ${priceCalculation.subtotal.toFixed(2)}`]);
  
  // Discount (if applicable)
  if (priceCalculation.discount > 0) {
    tableBody.push(["Sconto", "", `- € ${priceCalculation.discount.toFixed(2)}`]);
  }
  
  // Total
  tableBody.push([
    { content: "TOTALE", styles: { fontStyle: 'bold' } }, 
    "", 
    { content: `€ ${priceCalculation.totalAfterDiscount.toFixed(2)}`, styles: { fontStyle: 'bold' } }
  ]);
  
  // Calculate deposit (30% of total)
  const deposit = Math.round(priceCalculation.deposit);
  tableBody.push(["Caparra (30%)", "Da versare alla prenotazione", `€ ${deposit.toFixed(2)}`]);
  
  // Calculate remaining balance
  const remainingBalance = Math.round(priceCalculation.totalAfterDiscount - deposit);
  tableBody.push(["Saldo", "Da versare all'arrivo", `€ ${remainingBalance.toFixed(2)}`]);
  
  // Security deposit (refundable)
  tableBody.push(["Cauzione", "Rimborsabile a fine soggiorno", `€ 200.00`]);
  
  return tableBody;
};
