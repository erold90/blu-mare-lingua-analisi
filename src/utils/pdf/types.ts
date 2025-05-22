
import { jsPDF } from "jspdf";

// PDF section generator function type
export type SectionGenerator = (doc: jsPDF, yPosition: number) => number;

// Table cell definition with styles
export interface TableCell {
  content: string;
  styles: {
    fontStyle?: 'bold' | 'normal' | 'italic';
    textColor?: number[];
    fillColor?: number[];
    fontSize?: number;
    halign?: 'left' | 'center' | 'right';
  };
}

// PDF style configuration
export interface PdfStyles {
  // Font styles
  primaryFont: string;
  secondaryFont: string;
  titleSize: number;
  headingSize: number;
  textSize: number;
  smallTextSize: number;
  
  // Colors (RGB arrays)
  primaryColor: number[];
  secondaryColor: number[];
  accentColor: number[];
  textColor: number[];
  mutedTextColor: number[];
  
  // Spacing
  lineSpacing: number;
  paragraphSpacing: number;
  sectionSpacing: number;
  
  // Margins
  pageMargins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Table configuration
export interface TableConfig {
  headers: (string | TableCell)[][];
  body: (string | TableCell)[][];
  startY: number;
  theme?: string;
  styles?: any;
  columnStyles?: any;
  headStyles?: any;
  margin?: { left: number; right: number };
  alternateRowStyles?: any;
  tableLineColor?: number[];
  tableLineWidth?: number;
}

// Default PDF styles
export const defaultPdfStyles: PdfStyles = {
  primaryFont: 'helvetica',
  secondaryFont: 'times',
  titleSize: 18,
  headingSize: 14,
  textSize: 10,
  smallTextSize: 8,
  
  primaryColor: [0, 32, 96], // Dark blue
  secondaryColor: [80, 80, 80], // Dark gray
  accentColor: [0, 112, 192], // Bright blue
  textColor: [0, 0, 0], // Black
  mutedTextColor: [100, 100, 100], // Gray
  
  lineSpacing: 5,
  paragraphSpacing: 8,
  sectionSpacing: 12,
  
  pageMargins: {
    top: 20,
    right: 15,
    bottom: 20,
    left: 15
  }
};
