
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPrice, PriceCalculation } from "@/utils/quoteCalculator";
import { Apartment } from "@/data/apartments";
import { addCenteredText, addPageNumbers, formatItalianDate } from "./formatUtils";
import { 
  generateClientSection, 
  generateStayDetailsSection, 
  generateApartmentSection, 
  generateCostsTable, 
  generateNotesSection 
} from "./sectionGenerators";
import "./types"; // Import types to extend jsPDF

// Main function to create and download the quote PDF
export const downloadPDF = (formData: FormValues, apartments: Apartment[], clientName?: string) => {
  try {
    // Find the selected apartments
    const selectedApartmentIds = formData.selectedApartments || [formData.selectedApartment];
    const selectedApts = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
    
    if (selectedApts.length === 0) {
      throw new Error("Nessun appartamento selezionato");
    }
    
    // Calculate the total price
    const priceCalculation = calculateTotalPrice(formData, apartments);
    
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Register the plugin
    autoTable(doc, { startY: -100 }); 
    
    // Add title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    addCenteredText(doc, "Preventivo Soggiorno", 20, 22);
    
    // Add client information
    generateClientSection(doc, formData, clientName);
    
    // Add stay details
    const yAfterStayDetails = generateStayDetailsSection(doc, formData);
    
    // Add apartment details
    const yAfterApartment = generateApartmentSection(doc, selectedApts[0], yAfterStayDetails);
    
    // Generate the costs table data
    const tableBody = generateCostsTable(doc, priceCalculation, formData, yAfterApartment);
    
    // Add the table to the PDF with explicit type handling
    let finalY = yAfterApartment + 150; // Default fallback position
    
    try {
      const tableResult = doc.autoTable({
        startY: yAfterApartment + 20,
        head: [["Voce", "Dettagli", "Importo"]],
        body: tableBody,
        theme: "grid",
        headStyles: { fillColor: [80, 80, 80] },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 50 },
          2: { cellWidth: 40, halign: "right" }
        }
      });
      
      // Try to get the final Y position using different property paths
      if (tableResult) {
        if (typeof tableResult === 'object') {
          // Try different properties that might contain finalY
          if ('lastAutoTable' in tableResult && tableResult.lastAutoTable && 'finalY' in tableResult.lastAutoTable) {
            finalY = tableResult.lastAutoTable.finalY;
          } else if ('finalY' in tableResult) {
            finalY = tableResult.finalY;
          }
        }
      }
    } catch (tableError) {
      console.error("Error creating table:", tableError);
      // Continue with default finalY if table creation fails
    }
    
    // Add notes after the table
    generateNotesSection(doc, finalY);
    
    // Add page numbers
    addPageNumbers(doc);
    
    // Save the PDF
    const today = new Date();
    const fileName = `Preventivo_${clientName || "Cliente"}_${format(today, "yyyyMMdd")}.pdf`;
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error("Errore durante la generazione del PDF:", error);
    throw error;
  }
};
