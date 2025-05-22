
// Import jspdf config first to ensure the plugin is loaded
import "./pdf/jspdfConfig";

// Re-export the main PDF generator functions from the refactored modules
import { downloadPDF } from "./pdf/pdfGenerator";

export { downloadPDF };
