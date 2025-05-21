
import { jsPDF } from "jspdf";
import type { PriceCalculation } from "@/utils/price/types"; // Import using 'type' keyword

// Type definition for the return value of autoTable
export interface AutoTableResult {
  finalY: number;
  cursor?: {
    y: number;
  };
  [key: string]: any;
}

// Type for table cell content with styles
export interface TableCell {
  content: string;
  styles?: {
    fontStyle?: 'bold' | 'italic' | 'normal';
    fillColor?: number[];
    textColor?: number[];
    halign?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
    fontSize?: number;
  };
}

// Extended methods we need for our custom jsPDF functionality
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => AutoTableResult;
    getNumberOfPages: () => number;
  }
  
  // Add the missing internal methods without redefining the entire internal property
  namespace internal {
    function getFontSize(): number;
    function getStringUnitWidth(text: string): number;
    function getTextDimensions(text: string): { w: number; h: number };
  }
}

// Re-export the PriceCalculation interface from the central location using 'export type'
export type { PriceCalculation };
