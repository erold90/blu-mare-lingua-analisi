
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

// Add a styled logo to the document
export const addLogo = (doc: jsPDF, y = 15) => {
  // Create a logo with better styling
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoX = 20;
  
  // Set color for the logo (a deeper, more elegant blue)
  doc.setFillColor(47, 84, 150);
  doc.setDrawColor(47, 84, 150);
  
  // Draw a rectangle with rounded corners for more polished look
  doc.roundedRect(logoX, y, 50, 18, 3, 3, 'FD');
  
  // Add text over the rectangle with better spacing
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("CASA VACANZE", logoX + 7, y + 11);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  return y + 25; // Return the Y position after the logo
};

// Add a designer footer to the document
export const addFooter = (doc: jsPDF) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerY = pageHeight - 25;
  
  // Add elegant separator line with gradient effect
  doc.setDrawColor(47, 84, 150);
  doc.setLineWidth(0.75);
  addSeparatorLine(doc, footerY - 2, 15, 15);
  
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.5);
  addSeparatorLine(doc, footerY - 0.5, 15, 15);
  
  // Add company info in a more elegant style
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  addCenteredText(doc, "Casa Vacanze Toscana • Via delle Vacanze 123, 50100 Firenze • P.IVA 01234567890", footerY + 5, 9);
  addCenteredText(doc, "Tel: +39 055 123 4567 • Email: info@casavacanzetoscana.it • www.casavacanzetoscana.it", footerY + 10, 9);
};

// Add a watermark to the document - FIXED to not use translate method
export const addWatermark = (doc: jsPDF) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Save current state
  const currentFontSize = doc.getFontSize();
  
  // Set watermark properties with a more subtle color
  doc.setTextColor(235, 235, 235); // Lighter gray for elegance
  doc.setFontSize(70);
  doc.setFont("helvetica", "bold");
  
  // Position the watermark in the center with rotation
  const text = "PREVENTIVO";
  
  // Add single centered watermark with proper angle
  doc.text(text, pageWidth / 2, pageHeight / 2, {
    align: "center",
    angle: -45
  });
  
  // Restore previous state
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(currentFontSize);
  doc.setFont("helvetica", "normal");
};

// Add a decorative header background
export const addHeaderBackground = (doc: jsPDF, y: number, height = 40) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Create a subtle gradient effect by layering rectangles
  doc.setFillColor(245, 248, 252); // Base light blue
  doc.rect(0, y - 10, pageWidth, height, 'F');
  
  // Add subtle accent line at the bottom
  doc.setDrawColor(47, 84, 150);
  doc.setLineWidth(1.5);
  doc.line(0, y - 10 + height, pageWidth, y - 10 + height);
  
  return y + height - 10;
};

// Add a styled section header
export const addSectionHeader = (doc: jsPDF, text: string, y: number) => {
  // Add elegant section title background
  doc.setFillColor(240, 244, 248);
  doc.roundedRect(15, y - 5, doc.internal.pageSize.getWidth() - 30, 10, 2, 2, 'F');
  
  // Add section title text with accent
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(47, 84, 150); // Match the logo color for consistency
  doc.text(text, 20, y + 2);
  
  // Reset text properties
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  return y + 10;
};

// Add a styled info box
export const addInfoBox = (doc: jsPDF, title: string, content: string, y: number) => {
  // Create box with light background
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(20, y, doc.internal.pageSize.getWidth() - 40, 25, 2, 2, 'FD');
  
  // Add title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(title, 25, y + 8);
  
  // Add content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(content, 25, y + 18);
  
  return y + 30;
};
