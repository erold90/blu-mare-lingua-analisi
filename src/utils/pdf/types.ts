
import { jsPDF } from "jspdf";

// Add jspdf-autotable type definitions
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: {
      finalY: number;
    };
    getNumberOfPages: () => number;
  }
}

export interface PdfDocumentOptions {
  fontSizes?: {
    title?: number;
    subtitle?: number;
    heading?: number;
    text?: number;
    small?: number;
  };
  margins?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
}

