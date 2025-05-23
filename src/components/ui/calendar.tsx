
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { it } from 'date-fns/locale';
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-6 pointer-events-auto w-full", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-6 sm:space-x-6 sm:space-y-0",
        month: "space-y-6 w-full",
        caption: "flex justify-center pt-3 relative items-center px-12",
        caption_label: "text-lg font-semibold md:text-xl text-primary",
        nav: "space-x-2 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-10 w-10 md:h-12 md:w-12 bg-white border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition-all duration-200"
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse space-y-3 mt-4",
        head_row: "flex w-full",
        head_cell: "text-muted-foreground rounded-md w-full flex-1 font-semibold text-base md:text-lg py-3 text-center",
        row: "flex w-full mt-3",
        cell: "h-14 w-full flex-1 text-center text-base p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-14 w-full flex-1 p-0 font-medium text-base aria-selected:opacity-100 hover:bg-primary/10 transition-colors duration-200"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md shadow-lg",
        day_today: "bg-accent text-accent-foreground font-bold border-2 border-primary/30",
        day_outside: "day-outside text-muted-foreground/50 opacity-40 aria-selected:bg-accent/30 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed hover:bg-transparent",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />,
        IconRight: () => <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />,
      }}
      locale={it}
      weekStartsOn={1}
      formatters={{
        formatWeekdayName: (day) => format(day, 'EEEEEE', { locale: it }).toUpperCase(),
        formatCaption: (date) => format(date, 'MMMM yyyy', { locale: it }),
      }}
      fixedWeeks={true}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
