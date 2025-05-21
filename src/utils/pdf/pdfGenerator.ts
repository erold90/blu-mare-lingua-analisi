
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
      console.error("Nessun appartamento selezionato");
      return;
    }
    
    // Calculate the total price
    const priceCalculation = calculateTotalPrice(formData, apartments);
    
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Apply autoTable to document
    autoTable(doc, { startY: -100 }); // This is just to register the plugin
    
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
    
    // Add the table to the PDF
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
    
    // Get the final Y position after the table - provide fallback value
    let finalY = yAfterApartment + 150; // Default fallback position
    if (tableResult && typeof tableResult === 'object') {
      if ('lastAutoTable' in tableResult && tableResult.lastAutoTable?.finalY) {
        finalY = tableResult.lastAutoTable.finalY;
      } else if ('finalY' in tableResult && tableResult.finalY) {
        finalY = tableResult.finalY;
      }
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
