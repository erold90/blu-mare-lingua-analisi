
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { QuoteFormValues } from "./quoteFormSchema";
import { calculateQuotePrice } from "./quoteCalculator";

export const generateQuotePDF = (
  formValues: QuoteFormValues,
  clientName: string
) => {
  // Create PDF instance
  const doc = new jsPDF();
  
  // Format today's date
  const today = format(new Date(), "dd-MM-yyyy");
  
  // Clean up name for the file (remove special characters)
  const safeName = clientName.replace(/[^a-zA-Z0-9]/g, "_");
  
  // Calculate prices
  const selectedApartments = formValues.selectedApartments || [];
  const priceInfo = calculateQuotePrice(formValues);
  
  // --- Header with Logo and Title ---
  // Logo (placeholder)
  doc.setFillColor(0, 85, 164);
  doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("VILLA MAREBLU", doc.internal.pageSize.width / 2, 20, { align: "center" });
  doc.setFontSize(14);
  doc.text("Preventivo di Soggiorno", doc.internal.pageSize.width / 2, 30, { align: "center" });
  
  // Reset text color for the rest of the document
  doc.setTextColor(0, 0, 0);
  
  // --- Client Information ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Dettagli Cliente", 15, 50);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${clientName}`, 15, 60);
  
  if (formValues.email) {
    doc.text(`Email: ${formValues.email}`, 115, 60);
  }
  
  if (formValues.phone) {
    doc.text(`Telefono: ${formValues.phone}`, 15, 65);
  }
  
  // --- Stay Details ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Dettagli del Soggiorno", 15, 75);
  
  const checkInDate = format(formValues.checkIn, "dd/MM/yyyy");
  const checkOutDate = format(formValues.checkOut, "dd/MM/yyyy");
  
  let yPos = 85;
  
  doc.setFontSize(10);
  // Create stay details table and get its final position
  const stayTable = autoTable(doc, {
    startY: yPos,
    head: [["Periodo", "Durata", "Ospiti"]],
    body: [
      [
        `${checkInDate} - ${checkOutDate}`,
        `${formValues.days} notti`,
        `${formValues.guestCount} persone`
      ]
    ],
    theme: "grid",
    headStyles: { fillColor: [0, 85, 164] },
  });
  
  // Update position for next section
  yPos = (stayTable.lastRow?.position?.y || yPos + 20) + 20;
  
  // --- Apartments Section ---
  doc.setFontSize(14);
  doc.setTextColor(0, 85, 164);
  doc.text("Appartamenti", 15, yPos);
  
  // Prepare apartment data for table
  const apartmentData = selectedApartments.map(apt => {
    // Calculate total price for this apartment
    const apartmentDays = formValues.days;
    const apartmentBasePrice = apt.pricePerNight;
    const occupancyRate = apt.occupancy / apt.capacity;
    let priceMultiplier = 1;
    
    // Apply price adjustments based on occupancy
    if (occupancyRate <= 0.5) {
      priceMultiplier = 0.9; // 10% discount for low occupancy
    }
    
    const totalPrice = apartmentBasePrice * apartmentDays * priceMultiplier;
    
    return [
      apt.name,
      `${apt.capacity} persone`,
      `${apt.occupancy} persone`,
      `${apartmentBasePrice}€ per notte`,
      `${totalPrice.toFixed(2)}€`
    ];
  });
  
  // Create apartments table and get its final position
  const apartmentsTable = autoTable(doc, {
    startY: yPos + 5,
    head: [["Appartamento", "Capacità", "Occupazione", "Prezzo", "Totale"]],
    body: apartmentData,
    theme: "grid",
    headStyles: { fillColor: [0, 85, 164] },
  });
  
  // Update position for next section
  yPos = (apartmentsTable.lastRow?.position?.y || yPos + 50) + 20;
  
  // --- Services Section ---
  doc.setFontSize(14);
  doc.setTextColor(0, 85, 164);
  doc.text("Servizi extra", 15, yPos);
  
  // Calculate services data
  const servicesData = [];
  
  // Selected services
  const selectedServices = formValues.selectedServices || [];
  if (selectedServices.length > 0) {
    selectedServices.forEach(service => {
      // Calculate service total price
      const serviceTotal = service.priceType === "perStay" 
        ? service.price
        : service.price * formValues.days;
      
      servicesData.push([
        service.name,
        service.priceType === "perStay" ? "Una tantum" : "Per notte",
        `${serviceTotal}€`
      ]);
    });
  }
  
  // Tourist tax
  servicesData.push(["Tassa di soggiorno", "1€ per notte per persona", `${priceInfo.touristTax}€`]);
  
  // Create services table and get its final position
  const servicesTable = autoTable(doc, {
    startY: yPos + 5,
    head: [["Servizio", "Descrizione", "Totale"]],
    body: servicesData,
    theme: "grid",
    headStyles: { fillColor: [0, 85, 164] },
  });
  
  // Update position for next section
  yPos = (servicesTable.lastRow?.position?.y || yPos + 50) + 20;
  
  // --- Price Summary ---
  doc.setFontSize(14);
  doc.setTextColor(0, 85, 164);
  doc.text("Riepilogo costi", 15, yPos);
  
  // Create summary table
  const summaryData = [
    ["Totale appartamenti", `${priceInfo.apartmentsTotal}€`],
    ["Totale servizi extra", `${priceInfo.servicesTotal}€`],
    ["Tassa di soggiorno", `${priceInfo.touristTax}€`]
  ];
  
  if (priceInfo.savings > 0) {
    summaryData.push(["Sconto applicato", `-${priceInfo.savings}€`]);
  }
  
  // Create summary table and get its final position
  const summaryTable = autoTable(doc, {
    startY: yPos + 5,
    body: summaryData,
    theme: "grid",
    styles: { fontSize: 10 },
  });
  
  // Final price in bold
  const finalY = (summaryTable.lastRow?.position?.y || yPos + 50) + 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Totale soggiorno:", 60, finalY, { align: "right" });
  doc.text(`${priceInfo.grandTotal}€`, 150, finalY, { align: "right" });
  
  // --- Terms and Conditions ---
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Termini e Condizioni", 15, finalY + 20);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  let termsY = finalY + 25;
  
  const terms = [
    "• Questo preventivo è valido per 7 giorni dalla data di emissione.",
    "• Al momento della conferma è richiesto un acconto del 30% dell'importo totale.",
    "• Il saldo deve essere versato 30 giorni prima dell'arrivo.",
    "• In caso di cancellazione fino a 30 giorni prima dell'arrivo, verrà trattenuto il 20% dell'acconto.",
    "• In caso di cancellazione entro 30 giorni dall'arrivo, l'acconto non sarà rimborsabile.",
    "• Il check-in è previsto dalle 15:00 alle 19:00. Il check-out è previsto entro le 10:00.",
    "• È richiesta una cauzione di 200€ al momento del check-in, che sarà restituita al check-out previa verifica dell'appartamento."
  ];
  
  terms.forEach((term, index) => {
    doc.text(term, 15, termsY + (index * 5));
  });
  
  // --- Footer with Contact Information ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const footerY = doc.internal.pageSize.height - 30;
  doc.text("Villa MareBlu", 15, footerY);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Via Marco Polo 112, Patù (LE), 73053, Salento, Puglia", 15, footerY + 5);
  doc.text("Tel: +39 123 456 7890 | Email: info@villamareblu.it | www.villamareblu.it", 15, footerY + 10);
  
  // Date of quote generation
  doc.text(`Preventivo generato il: ${today}`, doc.internal.pageSize.width - 15, footerY + 10, { align: "right" });
  
  // Save the PDF with a formatted filename
  doc.save(`Preventivo_VillaMareBlu_${safeName}_${today}.pdf`);
};
