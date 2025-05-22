
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
  const cellPadding = 3; // Reduced padding
  const columnWidths = [110, 40]; // Adjust as needed
  
  // Function to draw a cell
  const drawCell = (x: number, y: number, width: number, height: number, text: string | TableCell, isHeader: boolean = false) => {
    doc.rect(x, y, width, height);
    
    let content = '';
    let styles = {
      fontSize: 9,
      fontStyle: 'normal' as 'normal' | 'bold' | 'italic',
      textColor: [0, 0, 0] as number[]
    };
    
    if (typeof text === 'string') {
      content = text;
    } else {
      content = text.content;
      if (text.styles) {
        // Safely access style properties with default values
        if (text.styles.fontSize !== undefined) styles.fontSize = text.styles.fontSize;
        if (text.styles.fontStyle !== undefined) styles.fontStyle = text.styles.fontStyle;
        if (text.styles.textColor !== undefined) styles.textColor = text.styles.textColor;
      }
    }
    
    doc.setFontSize(styles.fontSize);
    doc.setFont('helvetica', styles.fontStyle);
    
    // Use the text color if provided, or default to black
    doc.setTextColor(styles.textColor[0] || 0, styles.textColor[1] || 0, styles.textColor[2] || 0);
    
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
  const headerHeight = 14; // Reduced header height
  headers.forEach(headerRow => {
    headerRow.forEach((header, i) => {
      drawCell(currentX, currentY, columnWidths[i], headerHeight, header, true);
      currentX += columnWidths[i];
    });
    currentY += headerHeight;
    currentX = margin;
  });
  
  // Draw body
  const rowHeight = 12; // Reduced row height
  body.forEach(row => {
    currentX = margin;
    row.forEach((cell, i) => {
      drawCell(currentX, currentY, columnWidths[i], rowHeight, cell);
      currentX += columnWidths[i];
    });
    currentY += rowHeight;
  });
  
  // Return the Y position after the table
  return currentY;
};
