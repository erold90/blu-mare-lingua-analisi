
import { jsPDF } from "jspdf";

// Extend jspdf-autotable type definitions
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => {
      previous: {
        finalY: number;
      };
    };
    getNumberOfPages: () => number;
    getFontSize: () => number;
    internal: {
      scaleFactor: number;
      getFontSize: () => number;
      pageSize: {
        getWidth: () => number;
        getHeight: () => number;
      };
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
