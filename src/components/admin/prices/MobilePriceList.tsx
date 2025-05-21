
import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Apartment } from "@/data/apartments";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import PriceDialog from "./PriceDialog";

interface MobilePriceListProps {
  weeks: { start: Date; end: Date }[];
  getPriceForWeek: (apartmentId: string, weekStart: Date) => number;
  handlePriceChange: (apartmentId: string, weekStart: string, newPrice: number) => void;
  apartments: Apartment[];
}

const MobilePriceList: React.FC<MobilePriceListProps> = ({
  weeks,
  getPriceForWeek,
  handlePriceChange,
  apartments,
}) => {
  const [editingPrice, setEditingPrice] = React.useState<{
    apartmentId: string;
    apartmentName: string;
    weekStart: Date;
    weekEnd: Date;
    currentPrice: number;
  } | null>(null);
  
  const handleEditClick = (apartmentId: string, apartmentName: string, weekStart: Date, weekEnd: Date) => {
    const currentPrice = getPriceForWeek(apartmentId, weekStart);
    setEditingPrice({
      apartmentId,
      apartmentName,
      weekStart,
      weekEnd,
      currentPrice,
    });
  };
  
  const handleSavePrice = (newPrice: number) => {
    if (editingPrice) {
      handlePriceChange(
        editingPrice.apartmentId,
        editingPrice.weekStart.toISOString(),
        newPrice
      );
      setEditingPrice(null);
    }
  };
  
  // Group weeks by month
  const weeksByMonth = React.useMemo(() => {
    const grouped: { [key: string]: { label: string; weeks: typeof weeks } } = {};
    
    weeks.forEach(week => {
      const monthKey = format(week.start, "yyyy-MM");
      const monthLabel = format(week.start, "MMMM yyyy", { locale: it });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          label: monthLabel,
          weeks: []
        };
      }
      
      grouped[monthKey].weeks.push(week);
    });
    
    return Object.values(grouped);
  }, [weeks]);
  
  return (
    <>
      <Accordion type="single" collapsible className="w-full space-y-2">
        {apartments.map(apartment => (
          <AccordionItem 
            key={apartment.id}
            value={apartment.id}
            className="border rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <span className="font-medium">{apartment.name}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <div className="space-y-3 px-4">
                {weeksByMonth.map((monthGroup, monthIdx) => (
                  <div key={monthIdx} className="space-y-2">
                    <h4 className="font-semibold capitalize text-sm text-muted-foreground pt-2">
                      {monthGroup.label}
                    </h4>
                    
                    <div className="space-y-1.5">
                      {monthGroup.weeks.map((week, weekIdx) => {
                        const price = getPriceForWeek(apartment.id, week.start);
                        
                        return (
                          <div 
                            key={weekIdx} 
                            className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50"
                          >
                            <span className="text-sm">
                              {format(week.start, "d", { locale: it })} - {format(week.end, "d MMM", { locale: it })}
                            </span>
                            
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{price} €</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(apartment.id, apartment.name, week.start, week.end)}
                                title="Modifica prezzo"
                                className="h-7 w-7 p-0"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span className="sr-only">Modifica</span>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <PriceDialog
        isOpen={!!editingPrice}
        onClose={() => setEditingPrice(null)}
        onSave={handleSavePrice}
        apartmentName={editingPrice?.apartmentName || ""}
        weekStart={editingPrice?.weekStart || new Date()}
        weekEnd={editingPrice?.weekEnd || new Date()}
        currentPrice={editingPrice?.currentPrice || 0}
      />
    </>
  );
};

export default MobilePriceList;
