
import { startOfWeek, addWeeks, format } from 'date-fns';

export const getWeeksForYear = (year: number): { start: Date; end: Date }[] => {
  const weeks: { start: Date; end: Date }[] = [];
  const startOfYear = new Date(year, 0, 1);
  let currentWeek = startOfWeek(startOfYear, { weekStartsOn: 1 });
  
  while (currentWeek.getFullYear() <= year) {
    const weekEnd = new Date(currentWeek);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    weeks.push({
      start: new Date(currentWeek),
      end: weekEnd
    });
    
    currentWeek = addWeeks(currentWeek, 1);
    
    if (currentWeek.getFullYear() > year && weeks.length >= 52) {
      break;
    }
  }
  
  return weeks;
};

export const get2025PriceData = () => {
  return [
    { date: "2025-06-02", prices: { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 } },
    { date: "2025-06-09", prices: { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 } },
    { date: "2025-06-16", prices: { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 } },
    { date: "2025-06-23", prices: { "appartamento-1": 400, "appartamento-2": 500, "appartamento-3": 350, "appartamento-4": 375 } },
    { date: "2025-06-30", prices: { "appartamento-1": 475, "appartamento-2": 575, "appartamento-3": 425, "appartamento-4": 450 } },
    { date: "2025-07-07", prices: { "appartamento-1": 475, "appartamento-2": 575, "appartamento-3": 425, "appartamento-4": 450 } },
    { date: "2025-07-14", prices: { "appartamento-1": 475, "appartamento-2": 575, "appartamento-3": 425, "appartamento-4": 450 } },
    { date: "2025-07-21", prices: { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 665, "appartamento-4": 700 } },
    { date: "2025-07-28", prices: { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 665, "appartamento-4": 700 } },
    { date: "2025-08-04", prices: { "appartamento-1": 1150, "appartamento-2": 1250, "appartamento-3": 1075, "appartamento-4": 1100 } },
    { date: "2025-08-11", prices: { "appartamento-1": 1150, "appartamento-2": 1250, "appartamento-3": 1075, "appartamento-4": 1100 } },
    { date: "2025-08-18", prices: { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 675, "appartamento-4": 700 } },
    { date: "2025-08-25", prices: { "appartamento-1": 750, "appartamento-2": 850, "appartamento-3": 675, "appartamento-4": 700 } },
    { date: "2025-09-01", prices: { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 } },
    { date: "2025-09-08", prices: { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 } },
    { date: "2025-09-15", prices: { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 } },
    { date: "2025-09-22", prices: { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 } },
    { date: "2025-09-29", prices: { "appartamento-1": 500, "appartamento-2": 600, "appartamento-3": 425, "appartamento-4": 450 } },
  ];
};
