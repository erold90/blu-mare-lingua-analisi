
import { jsPDF } from "jspdf";
import { TableCell } from "../../types";

/**
 * Generate a table using direct jsPDF methods
 * Compatible with both string arrays and TableCell objects
 */
export const generateTable = (
  doc: jsPDF, 
  headers: (string | TableCell)[][], 
  body: (string | TableCell)[][], 
  startY: number
): number => {
  try {
    console.log("Attempting to generate table with autoTable");
    
    // Try direct access first
    if (typeof (doc as any).autoTable === 'function') {
      console.log("Using direct autoTable access");
      const result = (doc as any).autoTable({
        startY,
        head: headers,
        body: body,
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
      
      if (result && typeof result === 'object' && 'finalY' in result) {
        return result.finalY;
      }
    }
    
    // Fallback method if autoTable is not available
    console.log("Using fallback table generation method");
    let y = startY;
    const rowHeight = 10;
    
    // Draw headers
    if (headers && headers.length > 0) {
      headers[0].forEach((header, index) => {
        const text = typeof header === 'string' ? header : header.content;
        const x = index === 0 ? 10 : 100;
        doc.setFont('helvetica', 'bold');
        doc.text(text, x, y);
      });
      y += rowHeight;
    }
    
    // Draw body
    if (body && body.length > 0) {
      body.forEach((row, rowIndex) => {
        doc.setFont('helvetica', 'normal');
        row.forEach((cell, colIndex) => {
          const text = typeof cell === 'string' ? cell : cell.content;
          const x = colIndex === 0 ? 10 : 100;
          doc.text(text, x, y);
        });
        y += rowHeight;
      });
    }
    
    return y;
  } catch (error) {
    console.error("Error generating table:", error);
    // Return a default position in case of error
    return startY + (body.length * 10);
  }
};
