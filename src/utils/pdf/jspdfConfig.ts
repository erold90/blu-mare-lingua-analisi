
// This file ensures jspdf-autotable is properly loaded and configured

import { jsPDF } from "jspdf";
// Import autotable directly
import "jspdf-autotable";

// Export a helper function that applies autoTable to a jsPDF instance
export const applyAutoTable = (doc: jsPDF, options: any) => {
  // Access autoTable through the 'any' type to bypass TypeScript checks
  return (doc as any).autoTable(options);
};

// Function to verify if autoTable is available
export const verifyAutoTable = (doc: jsPDF): boolean => {
  return typeof (doc as any).autoTable === 'function';
};

// Test immediately to see if the plugin is registered
const testDoc = new jsPDF();
if (!verifyAutoTable(testDoc)) {
  console.error("CRITICAL ERROR: autoTable is not available. Check the jspdf-autotable import.");
} else {
  console.log("jspdf-autotable has been loaded correctly.");
}
