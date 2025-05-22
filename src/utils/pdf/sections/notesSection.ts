
import { jsPDF } from "jspdf";
import { addSectionHeader } from "../formatUtils";

// Generate notes section
export const generateNotesSection = (doc: jsPDF, yStart: number) => {
  let y = yStart + 15;
  
  // Add elegant section header
  y = addSectionHeader(doc, "TERMINI E CONDIZIONI", y);
  y += 10;
  
  // Add styled notes box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(20, y, doc.internal.pageSize.getWidth() - 40, 70, 3, 3, 'FD');
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const notes = [
    "• Il presente preventivo ha validità di 7 giorni dalla data di emissione.",
    "• Per confermare la prenotazione è richiesto un acconto del 30% del totale tramite bonifico bancario.",
    "• Il saldo dovrà essere effettuato all'arrivo in contanti o con carta di credito.",
    "• La cauzione di €200 sarà restituita a fine soggiorno previa verifica dell'appartamento.",
    "• In caso di cancellazione entro 30 giorni dall'arrivo, l'acconto sarà rimborsato al 50%.",
    "• In caso di cancellazione entro 15 giorni dall'arrivo, l'acconto non sarà rimborsato.",
    "• Orario di check-in: dalle 15:00 alle 19:00. Check-in tardivi su richiesta.",
    "• Orario di check-out: entro le 10:00 del giorno di partenza.",
    "• È vietato fumare all'interno dell'appartamento."
  ];
  
  // Break notes into two columns
  const notesPerColumn = Math.ceil(notes.length / 2);
  const colWidth = (doc.internal.pageSize.getWidth() - 50) / 2;
  
  // First column
  let firstColY = y + 10;
  for (let i = 0; i < notesPerColumn; i++) {
    doc.text(notes[i], 25, firstColY);
    firstColY += 7;
  }
  
  // Second column
  let secondColY = y + 10;
  for (let i = notesPerColumn; i < notes.length; i++) {
    doc.text(notes[i], 25 + colWidth, secondColY);
    secondColY += 7;
  }
  
  // Add thank you note at the bottom
  y += 80;
  doc.setFont("helvetica", "italic");
  doc.setTextColor(47, 84, 150);
  const pageWidth = doc.internal.pageSize.getWidth();
  const thanksNote = "Grazie per aver scelto i nostri appartamenti per il vostro soggiorno in Toscana. Vi aspettiamo!";
  const thanksLines = doc.splitTextToSize(thanksNote, pageWidth - 40);
  doc.text(thanksLines, 20, y);
  doc.setTextColor(0, 0, 0);
  
  return y + 10;
};
