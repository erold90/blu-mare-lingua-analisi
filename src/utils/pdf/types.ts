
import { jsPDF } from "jspdf";
import type { PriceCalculation } from "@/utils/price/types";
import "jspdf-autotable"; // Import the module to ensure types are loaded

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

// We don't need to declare the module here since we're importing the package
// which already augments the jsPDF type

// Re-export the PriceCalculation interface from the central location
export type { PriceCalculation };
