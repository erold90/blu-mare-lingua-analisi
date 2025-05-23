
import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface YearSelectorProps {
  years: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({ 
  years, 
  selectedYear, 
  onYearChange 
}) => {
  return (
    <div className="pb-2">
      <Tabs 
        defaultValue={selectedYear.toString()} 
        value={selectedYear.toString()} 
        onValueChange={(value) => onYearChange(parseInt(value))}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
          {years.map(year => (
            <TabsTrigger key={year} value={year.toString()}>
              {year}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default YearSelector;
