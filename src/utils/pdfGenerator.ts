
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPrice, PriceCalculation } from "@/utils/quoteCalculator";
import { Apartment } from "@/data/apartments";

// Register autoTable to jsPDF
jsPDF.API.autoTable = autoTable;

// Funzione per creare il PDF del preventivo
export const downloadPDF = (formData: FormValues, apartments: Apartment[], clientName?: string) => {
  // Troviamo l'appartamento selezionato
  const selectedApt = apartments.find(apt => apt.id === formData.selectedApartment);
  
  if (!selectedApt) {
    console.error("Nessun appartamento selezionato");
    return;
  }
  
  // Calcolo del prezzo totale
  const priceCalculation = calculateTotalPrice(formData, apartments);
  
  // Creo un nuovo documento PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Funzione di utilità per aggiungere testo centrato
  const addCenteredText = (text: string, y: number, fontSize = 12) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
  };
  
  // Funzione di utilità per aggiungere testo a destra
  const addRightAlignedText = (text: string, y: number, fontSize = 12) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
    const x = pageWidth - textWidth - 20; // 20 è il margine destro
    doc.text(text, x, y);
  };
  
  // Dati di intestazione
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  addCenteredText("Preventivo Soggiorno", 20, 22);
  
  // Dati cliente
  const today = new Date();
  const formattedDate = format(today, "dd MMMM yyyy", { locale: it });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Data preventivo: ${formattedDate}`, 20, 30);
  doc.text(`Rif: ${clientName || formData.name || "Cliente"}`, 20, 35);
  
  // Dati soggiorno
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Dettagli del Soggiorno", 20, 45);
  
  // Linea separatrice
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(20, 47, pageWidth - 20, 47);
  
  // Dettagli
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  let y = 55;
  
  // Date di check-in e check-out
  if (formData.checkIn && formData.checkOut) {
    const checkIn = format(new Date(formData.checkIn), "dd MMMM yyyy", { locale: it });
    const checkOut = format(new Date(formData.checkOut), "dd MMMM yyyy", { locale: it });
    doc.text(`Check-in: ${checkIn}`, 20, y);
    y += 7;
    doc.text(`Check-out: ${checkOut}`, 20, y);
    y += 7;
    
    // Calcolo durata soggiorno
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    doc.text(`Durata del soggiorno: ${diffDays} notti`, 20, y);
    y += 10;
  }
  
  // Numero di ospiti
  const totalGuests = formData.adults + formData.children;
  doc.text(`Numero totale di ospiti: ${totalGuests}`, 20, y);
  y += 7;
  doc.text(`- Adulti: ${formData.adults}`, 30, y);
  y += 7;
  doc.text(`- Bambini: ${formData.children}`, 30, y);
  y += 10;
  
  // Dettagli dell'appartamento selezionato
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Appartamento Selezionato", 20, y);
  y += 2;
  
  // Linea separatrice
  doc.line(20, y, pageWidth - 20, y);
  y += 8;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${selectedApt.name}`, 20, y);
  y += 7;
  
  if (selectedApt.description) {
    const descLines = doc.splitTextToSize(selectedApt.description, pageWidth - 40);
    doc.text(descLines, 20, y);
    y += descLines.length * 7 + 3;
  }
  
  doc.text(`Capacità massima: ${selectedApt.capacity} persone`, 20, y);
  y += 7;
  
  // Riepilogo costi
  y += 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Dettaglio Costi", 20, y);
  y += 2;
  
  // Linea separatrice
  doc.line(20, y, pageWidth - 20, y);
  y += 10;
  
  // Tabella dei costi
  const tableBody = [];
  
  // Costo base dell'appartamento
  tableBody.push(["Costo base appartamento", "", `€ ${priceCalculation.basePrice.toFixed(2)}`]);
  
  // Extra selezionati
  if (formData.linenOption) {
    let linenText;
    switch(formData.linenOption) {
      case "extra":
        linenText = "Biancheria Extra";
        break;
      case "deluxe":
        linenText = "Biancheria Deluxe";
        break;
      default:
        linenText = "Biancheria Standard";
    }
    tableBody.push([linenText, "", `€ ${priceCalculation.extras.toFixed(2)}`]);
  }
  
  // Pulizia finale
  tableBody.push(["Pulizia finale", "", `€ ${priceCalculation.cleaningFee.toFixed(2)}`]);
  
  // Tassa di soggiorno
  tableBody.push(["Tassa di soggiorno", "", `€ ${priceCalculation.touristTax.toFixed(2)}`]);
  
  // Sconto (se applicato)
  if (priceCalculation.discount > 0) {
    tableBody.push(["Sconto", "", `- € ${priceCalculation.discount.toFixed(2)}`]);
  }
  
  // Totale
  tableBody.push(["Totale", "", `€ ${priceCalculation.totalPrice.toFixed(2)}`]);
  
  // Aggiungo la tabella al PDF
  doc.autoTable({
    startY: y,
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
  
  // Note aggiuntive
  y = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(10);
  doc.text("Note:", 20, y);
  y += 5;
  
  const notes = "Il presente preventivo ha validità di 7 giorni dalla data di emissione.";
  const noteLines = doc.splitTextToSize(notes, pageWidth - 40);
  doc.text(noteLines, 20, y);
  y += noteLines.length * 5 + 10;
  
  doc.text("Per confermare la prenotazione è richiesto un acconto del 30% del totale.", 20, y);
  y += 5;
  doc.text("Il saldo dovrà essere effettuato all'arrivo.", 20, y);
  
  // Piè di pagina
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Pagina ${i} di ${pageCount}`, pageWidth - 40, doc.internal.pageSize.height - 10);
  }
  
  // Salvo il PDF
  const fileName = `Preventivo_${clientName || "Cliente"}_${format(today, "yyyyMMdd")}.pdf`;
  doc.save(fileName);
  
  return fileName;
};
