
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { jsPDF } from "jspdf";

// Format date using Italian locale
export const formatItalianDate = (date: Date): string => {
  return format(date, "dd MMMM yyyy", { locale: it });
};

// Helper for adding centered text
export const addCenteredText = (doc: jsPDF, text: string, y: number, fontSize = 12) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(fontSize);
  
  // Use correct method for string width calculation
  const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
  const x = (pageWidth - textWidth) / 2;
  doc.text(text, x, y);
};

// Helper for adding right-aligned text
export const addRightAlignedText = (doc: jsPDF, text: string, y: number, fontSize = 12) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(fontSize);
  
  // Use correct method for string width calculation
  const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
  const x = pageWidth - textWidth - 20; // 20 is the right margin
  doc.text(text, x, y);
};

// Add a horizontal line to the document
export const addSeparatorLine = (doc: jsPDF, y: number, marginLeft = 20, marginRight = 20) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
};

// Add page numbers to all pages
export const addPageNumbers = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Pagina ${i} di ${pageCount}`, pageWidth - 40, doc.internal.pageSize.getHeight() - 10);
  }
};

// Add a logo to the document
export const addLogo = (doc: jsPDF, y = 15) => {
  // Create a logo-like element since we don't have an actual logo
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoX = 20;
  
  // Set color for the logo (a deep blue)
  doc.setFillColor(42, 72, 120);
  doc.setDrawColor(42, 72, 120);
  
  // Draw a rectangle as the logo
  doc.roundedRect(logoX, y, 40, 15, 2, 2, 'FD');
  
  // Add text over the rectangle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CASA VACANZE", logoX + 5, y + 10);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  return y + 20; // Return the Y position after the logo
};

// Add a footer to the document
export const addFooter = (doc: jsPDF) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerY = pageHeight - 25;
  
  // Add separator line
  addSeparatorLine(doc, footerY);
  
  // Add company info
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  addCenteredText(doc, "Casa Vacanze Toscana • Via delle Vacanze 123, 50100 Firenze • P.IVA 01234567890", footerY + 5, 9);
  addCenteredText(doc, "Tel: +39 055 123 4567 • Email: info@casavacanzetoscana.it • www.casavacanzetoscana.it", footerY + 10, 9);
};

// Add a watermark to the document
export const addWatermark = (doc: jsPDF) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Save current state
  const currentFontSize = doc.internal.getFontSize();
  
  // Set watermark properties
  doc.setTextColor(230, 230, 230);
  doc.setFontSize(60);
  doc.setFont("helvetica", "bold");
  
  // Rotate and position the watermark
  doc.saveGraphicsState();
  doc.translate(pageWidth / 2, pageHeight / 2);
  doc.rotate(-45);
  doc.text("PREVENTIVO", 0, 0, { align: "center" });
  doc.restoreGraphicsState();
  
  // Restore previous state
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(currentFontSize);
  doc.setFont("helvetica", "normal");
};

// Add a decorative header background
export const addHeaderBackground = (doc: jsPDF, y: number, height = 40) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Create a light gray background
  doc.setFillColor(245, 245, 245);
  doc.rect(0, y - 10, pageWidth, height, 'F');
  
  return y + height - 10;
};
