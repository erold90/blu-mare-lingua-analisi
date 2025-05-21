
import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apartments } from "@/data/apartments";

interface MobilePriceListProps {
  weeks: { start: Date; end: Date }[];
  getPriceForWeek: (apartmentId: string, weekStart: Date) => number;
  handlePriceChange: (apartmentId: string, weekStartStr: string, value: string) => void;
}

const MobilePriceList: React.FC<MobilePriceListProps> = ({
  weeks,
  getPriceForWeek,
  handlePriceChange,
}) => {
  // Debug log to check if props are received correctly
  React.useEffect(() => {
    console.log("MobilePriceList - Weeks:", weeks.length);
    if (weeks.length > 0) {
      const sample = getPriceForWeek(apartments[0].id, weeks[0].start);
      console.log("Sample price for first week:", sample);
    }
  }, [weeks, getPriceForWeek]);
  
  return (
    <div className="space-y-8">
      {apartments.map(apartment => (
        <div key={apartment.id} className="border rounded-lg p-4">
          <h3 className="font-bold mb-2">{apartment.name}</h3>
          <div className="space-y-3">
            {weeks.map((week, idx) => {
              // Get the price for this apartment and week
              const price = getPriceForWeek(apartment.id, week.start);
              
              return (
                <div key={idx} className="grid grid-cols-2 gap-2 items-center">
                  <Label className="text-xs">
                    {format(week.start, "d MMM", { locale: it })} - {format(week.end, "d MMM", { locale: it })}
                  </Label>
                  <div className="flex items-center">
                    <Input
                      type="number"
                      min="0"
                      value={price || 0}
                      onChange={(e) => handlePriceChange(
                        apartment.id, 
                        week.start.toISOString(), 
                        e.target.value
                      )}
                      className="w-20 text-right"
                    />
                    <span className="ml-1">€</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobilePriceList;
