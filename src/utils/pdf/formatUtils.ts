
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { jsPDF } from "jspdf";

// Format date using Italian locale
export const formatItalianDate = (date: Date): string => {
  return format(date, "dd MMMM yyyy", { locale: it });
};

// Helper for adding centered text
export const addCenteredText = (doc: jsPDF, text: string, y: number, fontSize = 12) => {
  const pageWidth = doc.internal.pageSize.width;
  doc.setFontSize(fontSize);
  const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
  const x = (pageWidth - textWidth) / 2;
  doc.text(text, x, y);
};

// Helper for adding right-aligned text
export const addRightAlignedText = (doc: jsPDF, text: string, y: number, fontSize = 12) => {
  const pageWidth = doc.internal.pageSize.width;
  doc.setFontSize(fontSize);
  const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
  const x = pageWidth - textWidth - 20; // 20 is the right margin
  doc.text(text, x, y);
};

// Add a horizontal line to the document
export const addSeparatorLine = (doc: jsPDF, y: number, marginLeft = 20, marginRight = 20) => {
  const pageWidth = doc.internal.pageSize.width;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
};

// Add page numbering to all pages
export const addPageNumbers = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.width;
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Pagina ${i} di ${pageCount}`, pageWidth - 40, doc.internal.pageSize.height - 10);
  }
};

