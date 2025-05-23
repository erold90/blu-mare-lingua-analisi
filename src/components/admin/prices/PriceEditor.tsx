
import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useSupabasePrices } from "@/hooks/useSupabasePrices";
import { apartments } from "@/data/apartments";
import PriceTable from "./PriceTable";
import MobilePriceList from "./MobilePriceList";

interface PriceEditorProps {
  year: number;
  weeks: { start: Date; end: Date }[];
  isMobile: boolean;
}

const PriceEditor: React.FC<PriceEditorProps> = ({ year, weeks, isMobile }) => {
  const { getPriceForWeek, updatePrice } = useSupabasePrices();
  
  const handlePriceChange = (apartmentId: string, weekStart: string, newPrice: number) => {
    updatePrice(apartmentId, weekStart, newPrice);
  };
  
  return isMobile ? (
    <MobilePriceList
      weeks={weeks}
      getPriceForWeek={getPriceForWeek}
      handlePriceChange={handlePriceChange}
      apartments={apartments}
    />
  ) : (
    <PriceTable
      weeks={weeks}
      getPriceForWeek={getPriceForWeek}
      handlePriceChange={handlePriceChange}
      apartments={apartments}
    />
  );
};

export default PriceEditor;
