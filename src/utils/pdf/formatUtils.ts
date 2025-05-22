
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { jsPDF } from "jspdf";

// Format date using Italian locale
export const formatItalianDate = (date: Date): string => {
  return format(date, "dd/MM/yyyy", { locale: it });
};

// Helper for adding centered text
export const addCenteredText = (doc: jsPDF, text: string, y: number, fontSize = 12) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(fontSize);
  
  const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
  const x = (pageWidth - textWidth) / 2;
  doc.text(text, x, y);
};

// Helper for adding right-aligned text
export const addRightAlignedText = (doc: jsPDF, text: string, y: number, fontSize = 12) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(fontSize);
  
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

// Add a simple header with the title in a colored bar
export const addHeader = (doc: jsPDF, title: string) => {
  // Add a navy blue header bar
  doc.setFillColor(0, 32, 76); // Deep navy blue
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');
  
  // Add company name or title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 10, 20);
  
  // Add the "Preventivo" text on the right
  doc.text("Preventivo", doc.internal.pageSize.getWidth() - 60, 20);
  
  // Reset colors
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
};

// Add a basic footer to all pages
export const addBasicFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Add line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(10, pageHeight - 25, pageWidth - 10, pageHeight - 25);
    
    // Add company info
    doc.setFontSize(8);
    doc.text("Casa Vacanze Toscana", 10, pageHeight - 18);
    doc.text("Via delle Vacanze 123, 50100 Firenze", pageWidth/2 - 30, pageHeight - 18);
    doc.text("Tel: +39 055 123 4567", pageWidth - 60, pageHeight - 18);
    
    // Second line of footer
    doc.text("P.IVA 01234567890", 10, pageHeight - 10);
    doc.text("www.casavacanzetoscana.it", pageWidth/2 - 30, pageHeight - 10);
    doc.text("info@casavacanzetoscana.it", pageWidth - 60, pageHeight - 10);
  }
};

// Create a section with a title and light gray background
export const createSection = (doc: jsPDF, title: string, y: number) => {
  // Add gray background
  doc.setFillColor(240, 240, 240);
  doc.rect(10, y, doc.internal.pageSize.getWidth() - 20, 10, 'F');
  
  // Add section title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 12, y + 7);
  doc.setFont('helvetica', 'normal');
  
  return y + 10;
};

// Create a table row with a key-value pair
export const createInfoRow = (doc: jsPDF, key: string, value: string, y: number) => {
  doc.setFontSize(10);
  
  // Add a subtle table row
  doc.setFillColor(250, 250, 250);
  doc.rect(10, y, doc.internal.pageSize.getWidth() - 20, 10, 'F');
  
  // Draw separator lines
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.5);
  doc.line(10, y + 10, doc.internal.pageSize.getWidth() - 10, y + 10);
  
  // Add key in normal font
  doc.setFont('helvetica', 'normal');
  doc.text(key, 12, y + 7);
  
  // Add value in normal font
  doc.text(value, doc.internal.pageSize.getWidth() / 3, y + 7);
  
  return y + 10;
};

// Add header background for sections (required by sectionGenerators.ts)
export const addHeaderBackground = (doc: jsPDF, y: number, height = 10) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(240, 240, 240); // Light gray
  doc.rect(10, y, pageWidth - 20, height, 'F');
  return y + height;
};

// Add section header with styled background (required by sectionGenerators.ts)
export const addSectionHeader = (doc: jsPDF, title: string, y: number) => {
  // Add section header background
  doc.setFillColor(240, 240, 240); // Light gray
  doc.rect(10, y, doc.internal.pageSize.getWidth() - 20, 10, 'F');
  
  // Add section title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 12, y + 7);
  doc.setFont('helvetica', 'normal');
  
  return y + 10;
};

// Add info box with styled background (required by sectionGenerators.ts)
export const addInfoBox = (doc: jsPDF, x: number, y: number, width: number, height: number, fillColor = [248, 250, 252]) => {
  // Create box with light background
  doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(x, y, width, height, 3, 3, 'FD');
  
  return y + height;
};
