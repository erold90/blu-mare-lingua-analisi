import { jsPDF } from "jspdf";
import { applyAutoTable } from "../../jspdfConfig";
import { TableCell } from "../../types";

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
    
    // Try direct access first
    if (typeof (doc as any).autoTable === 'function') {
      console.log("Using direct autoTable access");
      const result = (doc as any).autoTable({
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
      
      if (result && typeof result === 'object' && 'finalY' in result) {
        return result.finalY;
      }
    }
    
    // Otherwise use helper function
    console.log("Using applyAutoTable helper");
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
