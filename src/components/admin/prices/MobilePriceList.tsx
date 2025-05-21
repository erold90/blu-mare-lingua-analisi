
import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apartments } from "@/data/apartments";
import EditPriceModal from "./EditPriceModal";

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
  const [editingPrice, setEditingPrice] = React.useState<{
    apartmentId: string;
    apartmentName: string;
    weekStart: Date;
    weekEnd: Date;
    currentPrice: number;
  } | null>(null);
  
  // Debug logs to check prices
  React.useEffect(() => {
    console.log("MobilePriceList - Weeks:", weeks.length);
    if (apartments.length > 0 && weeks.length > 0) {
      const samplePrice = getPriceForWeek(apartments[0].id, weeks[0].start);
      console.log(`Sample price for ${apartments[0].name}, week ${format(weeks[0].start, "d MMM")}: ${samplePrice}€`);
    }
  }, [weeks, getPriceForWeek]);
  
  const handleEditClick = (apartmentId: string, apartmentName: string, weekStart: Date, weekEnd: Date) => {
    const currentPrice = getPriceForWeek(apartmentId, weekStart);
    console.log(`Editing price for ${apartmentName}, week of ${format(weekStart, "d MMM")}: ${currentPrice}€`);
    setEditingPrice({
      apartmentId,
      apartmentName,
      weekStart,
      weekEnd,
      currentPrice,
    });
  };
  
  const handleSavePrice = (price: number) => {
    if (editingPrice) {
      console.log(`Saving price: ${editingPrice.apartmentId}, ${format(editingPrice.weekStart, "yyyy-MM-dd")}, ${price}€`);
      handlePriceChange(
        editingPrice.apartmentId,
        editingPrice.weekStart.toISOString(),
        price.toString()
      );
    }
  };
  
  const closeModal = () => {
    setEditingPrice(null);
  };
  
  return (
    <>
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
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{price} €</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(apartment.id, apartment.name, week.start, week.end)}
                        title="Modifica prezzo"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {editingPrice && (
        <EditPriceModal
          isOpen={!!editingPrice}
          onClose={closeModal}
          onSave={handleSavePrice}
          apartmentName={editingPrice.apartmentName}
          weekStart={editingPrice.weekStart}
          weekEnd={editingPrice.weekEnd}
          currentPrice={editingPrice.currentPrice}
        />
      )}
    </>
  );
};

export default MobilePriceList;
