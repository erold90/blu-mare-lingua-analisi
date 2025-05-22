
import { jsPDF } from "jspdf";
import { addSectionHeader } from "../formatUtils";

// Generate payment methods section
export const generatePaymentMethodsSection = (doc: jsPDF, yStart: number) => {
  let y = yStart + 10;
  
  // Add elegant section header
  y = addSectionHeader(doc, "MODALITÀ DI PAGAMENTO", y);
  y += 10;
  
  // Create payment methods box with nice styling
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(20, y, doc.internal.pageSize.getWidth() - 40, 55, 3, 3, 'FD');
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("🏦 Bonifico Bancario", 25, y + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("IBAN: IT00 A000 0000 0000 0000 0000", 25, y + 20);
  doc.text("Intestatario: Casa Vacanze Toscana", 25, y + 28);
  doc.text("Causale: Acconto/Saldo + Nome Cliente + Date Soggiorno", 25, y + 36);
  
  doc.setFont("helvetica", "bold");
  doc.text("💳 Altri Metodi di Pagamento (al check-in)", 25, y + 46);
  doc.setFont("helvetica", "normal");
  
  // Create two columns for payment methods
  const colWidth = (doc.internal.pageSize.getWidth() - 50) / 2;
  doc.text("• Carta di Credito/Debito", 25, y + 54);
  doc.text("• Contanti (fino a €1.999,99)", 25 + colWidth, y + 54);
  
  return y + 65;
};
