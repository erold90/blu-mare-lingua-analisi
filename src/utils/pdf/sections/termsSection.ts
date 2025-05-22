
import { jsPDF } from "jspdf";

/**
 * Generate terms and conditions section
 */
export const generateTermsSection = (doc: jsPDF, yPos: number): void => {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("Preventivo valido per 7 giorni dalla data di emissione. I prezzi possono variare in base alla disponibilità.", 10, yPos);
  doc.text("La prenotazione sarà confermata solo dopo il versamento dell'acconto.", 10, yPos + 5);
};
