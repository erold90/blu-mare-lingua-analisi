
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import PriceTable from "./PriceTable";
import MobilePriceList from "./MobilePriceList";
import { apartments } from "@/data/apartments";

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
  
  // Wrapper function to convert string value to number before passing it on
  const handlePriceChangeWrapper = (apartmentId: string, weekStartStr: string, newPrice: number) => {
    handlePriceChange(apartmentId, weekStartStr, newPrice.toString());
  };

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
            handlePriceChange={handlePriceChangeWrapper}
            apartments={apartments}
          />
        ) : (
          <PriceTable 
            weeks={weeks}
            getPriceForWeek={getPriceForWeek}
            handlePriceChange={handlePriceChangeWrapper}
            apartments={apartments}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default YearContent;
