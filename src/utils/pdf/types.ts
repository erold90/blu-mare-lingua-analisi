
import { jsPDF } from "jspdf";
import type { PriceCalculation } from "@/utils/price/types";
import "jspdf-autotable"; // Importo corretto per registrare il plugin

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

// Extend the jsPDF interface to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => AutoTableResult;
    lastAutoTable?: AutoTableResult;
  }
}

// Re-export the PriceCalculation interface from the central location
export type { PriceCalculation };
