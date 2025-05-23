
import { format } from 'date-fns';

export interface WeekInfo {
  start: Date;
  end: Date;
  startStr: string;
  label: string;
}

/**
 * Generate the season weeks for a specific year
 * @param year The year to generate weeks for
 * @returns Array of week information
 */
export const getSeasonWeeks = (year: number = 2025): WeekInfo[] => {
  const weeks: WeekInfo[] = [];
  const seasonStart = new Date(year, 5, 2); // June 2nd
  let currentWeek = new Date(seasonStart);
  
  while (currentWeek <= new Date(year, 8, 29)) { // until September 29th
    const weekEnd = new Date(currentWeek);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    weeks.push({
      start: new Date(currentWeek),
      end: weekEnd,
      startStr: format(currentWeek, 'yyyy-MM-dd'),
      label: format(currentWeek, 'dd/MM')
    });
    
    currentWeek.setDate(currentWeek.getDate() + 7);
  }
  
  console.log(`Generated season weeks: ${weeks.length} weeks`);
  return weeks;
};
