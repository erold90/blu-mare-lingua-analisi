
import { addWeeks, format, startOfWeek } from "date-fns";
import { it } from "date-fns/locale";

export interface WeekInfo {
  start: Date;
  end: Date;
  startStr: string;
}

/**
 * Get all weeks for a given season year
 * @param year The year to get weeks for (defaults to 2025)
 * @returns Array of week objects with start and end dates
 */
export const getSeasonWeeks = (year: number = 2025): WeekInfo[] => {
  const weeks: WeekInfo[] = [];
  
  // Define season start date (first Monday of June)
  const seasonStartDate = new Date(year, 5, 1); // June 1st
  const dayOfWeek = seasonStartDate.getDay();
  const daysUntilMonday = dayOfWeek === 1 ? 0 : (dayOfWeek === 0 ? 1 : 8 - dayOfWeek);
  
  // Adjust to first Monday
  seasonStartDate.setDate(seasonStartDate.getDate() + daysUntilMonday);
  
  // Generate weeks until end of September
  let currentWeekStart = new Date(seasonStartDate);
  const seasonEndDate = new Date(year, 9, 7); // October 7th (to include the last week of September)
  
  while (currentWeekStart < seasonEndDate) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    weeks.push({
      start: new Date(currentWeekStart),
      end: new Date(weekEnd),
      startStr: format(currentWeekStart, 'yyyy-MM-dd')
    });
    
    currentWeekStart = addWeeks(currentWeekStart, 1);
  }
  
  return weeks;
};

/**
 * Format a week range as a string
 * @param week Week object with start and end dates
 * @returns Formatted string like "12 - 18 Giu"
 */
export const formatWeekRange = (week: WeekInfo): string => {
  return `${format(week.start, "d", { locale: it })} - ${format(week.end, "d MMM", { locale: it })}`;
};
