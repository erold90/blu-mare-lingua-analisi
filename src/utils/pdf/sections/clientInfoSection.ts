
import { jsPDF } from "jspdf";
import { createSection, createInfoRow } from "../formatUtils";
import { FormValues } from "@/utils/quoteFormSchema";

/**
 * Generate the client information section of the quote
 */
export const generateClientInfoSection = (doc: jsPDF, clientName: string | undefined, formData: FormValues, yPos: number): number => {
  let currentY = createSection(doc, "CLIENTE", yPos);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(clientName || formData.name || "Cliente", 12, currentY + 10);
  
  if (formData.email) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.email, 12, currentY + 20);
  }
  
  return currentY + 30; // Return next Y position
};
