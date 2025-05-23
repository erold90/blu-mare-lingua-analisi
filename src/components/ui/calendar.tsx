
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
      className={cn("p-2 md:p-6 pointer-events-auto w-full", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-1 md:pt-3 relative items-center px-8 md:px-12",
        caption_label: "text-lg md:text-xl font-semibold text-primary",
        nav: "space-x-1 md:space-x-2 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 md:h-10 md:w-10 bg-white border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition-all duration-200"
        ),
        nav_button_previous: "absolute left-1 md:left-2",
        nav_button_next: "absolute right-1 md:right-2",
        table: "w-full border-collapse space-y-1 md:space-y-3 mt-2 md:mt-4",
        head_row: "flex w-full",
        head_cell: "text-muted-foreground rounded-md w-full flex-1 font-semibold text-xs md:text-base py-2 md:py-3 text-center",
        row: "flex w-full mt-1 md:mt-3",
        cell: "h-8 md:h-14 w-full flex-1 text-center text-sm md:text-base p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 md:h-14 w-full flex-1 p-0 font-medium text-xs md:text-base aria-selected:opacity-100 hover:bg-primary/10 transition-colors duration-200"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-primary text-white hover:bg-primary/90 hover:text-white focus:bg-primary focus:text-white rounded-md shadow-lg font-bold border-2 border-primary",
        day_today: "bg-accent text-accent-foreground font-bold border-2 border-primary/30",
        day_outside: "day-outside text-muted-foreground/50 opacity-40 aria-selected:bg-accent/30 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed hover:bg-transparent",
        day_range_middle: "aria-selected:bg-primary/15 aria-selected:text-black aria-selected:font-semibold rounded-none border-y-2 border-primary/20",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />,
        IconRight: () => <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />,
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
