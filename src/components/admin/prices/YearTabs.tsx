
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import YearContent from "./YearContent";

interface YearTabsProps {
  years: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  weeks: { start: Date; end: Date }[];
  getPriceForWeek: (apartmentId: string, weekStart: Date) => number;
  handlePriceChange: (apartmentId: string, weekStartStr: string, value: string) => void;
}

const YearTabs: React.FC<YearTabsProps> = ({
  years,
  selectedYear,
  onYearChange,
  weeks,
  getPriceForWeek,
  handlePriceChange,
}) => {
  return (
    <Tabs defaultValue={selectedYear.toString()} value={selectedYear.toString()} onValueChange={(value) => onYearChange(parseInt(value))}>
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          {years.map(year => (
            <TabsTrigger 
              key={year}
              value={year.toString()}
            >
              {year}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      
      {years.map(year => (
        <TabsContent key={year} value={year.toString()} className="mt-6 space-y-6">
          <YearContent
            year={year}
            weeks={weeks}
            getPriceForWeek={getPriceForWeek}
            handlePriceChange={handlePriceChange}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default YearTabs;
