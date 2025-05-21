
import { jsPDF } from "jspdf";
import { PriceCalculation } from "@/utils/price/types"; // Import from the central location

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

// Re-export the PriceCalculation interface from the central location
export { PriceCalculation };
