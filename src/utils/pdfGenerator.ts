
// Importa la configurazione jspdf per garantire che il plugin sia caricato
import "./pdf/jspdfConfig";

// Import jspdf-autotable to ensure the plugin is registered
import "jspdf-autotable";

// Re-export the main PDF generator functions from the refactored modules
import { downloadPDF } from "./pdf/pdfGenerator";

export { downloadPDF };
