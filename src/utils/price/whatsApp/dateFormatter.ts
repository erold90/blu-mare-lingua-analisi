
import { format } from "date-fns";
import { it } from 'date-fns/locale';

/**
 * Formats the date section of the WhatsApp message
 */
export const formatDateSection = (checkIn: Date, checkOut: Date, nights: number, weeks: number): string => {
  const formattedCheckIn = format(checkIn, "EEEE d MMMM yyyy", { locale: it });
  const formattedCheckOut = format(checkOut, "EEEE d MMMM yyyy", { locale: it });
  
  let section = `*📅 Date soggiorno:*\n`;
  section += `Check-in: ${formattedCheckIn}\n`;
  section += `Check-out: ${formattedCheckOut}\n`;
  section += `Durata: *${nights} notti* (${weeks} ${weeks === 1 ? 'settimana' : 'settimane'})\n\n`;
  
  return section;
};
