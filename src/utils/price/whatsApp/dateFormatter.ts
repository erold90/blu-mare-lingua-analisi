
import { format } from "date-fns";
import { it } from 'date-fns/locale';

/**
 * Calcola settimane e notti extra da un numero totale di notti
 */
const calculateWeeksAndExtraNights = (totalNights: number): { weeks: number; extraNights: number } => {
  const weeks = Math.floor(totalNights / 7);
  const extraNights = totalNights % 7;
  return { weeks, extraNights };
};

/**
 * Formatta la durata del soggiorno con settimane e notti extra
 */
const formatDuration = (totalNights: number): string => {
  const { weeks, extraNights } = calculateWeeksAndExtraNights(totalNights);
  
  if (weeks === 0) {
    return `${totalNights} ${totalNights === 1 ? 'notte' : 'notti'}`;
  }
  
  if (extraNights === 0) {
    return `${totalNights} notti (${weeks} ${weeks === 1 ? 'settimana' : 'settimane'})`;
  }
  
  return `${totalNights} notti (${weeks} ${weeks === 1 ? 'settimana' : 'settimane'} + ${extraNights} ${extraNights === 1 ? 'notte' : 'notti'})`;
};

/**
 * Formats the date section of the WhatsApp message
 */
export const formatDateSection = (checkIn: Date, checkOut: Date, nights: number, weeks: number): string => {
  const formattedCheckIn = format(checkIn, "EEEE d MMMM yyyy", { locale: it });
  const formattedCheckOut = format(checkOut, "EEEE d MMMM yyyy", { locale: it });
  
  let section = `Date soggiorno:\n`;
  section += `Check-in: ${formattedCheckIn}\n`;
  section += `Check-out: ${formattedCheckOut}\n`;
  section += `Durata: ${formatDuration(nights)}\n\n`;
  
  return section;
};
