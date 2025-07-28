import { format, addDays, startOfWeek, addWeeks } from 'date-fns';

/**
 * Utility per generare calendari stagionali consistenti
 */

export interface SeasonWeek {
  start: Date;
  end: Date;
  startStr: string;
  weekNumber: number;
}

/**
 * Genera le settimane della stagione per un anno specifico
 * La stagione va sempre dal primo sabato di giugno all'ultimo sabato di settembre
 */
export function generateSeasonWeeks(year: number): SeasonWeek[] {
  const weeks: SeasonWeek[] = [];
  
  // Trova il primo sabato di giugno
  const firstJune = new Date(year, 5, 1); // 1 giugno
  const firstSaturday = startOfWeek(firstJune, { weekStartsOn: 6 }); // 6 = sabato
  
  // Se il primo sabato è prima del 1 giugno, prendi il sabato successivo
  const seasonStart = firstSaturday < firstJune ? addWeeks(firstSaturday, 1) : firstSaturday;
  
  // Trova l'ultimo sabato di settembre
  const lastSeptember = new Date(year, 8, 30); // 30 settembre
  const lastSaturday = startOfWeek(lastSeptember, { weekStartsOn: 6 });
  
  let currentWeek = seasonStart;
  let weekNumber = 1;
  
  while (currentWeek <= lastSaturday) {
    const weekEnd = addDays(currentWeek, 6); // Venerdì
    
    weeks.push({
      start: new Date(currentWeek),
      end: weekEnd,
      startStr: format(currentWeek, 'yyyy-MM-dd'),
      weekNumber
    });
    
    currentWeek = addWeeks(currentWeek, 1);
    weekNumber++;
  }
  
  return weeks;
}

/**
 * Verifica se una data cade all'interno della stagione
 */
export function isInSeason(date: Date, year: number): boolean {
  const weeks = generateSeasonWeeks(year);
  if (weeks.length === 0) return false;
  
  const checkDate = new Date(date);
  const firstWeek = weeks[0].start;
  const lastWeek = addDays(weeks[weeks.length - 1].start, 6);
  
  return checkDate >= firstWeek && checkDate <= lastWeek;
}

/**
 * Trova la settimana che contiene una data specifica
 */
export function findWeekForDate(date: Date, year: number): SeasonWeek | null {
  const weeks = generateSeasonWeeks(year);
  
  for (const week of weeks) {
    if (date >= week.start && date <= week.end) {
      return week;
    }
  }
  
  return null;
}

/**
 * Prezzi di default per il 2025 (corretti e verificati)
 */
export const DEFAULT_2025_PRICES = {
  // Giugno - prezzi base
  "2025-06-07": { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 },
  "2025-06-14": { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 },
  "2025-06-21": { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 },
  "2025-06-28": { "appartamento-1": 475, "appartamento-2": 575, "appartamento-3": 425, "appartamento-4": 450 },
  
  // Luglio - alta stagione
  "2025-07-05": { "appartamento-1": 475, "appartamento-2": 575, "appartamento-3": 425, "appartamento-4": 450 },
  "2025-07-12": { "appartamento-1": 475, "appartamento-2": 575, "appartamento-3": 425, "appartamento-4": 450 },
  "2025-07-19": { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 665, "appartamento-4": 700 },
  "2025-07-26": { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 665, "appartamento-4": 700 },
  
  // Agosto - picco stagione
  "2025-08-02": { "appartamento-1": 1150, "appartamento-2": 1250, "appartamento-3": 1075, "appartamento-4": 1100 },
  "2025-08-09": { "appartamento-1": 1150, "appartamento-2": 1250, "appartamento-3": 1075, "appartamento-4": 1100 },
  "2025-08-16": { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 675, "appartamento-4": 700 },
  "2025-08-23": { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 675, "appartamento-4": 700 },
  "2025-08-30": { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 },
  
  // Settembre - fine stagione
  "2025-09-06": { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 },
  "2025-09-13": { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 },
  "2025-09-20": { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 },
  "2025-09-27": { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 }
};