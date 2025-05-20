
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { QuoteFormData } from './quoteFormSchema';
import { PriceCalculation } from './quoteCalculator';
import { Apartment } from '@/data/apartments';

// Extend jsPDF to include the autoTable plugin with TypeScript
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
    lastAutoTable: {
      finalY: number;
    };
  }
}

/**
 * Generate and download a PDF quote based on the form data and price calculation
 */
export const downloadPDF = (
  formData: QuoteFormData,
  priceCalculation: PriceCalculation,
  apartments?: Apartment[]
) => {
  // Initialize PDF document
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Add header with logo (you would need to add a real logo)
  doc.setFontSize(24);
  doc.setTextColor(33, 33, 33);
  doc.text('Villa MareBlu', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Preventivo di Soggiorno', 105, 30, { align: 'center' });
  
  // Add date
  const today = format(new Date(), 'dd MMMM yyyy', { locale: it });
  doc.setFontSize(10);
  doc.text(`Data preventivo: ${today}`, 20, 40);
  
  // Customer details
  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text('Dati Cliente', 20, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  
  const customerName = `${formData.firstName || ''} ${formData.lastName || ''}`;
  doc.text(`Nome: ${customerName}`, 20, 60);
  doc.text(`Email: ${formData.email || ''}`, 20, 65);
  doc.text(`Telefono: ${formData.phone || ''}`, 20, 70);
  
  // Booking details
  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text('Dettagli Soggiorno', 20, 80);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  
  let checkInDate = 'Non specificata';
  let checkOutDate = 'Non specificata';
  
  if (formData.startDate && formData.endDate) {
    checkInDate = format(new Date(formData.startDate), 'dd MMMM yyyy', { locale: it });
    checkOutDate = format(new Date(formData.endDate), 'dd MMMM yyyy', { locale: it });
  }
  
  doc.text(`Check-in: ${checkInDate}`, 20, 90);
  doc.text(`Check-out: ${checkOutDate}`, 20, 95);
  doc.text(`Numero ospiti: ${priceCalculation.guests || 0}`, 20, 100);
  
  // Apartment details
  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text('Alloggio', 20, 110);
  
  // Create a starting y position for tables
  let yPosition = 120;
  
  if (apartments && apartments.length > 0) {
    // Use autoTable for apartments
    const apartmentsTableData = apartments.map(apt => [
      apt.name,
      `${apt.bedrooms} camere`,
      `${apt.maxGuests} ospiti max`,
      `${apt.pricePerNight}€ / notte`
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Nome', 'Camere', 'Ospiti', 'Prezzo']],
      body: apartmentsTableData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;
  }
  
  // Group details if applicable
  if (formData.isGroupBooking && formData.selectedGroup) {
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Dettagli Gruppo', 20, yPosition);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    doc.text(`Tipo di gruppo: ${formData.selectedGroup.name || ''}`, 20, yPosition + 10);
    doc.text(`Numero totale ospiti: ${formData.selectedGroup.totalGuests || 0}`, 20, yPosition + 15);
    doc.text(`Adulti: ${formData.selectedGroup.adults || 0}`, 20, yPosition + 20);
    doc.text(`Bambini: ${formData.selectedGroup.children || 0}`, 20, yPosition + 25);
    
    yPosition = yPosition + 35;
  }
  
  // Services if applicable
  if (formData.selectedServices && formData.selectedServices.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Servizi Selezionati', 20, yPosition);
    
    // Use autoTable for services
    const servicesTableData = formData.selectedServices.map(service => [
      service.name,
      service.description,
      `${service.price}€`
    ]);
    
    doc.autoTable({
      startY: yPosition + 10,
      head: [['Servizio', 'Descrizione', 'Prezzo']],
      body: servicesTableData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    yPosition = doc.lastAutoTable.finalY + 10;
  }
  
  // Price details
  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text('Riepilogo Costi', 20, yPosition);
  
  // Use autoTable for price breakdown
  const priceTableData = [
    ['Soggiorno', `${priceCalculation.basePrice}€`],
    ['Pulizie finali', `${priceCalculation.cleaningFee || 0}€`],
    ['Servizi extra', `${priceCalculation.extras || 0}€`],
    ['Tassa di soggiorno', `${priceCalculation.touristTax || 0}€`],
    ['Sconto applicato', `${priceCalculation.discount || 0}€`],
    ['TOTALE', `${priceCalculation.totalPrice || 0}€`]
  ];
  
  doc.autoTable({
    startY: yPosition + 10,
    body: priceTableData,
    theme: 'plain',
    styles: {
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' }
    }
  });
  
  yPosition = doc.lastAutoTable.finalY + 10;
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Villa MareBlu - Via Marco Polo 112, Patù (LE), Salento, Puglia', 105, 280, { align: 'center' });
  
  // Save the PDF
  doc.save('Villa-MareBlu-Preventivo.pdf');
};
