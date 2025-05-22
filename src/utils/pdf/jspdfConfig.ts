
// Questo file si assicura che jspdf-autotable sia correttamente caricato e configurato

import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Esporta una funzione per verificare se autoTable è disponibile
export const verifyAutoTable = (doc: jsPDF): boolean => {
  return typeof doc.autoTable === 'function';
};

// Funzione per garantire che autoTable sia disponibile
export const ensureAutoTable = (): void => {
  const testDoc = new jsPDF();
  if (!verifyAutoTable(testDoc)) {
    console.error("autoTable non è disponibile. Controllare l'importazione di jspdf-autotable.");
  } else {
    console.log("jspdf-autotable è stato caricato correttamente.");
  }
};

// Esegui la verifica all'importazione
ensureAutoTable();
