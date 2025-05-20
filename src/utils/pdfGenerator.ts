
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { FormValues } from "./quoteFormSchema";
import { calculateTotalPrice, PriceCalculation } from "./quoteCalculator";
import { Apartment } from "@/data/apartments";

export const generatePDF = (
  formData: FormValues,
  priceInfo: PriceCalculation,
  quoteId: string
) => {
  // Create PDF instance
  const doc = new jsPDF();
  
  // Format today's date
  const today = format(new Date(), "dd-MM-yyyy");
  
  // Initial position for content
  let yPos = 20;
  
  // --- Header ---
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Villa MareBlu - Preventivo", 105, yPos, { align: "center" });
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Data: ${today}`, 105, yPos, { align: "center" });
  yPos += 5;
  
  doc.text(`Preventivo N°: ${quoteId}`, 105, yPos, { align: "center" });
  yPos += 15;
  
  // --- Customer Information ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Dati Cliente", 14, yPos);
  yPos += 7;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${formData.name || "Cliente"}`, 14, yPos);
  yPos += 5;
  
  doc.text(`Email: ${formData.email || ""}`, 14, yPos);
  yPos += 5;
  
  if (formData.phone) {
    doc.text(`Telefono: ${formData.phone}`, 14, yPos);
    yPos += 5;
  }
  
  if (formData.notes) {
    doc.text(`Note: ${formData.notes}`, 14, yPos);
    yPos += 5;
  }
  
  yPos += 10;
  
  // --- Stay Details ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Dettagli del Soggiorno", 14, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  // Create stay details table
  const stayTable = autoTable(doc, {
    startY: yPos,
    head: [["Periodo", "Durata", "Ospiti"]],
    body: [
      [
        `Dal ${format(formData.checkIn || new Date(), "dd/MM/yyyy")} al ${format(formData.checkOut || new Date(), "dd/MM/yyyy")}`,
        `${priceInfo.nights} notti`,
        `${formData.adults || 0} adulti, ${formData.children || 0} bambini`
      ]
    ],
    theme: "grid",
    headStyles: { fillColor: [0, 85, 164] },
  });
  
  // Update position for next section
  yPos = (stayTable.lastAutoTable?.finalY || yPos) + 20;
  
  // --- Apartments Section ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Appartamenti Selezionati", 14, yPos);
  yPos += 10;
  
  // Prepare apartment data for table
  const apartmentData = [];
  
  // Add selected apartments if any
  if (formData.selectedApartments && formData.selectedApartments.length > 0) {
    for (const aptId of formData.selectedApartments) {
      // This is just for the PDF display, actual price calculation is done elsewhere
      apartmentData.push([
        aptId, // Apartment ID/name
        "Vedere dettagli", // Placeholder for capacity
        "Vedere dettagli", // Placeholder for occupancy
        "Vedere dettagli", // Placeholder for price
        "Vedere dettagli" // Placeholder for total
      ]);
    }
  } else if (formData.selectedApartment) {
    apartmentData.push([
      formData.selectedApartment,
      "Vedere dettagli", // Placeholder for capacity
      "Vedere dettagli", // Placeholder for occupancy
      "Vedere dettagli", // Placeholder for price
      "Vedere dettagli" // Placeholder for total
    ]);
  }
  
  // Create apartments table
  const apartmentsTable = autoTable(doc, {
    startY: yPos + 5,
    head: [["Appartamento", "Capacità", "Occupazione", "Prezzo", "Totale"]],
    body: apartmentData.length > 0 ? apartmentData : [["--", "--", "--", "--", "--"]],
    theme: "grid",
    headStyles: { fillColor: [0, 85, 164] },
  });
  
  // Update position for next section
  yPos = (apartmentsTable.lastAutoTable?.finalY || yPos) + 20;
  
  // --- Services Section ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Servizi e Costi Aggiuntivi", 14, yPos);
  yPos += 10;
  
  // Prepare services data for table
  const servicesData = [];
  
  // Add cleaning fee
  servicesData.push(["Pulizia finale", "Obbligatoria", `${priceInfo.extras}€`]);
  servicesData.push(["Tassa di soggiorno", "1€ per notte per persona", `${priceInfo.touristTax}€`]);
  
  // Create services table
  const servicesTable = autoTable(doc, {
    startY: yPos + 5,
    head: [["Servizio", "Descrizione", "Totale"]],
    body: servicesData,
    theme: "grid",
    headStyles: { fillColor: [0, 85, 164] },
  });
  
  // Update position for next section
  yPos = (servicesTable.lastAutoTable?.finalY || yPos) + 20;
  
  // --- Price Summary ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Riepilogo Costi", 14, yPos);
  yPos += 10;
  
  // Prepare summary data for table
  const summaryData = [];
  
  // Add subtotal row
  summaryData.push(["Subtotale alloggio", "", `${priceInfo.basePrice}€`]);
  
  // Add additional costs if any
  if (priceInfo.extras > 0) {
    summaryData.push(["Servizi extra", "", `${priceInfo.extras}€`]);
  }
  summaryData.push(["Tassa di soggiorno", "", `${priceInfo.touristTax}€`]);
  summaryData.push(["TOTALE", "", `${priceInfo.totalAfterDiscount}€`]);
  
  // Create summary table
  const summaryTable = autoTable(doc, {
    startY: yPos + 5,
    body: summaryData,
    theme: "grid",
    styles: { fontSize: 10 },
  });
  
  // Final price in bold
  const finalY = (summaryTable.lastAutoTable?.finalY || yPos) + 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Grazie per aver scelto Villa MareBlu!", 105, finalY + 10, { align: "center" });
  
  // Footer with terms
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const footerText = "Questo preventivo è valido per 7 giorni dalla data di emissione. L'importo richiesto per la conferma è del 30% del totale.";
  doc.text(footerText, 105, 280, { align: "center" });
  
  return doc;
};

// Function for downloading the PDF
export const downloadPDF = (
  formData: FormValues,
  apartments: Apartment[],
  name?: string
) => {
  // Generate a simple quote ID
  const quoteId = `Q${Date.now().toString().slice(-6)}`;
  
  // Calculate price info
  const priceInfo = calculateTotalPrice(formData, apartments);
  
  // Create the PDF
  const doc = generatePDF(formData, priceInfo, quoteId);
  
  // Generate filename with client name if provided
  const filename = name 
    ? `Preventivo_VillaMareBlu_${name.replace(/\s+/g, '')}_${quoteId}.pdf`
    : `Preventivo_VillaMareBlu_${quoteId}.pdf`;
  
  // Save the PDF
  doc.save(filename);
  
  return doc;
};
