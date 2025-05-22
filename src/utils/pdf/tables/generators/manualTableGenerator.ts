import { jsPDF } from "jspdf";
import { TableCell } from "../../types";

/**
 * Draw a table manually using jsPDF methods
 * Compatible with both string arrays and TableCell objects
 */
export const drawManualTable = (
  doc: jsPDF, 
  headers: (string | TableCell)[][], 
  body: (string | TableCell)[][], 
  startY: number
): number => {
  let currentY = startY;
  const margin = 15;
  const cellPadding = 5;
  const columnWidths = [110, 40]; // Adjust as needed
  
  // Function to draw a cell
  const drawCell = (x: number, y: number, width: number, height: number, text: string | TableCell, isHeader: boolean = false) => {
    doc.rect(x, y, width, height);
    
    let content = '';
    let styles = {};
    
    if (typeof text === 'string') {
      content = text;
    } else {
      content = text.content;
      styles = text.styles || {};
    }
    
    doc.setFontSize(styles.fontSize || 10);
    if (styles.fontStyle) {
      doc.setFont('helvetica', styles.fontStyle as 'bold' | 'italic' | 'normal');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    if (styles.textColor) {
      doc.setTextColor(styles.textColor[0], styles.textColor[1], styles.textColor[2]);
    } else {
      doc.setTextColor(0, 0, 0);
    }
    
    const textX = x + cellPadding;
    const textY = y + cellPadding + (height - 2 * cellPadding) / 2 + 1; // Vertically center
    doc.text(content, textX, textY);
    
    // Reset styles after drawing cell
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
  };
  
  // Draw headers
  let currentX = margin;
  const headerHeight = 20;
  headers.forEach(headerRow => {
    headerRow.forEach((header, i) => {
      drawCell(currentX, currentY, columnWidths[i], headerHeight, header, true);
      currentX += columnWidths[i];
    });
    currentY += headerHeight;
    currentX = margin;
  });
  
  // Draw body
  const rowHeight = 15;
  body.forEach(row => {
    currentX = margin;
    row.forEach((cell, i) => {
      drawCell(currentX, currentY, columnWidths[i], rowHeight, cell);
      currentX += columnWidths[i];
    });
    currentY += rowHeight;
  });
  
  // Return the Y position after the table
  return startY + (body.length * 10);
};
