
import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apartments } from "@/data/apartments";
import EditPriceModal from "./EditPriceModal";

interface PriceTableProps {
  weeks: { start: Date; end: Date }[];
  getPriceForWeek: (apartmentId: string, weekStart: Date) => number;
  handlePriceChange: (apartmentId: string, weekStartStr: string, value: string) => void;
}

const PriceTable: React.FC<PriceTableProps> = ({
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
  
  const handleSavePrice = (price: number) => {
    if (editingPrice) {
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
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Settimana</TableHead>
            {apartments.map(apartment => (
              <TableHead key={apartment.id}>
                {apartment.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {weeks.map((week, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">
                {format(week.start, "d MMM", { locale: it })} - {format(week.end, "d MMM", { locale: it })}
              </TableCell>
              {apartments.map(apartment => {
                // Get the price for this apartment and week
                const price = getPriceForWeek(apartment.id, week.start);
                
                return (
                  <TableCell key={apartment.id}>
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
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
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

export default PriceTable;
