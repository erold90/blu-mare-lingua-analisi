
import { jsPDF } from "jspdf";
import { createSection } from "../formatUtils";

/**
 * This section has been removed from the quote PDF
 * Kept for backward compatibility but not used
 */
export const generateClientInfoSection = (doc: jsPDF, clientName: string | undefined, yPos: number): number => {
  // Just return the yPos without doing anything
  return yPos;
};
