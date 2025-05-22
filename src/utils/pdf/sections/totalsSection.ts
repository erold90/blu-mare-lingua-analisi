
import { jsPDF } from "jspdf";
import { PriceCalculation } from "@/utils/price/types";
import { drawSeparatorLine, createKeyValueRow, formatText } from "../utils/pdfSharedUtils";

/**
 * Generate the totals section (original total, discount, and final total)
 * @param doc - PDF document
 * @param priceCalculation - Price calculation object
 * @param yPos - Current Y position
 * @returns Next Y position
 */
export const generateTotalsSection = (doc: jsPDF, priceCalculation: PriceCalculation, yPos: number): number => {
  let currentY = yPos;
  
  const basePrice = priceCalculation.basePrice;
  const extras = priceCalculation.extras;
  const originalTotal = priceCalculation.totalBeforeDiscount;
  const discount = priceCalculation.discount;
  const finalTotal = priceCalculation.totalAfterDiscount;
  
  // Draw separator line
  currentY = drawSeparatorLine(doc, currentY, {
    marginLeft: doc.internal.pageSize.getWidth() - 80,
    marginRight: 10
  });
  
  // Show base price
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  currentY += 5;
  const baseLabel = "Prezzo base:";
  const baseValue = `€${basePrice}`;
  doc.text(baseLabel, doc.internal.pageSize.getWidth() - 80, currentY);
  doc.text(baseValue, doc.internal.pageSize.getWidth() - 20, currentY, { align: "right" });
  
  // Show extras if applicable
  if (extras > 0) {
    currentY += 7;
    const extrasLabel = "Extra:";
    const extrasValue = `€${extras}`;
    doc.text(extrasLabel, doc.internal.pageSize.getWidth() - 80, currentY);
    doc.text(extrasValue, doc.internal.pageSize.getWidth() - 20, currentY, { align: "right" });
  }
  
  // Show subtotal
  currentY += 7;
  const subtotalLabel = "Subtotale:";
  const subtotalValue = `€${originalTotal}`;
  doc.text(subtotalLabel, doc.internal.pageSize.getWidth() - 80, currentY);
  doc.text(subtotalValue, doc.internal.pageSize.getWidth() - 20, currentY, { align: "right" });
  
  // Show discount amount (only if there is a discount)
  if (discount > 0) {
    currentY += 7;
    
    // Use formatText utility for colored text
    const discountLabel = formatText(doc, "Sconto:", { 
      textColor: [0, 128, 0] // Green color for discount
    });
    doc.text(discountLabel.text, doc.internal.pageSize.getWidth() - 80, currentY);
    
    const discountValue = formatText(doc, `-€${discount}`, { 
      textColor: [0, 128, 0] 
    });
    doc.text(discountValue.text, doc.internal.pageSize.getWidth() - 20, currentY, { align: "right" });
    
    // Reset text formatting
    discountLabel.reset();
    discountValue.reset();
  } else {
    currentY += 7;
  }
  
  // Draw another separator line
  currentY = drawSeparatorLine(doc, currentY + 5, {
    marginLeft: doc.internal.pageSize.getWidth() - 80,
    marginRight: 10
  });
  
  // Show final total with bold formatting
  currentY += 5;
  
  // Draw highlight box for final total
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(doc.internal.pageSize.getWidth() - 85, currentY - 3, 75, 12, 2, 2, 'F');
  
  // Add final total text with bold formatting
  const totalLabel = formatText(doc, "TOTALE FINALE:", { 
    fontSize: 12,
    fontStyle: "bold"
  });
  doc.text(totalLabel.text, doc.internal.pageSize.getWidth() - 80, currentY);
  
  const totalValue = formatText(doc, `€${finalTotal}`, { 
    fontSize: 12,
    fontStyle: "bold"
  });
  doc.text(totalValue.text, doc.internal.pageSize.getWidth() - 20, currentY, { align: "right" });
  
  // Reset text formatting
  totalLabel.reset();
  totalValue.reset();
  
  // Add deposit information using key-value row utility
  currentY += 15;
  currentY = createKeyValueRow(doc, 
    "Caparra da versare:", 
    `€${priceCalculation.deposit}`,
    currentY,
    {
      keyWidth: 60,
      valueX: doc.internal.pageSize.getWidth() - 20,
      fontSize: 10,
      valueStyle: "normal"
    }
  );
  
  // Add saldo information using key-value row utility
  const saldo = finalTotal - priceCalculation.deposit;
  currentY = createKeyValueRow(doc, 
    "Saldo all'arrivo:", 
    `€${saldo}`,
    currentY,
    {
      keyWidth: 60,
      valueX: doc.internal.pageSize.getWidth() - 20,
      fontSize: 10,
      valueStyle: "normal"
    }
  );
  
  return currentY + 15; // Return next Y position with some padding
};
