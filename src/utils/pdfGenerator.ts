
// Import first to ensure the plugin is loaded
import "jspdf-autotable";

// Re-export the main PDF generator functions from the refactored modules
import { downloadPDF } from "./pdf/pdfGenerator";

export { downloadPDF };
