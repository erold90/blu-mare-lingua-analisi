
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FormValues } from "./quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { calculateTotalPrice } from "./quoteCalculator";
import { format } from "date-fns";
import { getEffectiveGuestCount } from "./apartmentRecommendation";

/**
 * Generates a professional quote PDF for Villa MareBlu
 * @param formValues The form values containing customer and booking details
 * @param apartments The list of apartments
 * @param clientName Optional client name to personalize the quote
 * @returns The jsPDF document instance (can be saved or opened)
 */
export const generateQuotePDF = (
  formValues: FormValues,
  apartments: Apartment[],
  clientName?: string
): jsPDF => {
  // Initialize the PDF document
  const doc = new jsPDF();
  
  // Get the price calculation
  const priceInfo = calculateTotalPrice(formValues, apartments);
  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  const { totalGuests, effectiveGuestCount, sleepingWithParents, sleepingInCribs } = getEffectiveGuestCount(formValues);
  
  // Set document properties
  doc.setProperties({
    title: "Preventivo Villa MareBlu",
    subject: "Preventivo soggiorno",
    author: "Villa MareBlu",
    creator: "Villa MareBlu Quote System"
  });
  
  // --- Header Section ---
  doc.setFontSize(24);
  doc.setTextColor(0, 85, 164); // Blue color
  doc.text("Villa MareBlu", 105, 20, { align: "center" });
  
  doc.setFontSize(16);
  doc.setTextColor(100);
  doc.text("Preventivo Soggiorno", 105, 30, { align: "center" });
  
  // --- Date and Reference ---
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Data: ${format(new Date(), "dd/MM/yyyy")}`, 195, 40, { align: "right" });
  doc.text(`Rif: VM${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`, 195, 45, { align: "right" });
  
  // --- Client Information ---
  doc.setFontSize(12);
  doc.setTextColor(0);
  const name = clientName || formValues.name || "Cliente";
  doc.text(`Preventivo per: ${name}`, 15, 50);
  
  // --- Stay Details ---
  doc.setFontSize(14);
  doc.setTextColor(0, 85, 164);
  doc.text("Dettagli del soggiorno", 15, 65);
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  const checkInDate = format(formValues.checkIn, "dd/MM/yyyy");
  const checkOutDate = format(formValues.checkOut, "dd/MM/yyyy");
  
  let yPos = 70;
  
  doc.setFontSize(10);
  // Create stay details table and get its final position
  const stayTable = autoTable(doc, {
    startY: yPos,
    head: [["Periodo", "Durata", "Ospiti"]],
    body: [
      [
        `${checkInDate} - ${checkOutDate}`, 
        `${priceInfo.nights} notti`,
        `${formValues.adults} adulti${formValues.children > 0 ? `, ${formValues.children} bambini` : ""}`
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [0, 85, 164] },
  });
  
  // Update position for next section
  yPos = (stayTable.lastRow?.position?.y || 70) + 20;
  
  // --- Apartments Section ---
  doc.setFontSize(14);
  doc.setTextColor(0, 85, 164);
  doc.text("Appartamenti", 15, yPos);
  
  // Prepare apartment data for table
  const apartmentData = selectedApartments.map(apt => {
    let personsCount = 0;
    if (formValues.personsPerApartment && formValues.personsPerApartment[apt.id]) {
      personsCount = formValues.personsPerApartment[apt.id];
    }
    
    const hasPets = formValues.petsInApartment && formValues.petsInApartment[apt.id];
    
    return [
      apt.name,
      `${apt.capacity} persone`,
      `${personsCount} ospiti${hasPets ? " + animali" : ""}`,
      `${apt.price}€/notte`,
      `${apt.price * priceInfo.nights}€`
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
  
  // Linen service
  if (formValues.linenOption === "extra") {
    servicesData.push(["Servizio biancheria", "15€ per persona", `${priceInfo.extras}€`]);
  } else {
    servicesData.push(["Servizio biancheria", "Standard (incluso)", "0€"]);
  }
  
  // Pets
  if (formValues.hasPets) {
    servicesData.push(["Animali domestici", "50€ per appartamento con animali", "50€"]);
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
    ["Costo appartamenti", `${priceInfo.basePrice}€`],
    ["Servizi extra", `${priceInfo.extras}€`],
    ["Tassa di soggiorno", "Inclusa"],
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
  doc.setTextColor(0, 85, 164);
  doc.setFontSize(14);
  doc.text(`${priceInfo.totalAfterDiscount}€`, 120, finalY, { align: "right" });
  
  // Payment information
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.text("Caparra (30%):", 60, finalY + 10, { align: "right" });
  doc.text(`${priceInfo.deposit}€`, 120, finalY + 10, { align: "right" });
  
  doc.text("Cauzione (restituibile):", 60, finalY + 20, { align: "right" });
  doc.text("200€", 120, finalY + 20, { align: "right" });
  
  // --- Footer with terms ---
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Termini e condizioni", 15, finalY + 40);
  doc.setFontSize(8);
  doc.text("- Il presente preventivo è valido per 7 giorni dalla data di emissione.", 15, finalY + 45);
  doc.text("- La caparra confirmatoria dovrà essere versata entro 3 giorni dalla prenotazione.", 15, finalY + 50);
  doc.text("- Il saldo dovrà essere versato all'arrivo in struttura.", 15, finalY + 55);
  doc.text("- La cauzione verrà restituita al termine del soggiorno previa verifica dell'appartamento.", 15, finalY + 60);
  
  // --- Contact info ---
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("Villa MareBlu - Via del Mare 123, 12345 Marina di Esempio (IT)", 105, 280, { align: "center" });
  doc.text("Tel: +39 123 4567890 - Email: info@villamareblu.it - www.villamareblu.it", 105, 285, { align: "center" });
  
  return doc;
};

// Helper function to initiate the download of the PDF
export const downloadPDF = (
  formValues: FormValues,
  apartments: Apartment[],
  clientName?: string
): void => {
  const doc = generateQuotePDF(formValues, apartments, clientName);
  
  // Generate filename
  const today = format(new Date(), "yyyyMMdd");
  const safeName = clientName ? 
    clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 
    "cliente";
  
  // Save the PDF
  doc.save(`Preventivo_VillaMareBlu_${safeName}_${today}.pdf`);
};
