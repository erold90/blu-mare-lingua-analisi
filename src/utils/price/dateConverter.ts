
/**
 * Utilities per conversione sicura delle date
 */

/**
 * Converti un valore Date o string in Date object
 */
export const toDateSafe = (date: Date | string | undefined): Date | null => {
  if (!date) return null;
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};

/**
 * Converti un valore Date o string in stringa ISO
 */
export const toISOStringSafe = (date: Date | string | undefined): string => {
  if (!date) return '';
  if (typeof date === 'string') return date;
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? '' : date.toISOString();
  }
  return '';
};

/**
 * Valida se una data è valida
 */
export const isValidDate = (date: any): boolean => {
  if (!date) return false;
  const dateObj = toDateSafe(date);
  return dateObj !== null && !isNaN(dateObj.getTime());
};
