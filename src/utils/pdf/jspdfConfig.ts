
// This file ensures jspdf-autotable is properly loaded and configured

import { jsPDF } from "jspdf";
// Import jspdf-autotable plugin - this should register the plugin automatically
import 'jspdf-autotable';

// Create a helper function that safely applies autoTable to a jsPDF instance
export const applyAutoTable = (doc: jsPDF, options: any): any => {
  try {
    // Make sure the plugin is loaded
    if (typeof (doc as any).autoTable !== 'function') {
      console.error("autoTable function is not available on this document instance");
      return null;
    }
    
    // Call the autoTable function
    return (doc as any).autoTable(options);
  } catch (error) {
    console.error("Error applying autoTable:", error);
    return null;
  }
};

// Function to verify if autoTable is available on a document
export const verifyAutoTable = (doc: jsPDF): boolean => {
  return typeof (doc as any).autoTable === 'function';
};

// Test if the plugin is registered
try {
  const testDoc = new jsPDF();
  if (verifyAutoTable(testDoc)) {
    console.log("✓ jspdf-autotable has been successfully loaded and registered.");
  } else {
    console.error("❌ CRITICAL ERROR: autoTable is not available on jsPDF instance.");
    
    // Try to load the plugin manually as a last resort
    console.log("Attempting manual registration of autoTable plugin...");
    
    // This is a desperate fallback if the import didn't work
    if (typeof window !== 'undefined') {
      console.log("Current jsPDF prototype methods:", Object.keys(Object.getPrototypeOf(testDoc)));
    }
  }
} catch (error) {
  console.error("Failed to test jspdf-autotable:", error);
}
