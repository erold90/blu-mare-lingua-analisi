
import { jsPDF } from "jspdf";
import { applyAutoTable } from "../jspdfConfig";
import { TableCell } from "../types";

/**
 * Generate a table with the provided headers and data using jspdf-autotable
 * @param doc - PDF document
 * @param headers - Table headers
 * @param tableBody - Table data
 * @param startY - Starting Y position for the table
 * @returns The Y position after the table
 */
export const generateTable = (
  doc: jsPDF,
  headers: string[][],
  tableBody: (string | TableCell)[][],
  startY: number
): number => {
  try {
    console.log("Attempting to generate table with autoTable");
    
    // Use our helper function
    const result = applyAutoTable(doc, {
      startY,
      head: headers,
      body: tableBody,
      theme: 'plain',
      styles: {
        fontSize: 10,
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 50, halign: 'right' },
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      margin: { left: 10, right: 10 },
      didDrawCell: (data: any) => {
        // Add alternating row colors
        if (data.section === 'body' && data.row.index % 2 === 1) {
          doc.setFillColor(248, 248, 248);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
        }
      }
    });
    
    console.log("autoTable result:", result);
    
    // Get the end position of the table from the result
    if (result && typeof result === 'object' && 'finalY' in result) {
      return result.finalY;
    }
    
    return startY + tableBody.length * 10 + 10; // Fallback position
  } catch (error) {
    console.error("Error generating table:", error);
    // Return a default position in case of error
    return startY + tableBody.length * 10 + 10;
  }
};

/**
 * Manually draw a table when autoTable is not available
 * @param doc - PDF document
 * @param headers - Table headers
 * @param tableBody - Table data
 * @param startY - Starting Y position for the table
 * @returns The Y position after the table
 */
export const drawManualTable = (
  doc: jsPDF,
  headers: string[][],
  tableBody: (string | TableCell)[][],
  startY: number
): number => {
  const startX = 10;
  let currentY = startY;
  
  // Draw header row
  doc.setFillColor(240, 240, 240);
  doc.rect(startX, currentY, 190, 10, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  
  // Draw headers
  headers[0].forEach((header, index) => {
    const x = index === 0 ? startX + 5 : startX + 145;
    doc.text(header, x, currentY + 7);
  });
  
  currentY += 10;
  
  // Draw data rows
  doc.setFont(undefined, 'normal');
  tableBody.forEach((row, index) => {
    // Set alternating row background
    if (index % 2 === 1) {
      doc.setFillColor(248, 248, 248);
      doc.rect(startX, currentY, 190, 10, 'F');
    }
    
    const firstCell = row[0];
    const secondCell = row[1];
    
    // Type-safe way to access content
    const label = typeof firstCell === 'object' && firstCell !== null ? 
      (firstCell as TableCell).content : String(firstCell);
    
    const value = typeof secondCell === 'object' && secondCell !== null ? 
      (secondCell as TableCell).content : String(secondCell);
    
    // Set text color for styled cells
    if (typeof firstCell === 'object' && firstCell !== null && 
        (firstCell as TableCell).styles?.textColor) {
      const color = (firstCell as TableCell).styles?.textColor;
      if (Array.isArray(color) && color.length >= 3) {
        doc.setTextColor(color[0], color[1], color[2]);
      }
    } else {
      // Reset to default text color
      doc.setTextColor(0, 0, 0);
    }
    
    doc.text(label, startX + 5, currentY + 7);
    
    // Set text color for second cell
    if (typeof secondCell === 'object' && secondCell !== null && 
        (secondCell as TableCell).styles?.textColor) {
      const color = (secondCell as TableCell).styles?.textColor;
      if (Array.isArray(color) && color.length >= 3) {
        doc.setTextColor(color[0], color[1], color[2]);
      }
    } else {
      // Reset to default text color
      doc.setTextColor(0, 0, 0);
    }
    
    // Right align the value
    const valueWidth = doc.getTextWidth(value);
    doc.text(value, startX + 190 - 5 - valueWidth, currentY + 7);
    
    currentY += 10;
  });
  
  // Reset text color to default
  doc.setTextColor(0, 0, 0);
  
  return currentY;
};
