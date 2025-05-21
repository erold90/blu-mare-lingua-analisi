
import { jsPDF } from "jspdf";

// Extend jspdf-autotable type definitions for the main module
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    getNumberOfPages: () => number;
    internal: {
      scaleFactor: number;
      getFontSize: () => number;
      pageSize: {
        getWidth: () => number;
        getHeight: () => number;
      };
      getStringUnitWidth: (text: string) => number;
      getTextDimensions: (text: string) => { w: number; h: number };
    };
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
