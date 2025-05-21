
import { jsPDF } from "jspdf";

// Type definition for the return value of autoTable
export interface AutoTableResult {
  finalY: number;
  [key: string]: any;
}

// Extended methods we need for our custom jsPDF functionality
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => AutoTableResult;
    getNumberOfPages: () => number;
    saveGraphicsState: () => jsPDF;
    restoreGraphicsState: () => jsPDF;
    translate: (x: number, y: number) => jsPDF;
    rotate: (angle: number) => jsPDF;
  }
  
  // Add the missing internal methods without redefining the entire internal property
  namespace internal {
    function getFontSize(): number;
    function getStringUnitWidth(text: string): number;
    function getTextDimensions(text: string): { w: number; h: number };
  }
}

export interface PriceCalculation {
  basePrice: number;
  extras: number;
  cleaningFee: number;
  touristTax: number;
  touristTaxPerPerson: number;  // Added missing property
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
  discount: number;
  savings: number;
  deposit: number;
  nights: number;
  totalPrice: number;
  subtotal: number;
  apartmentPrices: Record<string, number>;
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
  colors?: {
    primary?: [number, number, number];
    secondary?: [number, number, number];
    heading?: [number, number, number];
  };
}
