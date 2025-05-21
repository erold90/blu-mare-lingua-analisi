
import { jsPDF } from "jspdf";

// Type definition for the return value of autoTable
interface AutoTableResult {
  finalY: number;
  [key: string]: any;
}

// Extend jspdf-autotable type definitions for the main module
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => AutoTableResult;
    getNumberOfPages: () => number;
    internal: {
      events: any;
      scaleFactor: number;
      pageSize: { 
        width: number;
        getWidth: () => number;
        height: number;
        getHeight: () => number;
      };
      pages: any[];
      getEncryptor(objectId: number): (data: string) => string;
      getFontSize: () => number;
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
