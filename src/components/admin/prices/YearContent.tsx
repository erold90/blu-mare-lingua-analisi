
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import PriceTable from "./PriceTable";
import MobilePriceList from "./MobilePriceList";

interface YearContentProps {
  year: number;
  weeks: { start: Date; end: Date }[];
  getPriceForWeek: (apartmentId: string, weekStart: Date) => number;
  handlePriceChange: (apartmentId: string, weekStartStr: string, value: string) => void;
}

const YearContent: React.FC<YearContentProps> = ({
  year,
  weeks,
  getPriceForWeek,
  handlePriceChange,
}) => {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prezzi Settimanali {year}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto">
        <div className="text-sm text-muted-foreground mb-4">
          <p>I prezzi sono da intendersi per settimana (da sabato a sabato).</p>
          <p>Anche per soggiorni più brevi verrà applicato il prezzo settimanale.</p>
        </div>
        
        {isMobile ? (
          <MobilePriceList 
            weeks={weeks}
            getPriceForWeek={getPriceForWeek}
            handlePriceChange={handlePriceChange}
          />
        ) : (
          <PriceTable 
            weeks={weeks}
            getPriceForWeek={getPriceForWeek}
            handlePriceChange={handlePriceChange}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default YearContent;
