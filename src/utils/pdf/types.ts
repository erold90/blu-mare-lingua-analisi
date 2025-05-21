
import { jsPDF } from "jspdf";

// Extend jspdf-autotable type definitions
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    getNumberOfPages: () => number;
  }
}

// Extending the internal property to include necessary methods
declare module 'jspdf/dist/jspdf.min' {
  interface jsPDFAPI {
    getStringUnitWidth: (text: string) => number;
    getTextDimensions: (text: string) => { w: number; h: number };
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
