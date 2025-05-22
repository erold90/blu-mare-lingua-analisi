
// This file ensures jspdf-autotable is properly loaded and configured

import { jsPDF } from "jspdf";
// Import autotable directly to register the plugin
import "jspdf-autotable";

// Export a function to verify if autoTable is available
export const verifyAutoTable = (doc: jsPDF): boolean => {
  return typeof (doc as any).autoTable === 'function';
};

// Function to ensure autoTable is available
export const ensureAutoTable = (): void => {
  const testDoc = new jsPDF();
  if (!verifyAutoTable(testDoc)) {
    console.error("autoTable is not available. Check the jspdf-autotable import.");
  } else {
    console.log("jspdf-autotable has been loaded correctly.");
  }
};

// Run verification on import
ensureAutoTable();

