
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPrice } from "@/utils/quoteCalculator";
import { PriceCalculation } from "@/utils/price/types"; 
import { Apartment } from "@/data/apartments";
import { 
  addCenteredText, 
  addPageNumbers, 
  formatItalianDate,
  addLogo,
  addFooter,
  addWatermark,
  addHeaderBackground
} from "./formatUtils";
import { 
  generateClientSection, 
  generateStayDetailsSection, 
  generateApartmentSection, 
  generateCostsTable, 
  generateNotesSection,
  generatePaymentMethodsSection
} from "./sectionGenerators";
import { AutoTableResult } from "./types";

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
    
    // Add watermark
    addWatermark(doc);
    
    // Add logo
    const yAfterLogo = addLogo(doc);
    
    // Add title with elegant styling
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(47, 84, 150);
    addCenteredText(doc, "Preventivo Soggiorno", yAfterLogo, 22);
    doc.setTextColor(0, 0, 0);
    
    // Add client information
    const yAfterClient = generateClientSection(doc, formData, clientName);
    
    // Add stay details
    const yAfterStayDetails = generateStayDetailsSection(doc, formData);
    
    // Add apartment details
    const yAfterApartment = generateApartmentSection(doc, selectedApts[0], yAfterStayDetails);
    
    // Generate the costs table data
    const tableBody = generateCostsTable(doc, priceCalculation, formData, yAfterApartment);
    
    // Add the table to the PDF with enhanced styling
    let finalY = yAfterApartment + 150; // Default fallback position
    
    try {
      // Create table and store the result
      const result = doc.autoTable({
        startY: yAfterApartment + 25,
        head: [["Voce", "Dettagli", "Importo"]],
        body: tableBody,
        theme: "grid",
        headStyles: { 
          fillColor: [47, 84, 150],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 60 },
          2: { cellWidth: 40, halign: "right" }
        },
        alternateRowStyles: {
          fillColor: [245, 248, 252]
        },
        margin: { left: 20, right: 20 },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        tableLineColor: [220, 220, 220],
        tableLineWidth: 0.5
      });
      
      // Update finalY if available
      if (result && typeof result.finalY === 'number') {
        finalY = result.finalY;
      }
    } catch (tableError) {
      console.error("Error creating table:", tableError);
      // Continue with default finalY if table creation fails
    }
    
    // Check if we need to add a new page for notes section
    if (finalY > doc.internal.pageSize.getHeight() - 100) {
      doc.addPage();
      finalY = 20;
    }
    
    // Add notes after the table
    const yAfterNotes = generateNotesSection(doc, finalY);
    
    // Add payment methods section
    if (yAfterNotes > doc.internal.pageSize.getHeight() - 100) {
      doc.addPage();
      generatePaymentMethodsSection(doc, 20);
    } else {
      generatePaymentMethodsSection(doc, yAfterNotes);
    }
    
    // Add footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      addFooter(doc);
    }
    
    // Add page numbers
    addPageNumbers(doc);
    
    // Save the PDF
    const today = new Date();
    const fileName = `Preventivo_${clientName || formData.name || "Cliente"}_${format(today, "yyyyMMdd")}.pdf`;
    
    // Use the method save without options to avoid the t.translate error
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error("Errore durante la generazione del PDF:", error);
    throw error;
  }
};
