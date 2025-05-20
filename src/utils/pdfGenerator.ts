
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { FormValues } from "./quoteFormSchema";
import { calculateTotalPrice } from "./quoteCalculator";

export const generatePDF = (
  formData: FormValues,
  priceInfo: ReturnType<typeof calculateTotalPrice>,
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
  doc.text(`Nome: ${formData.firstName} ${formData.lastName}`, 14, yPos);
  yPos += 5;
  
  doc.text(`Email: ${formData.email}`, 14, yPos);
  yPos += 5;
  
  doc.text(`Telefono: ${formData.phone}`, 14, yPos);
  yPos += 5;
  
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
        `Dal ${format(formData.startDate, "dd/MM/yyyy")} al ${format(formData.endDate, "dd/MM/yyyy")}`,
        `${priceInfo.nights} notti`,
        `${priceInfo.totalGuests} persone`
      ]
    ],
    theme: "grid",
    headStyles: { fillColor: [0, 85, 164] },
  });
  
  // Update position for next section
  yPos = (stayTable?.finalY ?? yPos) + 20;
  
  // --- Apartments Section ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Appartamenti Selezionati", 14, yPos);
  yPos += 10;
  
  // Prepare apartment data for table
  const apartmentData = [];
  
  // Add apartments if selected
  if (formData.apartments && formData.apartments.length > 0) {
    for (const apt of formData.apartments) {
      const subTotal = apt.pricePerNight * priceInfo.nights;
      
      apartmentData.push([
        apt.name,
        `${apt.maxGuests} persone`,
        `${apt.assignedGuests} ${apt.assignedGuests === 1 ? "persona" : "persone"}`,
        `${apt.pricePerNight}€ per notte`,
        `${subTotal}€`
      ]);
    }
  }
  
  // Add a line for groups if selected
  if (formData.selectedGroup) {
    apartmentData.push([
      `Gruppo: ${formData.selectedGroup.name}`,
      `${formData.selectedGroup.maxGuests} persone`,
      `${priceInfo.totalGuests} ${priceInfo.totalGuests === 1 ? "persona" : "persone"}`,
      `${formData.selectedGroup.pricePerNight}€ per notte`,
      `${formData.selectedGroup.pricePerNight * priceInfo.nights}€`
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
  yPos = (apartmentsTable?.finalY ?? yPos) + 20;
  
  // --- Services Section ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Servizi e Costi Aggiuntivi", 14, yPos);
  yPos += 10;
  
  // Prepare services data for table
  const servicesData = [];
  
  // Add cleaning fee
  servicesData.push(["Pulizia finale", "Obbligatoria", `${priceInfo.cleaningFee}€`]);
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
  yPos = (servicesTable?.finalY ?? yPos) + 20;
  
  // --- Price Summary ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Riepilogo Costi", 14, yPos);
  yPos += 10;
  
  // Prepare summary data for table
  const summaryData = [];
  
  // Add subtotal row
  summaryData.push(["Subtotale alloggio", "", `${priceInfo.accommodationSubtotal}€`]);
  
  // Add additional costs if any
  if (priceInfo.cleaningFee > 0) {
    summaryData.push(["Pulizia finale", "", `${priceInfo.cleaningFee}€`]);
  }
  summaryData.push(["Tassa di soggiorno", "", `${priceInfo.touristTax}€`]);
  summaryData.push(["TOTALE", "", `${priceInfo.totalPrice}€`]);
  
  // Create summary table
  const summaryTable = autoTable(doc, {
    startY: yPos + 5,
    body: summaryData,
    theme: "grid",
    styles: { fontSize: 10 },
  });
  
  // Final price in bold
  const finalY = (summaryTable?.finalY ?? yPos) + 10;
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

// Funzione per il download del PDF
export const downloadPDF = (
  formData: FormValues,
  priceInfo: ReturnType<typeof calculateTotalPrice>,
  quoteId: string
) => {
  const doc = generatePDF(formData, priceInfo, quoteId);
  doc.save(`Preventivo_VillaMareBlu_${quoteId}.pdf`);
  return doc;
};
