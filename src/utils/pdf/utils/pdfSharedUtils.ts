
import { jsPDF } from "jspdf";
import { TableCell } from "../types";

/**
 * Text formatting utilities for PDF generation
 */

// Format text with optional styling
export const formatText = (
  doc: jsPDF,
  text: string,
  options?: {
    fontSize?: number;
    fontStyle?: "normal" | "bold" | "italic";
    textColor?: number[];
    align?: "left" | "center" | "right";
  }
) => {
  // Save current state
  const currentFontSize = doc.getFontSize();
  const currentTextColor = doc.getTextColor();
  const currentFontStyle = doc.getFont();
  
  // Apply new styles
  if (options?.fontSize) {
    doc.setFontSize(options.fontSize);
  }
  
  if (options?.fontStyle) {
    doc.setFont("helvetica", options.fontStyle);
  }
  
  if (options?.textColor) {
    doc.setTextColor(options.textColor[0], options.textColor[1], options.textColor[2]);
  }
  
  // Restore original state after function exits
  return {
    text,
    reset: () => {
      doc.setFontSize(currentFontSize);
      doc.setTextColor(currentTextColor);
      doc.setFont(currentFontStyle);
    }
  };
};

/**
 * Layout utilities for PDF generation 
 */

// Create a standard content box with consistent styling
export const createContentBox = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: {
    fillColor?: number[];
    strokeColor?: number[];
    radius?: number;
    shadow?: boolean;
  }
) => {
  // Default styling
  const fillColor = options?.fillColor || [248, 250, 252];
  const strokeColor = options?.strokeColor || [220, 225, 235];
  const radius = options?.radius || 3;
  
  // Draw box
  doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
  doc.setDrawColor(strokeColor[0], strokeColor[1], strokeColor[2]);
  doc.roundedRect(x, y, width, height, radius, radius, 'FD');
  
  // Apply shadow if requested
  if (options?.shadow) {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    // Simple shadow effect
    doc.rect(x + 2, y + 2, width, height);
  }
  
  return {
    x,
    y,
    width,
    height,
    // Helper to add content with proper padding
    addContent: (contentFn: (contentX: number, contentY: number, contentWidth: number) => void) => {
      const padding = 5;
      contentFn(x + padding, y + padding, width - (padding * 2));
    }
  };
};

/**
 * Table utilities for PDF generation 
 */

// Create a simple key-value row with consistent styling
export const createKeyValueRow = (
  doc: jsPDF,
  key: string,
  value: string,
  y: number,
  options?: {
    keyWidth?: number;
    valueX?: number;
    fontSize?: number;
    keyStyle?: "normal" | "bold" | "italic";
    valueStyle?: "normal" | "bold" | "italic";
  }
) => {
  const defaultOptions = {
    keyWidth: doc.internal.pageSize.getWidth() / 3,
    valueX: doc.internal.pageSize.getWidth() / 3,
    fontSize: 10,
    keyStyle: "normal" as const,
    valueStyle: "normal" as const
  };
  
  const opts = { ...defaultOptions, ...options };
  
  // Format key
  const keyFormatted = formatText(doc, key, { 
    fontSize: opts.fontSize, 
    fontStyle: opts.keyStyle 
  });
  
  // Write key
  doc.text(keyFormatted.text, 12, y);
  keyFormatted.reset();
  
  // Format value
  const valueFormatted = formatText(doc, value, { 
    fontSize: opts.fontSize, 
    fontStyle: opts.valueStyle 
  });
  
  // Write value
  doc.text(valueFormatted.text, opts.valueX, y);
  valueFormatted.reset();
  
  return y + (opts.fontSize / 2) + 5; // Return next Y position
};

/**
 * Convert table cell data to proper format for jspdf-autotable
 * Works with both simple strings and TableCell objects
 */
export const formatCellData = (
  cell: string | string[] | TableCell | any[]
): string | TableCell => {
  // Handle string or string array (simple content)
  if (typeof cell === 'string' || Array.isArray(cell) && typeof cell[0] === 'string') {
    return cell as string;
  }
  
  // Handle TableCell object (with content and styles)
  if (cell && typeof cell === 'object' && 'content' in cell) {
    return cell as TableCell;
  }
  
  // Return empty string as fallback
  return '';
};

/**
 * Section styling utilities for consistent PDF sections
 */

// Create a section title with consistent styling
export const createSectionTitle = (
  doc: jsPDF, 
  title: string, 
  y: number,
  options?: {
    fontSize?: number;
    fontStyle?: "normal" | "bold" | "italic";
    backgroundColor?: number[];
    textColor?: number[];
    height?: number;
  }
) => {
  const defaultOptions = {
    fontSize: 11,
    fontStyle: "bold" as const,
    backgroundColor: [240, 240, 240],
    textColor: [0, 0, 0],
    height: 10
  };
  
  const opts = { ...defaultOptions, ...options };
  
  // Add background
  doc.setFillColor(opts.backgroundColor[0], opts.backgroundColor[1], opts.backgroundColor[2]);
  doc.rect(10, y, doc.internal.pageSize.getWidth() - 20, opts.height, 'F');
  
  // Add title text
  const titleFormatted = formatText(doc, title, {
    fontSize: opts.fontSize,
    fontStyle: opts.fontStyle,
    textColor: opts.textColor
  });
  
  doc.text(titleFormatted.text, 12, y + (opts.height * 0.7));
  titleFormatted.reset();
  
  return y + opts.height; // Return next Y position
};

// Draw a separator line with consistent styling
export const drawSeparatorLine = (
  doc: jsPDF,
  y: number,
  options?: {
    color?: number[];
    width?: number;
    marginLeft?: number;
    marginRight?: number;
  }
) => {
  const defaultOptions = {
    color: [200, 200, 200],
    width: 0.5,
    marginLeft: 10,
    marginRight: 10
  };
  
  const opts = { ...defaultOptions, ...options };
  
  doc.setDrawColor(opts.color[0], opts.color[1], opts.color[2]);
  doc.setLineWidth(opts.width);
  doc.line(
    opts.marginLeft, 
    y, 
    doc.internal.pageSize.getWidth() - opts.marginRight, 
    y
  );
  
  return y + 5; // Return next Y position with some padding
};

