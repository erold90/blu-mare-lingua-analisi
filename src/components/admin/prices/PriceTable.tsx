
import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Apartment } from "@/data/apartments";
import PriceDialog from "./PriceDialog";

interface PriceTableProps {
  weeks: { start: Date; end: Date }[];
  getPriceForWeek: (apartmentId: string, weekStart: Date) => number;
  handlePriceChange: (apartmentId: string, weekStart: string, newPrice: number) => void;
  apartments: Apartment[];
}

const PriceTable: React.FC<PriceTableProps> = ({
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
  
  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table className="w-full">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[180px] font-medium">Settimana</TableHead>
              {apartments.map(apartment => (
                <TableHead key={apartment.id} className="font-medium">
                  {apartment.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeks.map((week, idx) => (
              <TableRow key={idx} className={idx % 2 === 0 ? "bg-muted/20" : ""}>
                <TableCell className="font-medium">
                  {format(week.start, "d MMM", { locale: it })} - {format(week.end, "d MMM", { locale: it })}
                </TableCell>
                {apartments.map(apartment => {
                  const price = getPriceForWeek(apartment.id, week.start);
                  return (
                    <TableCell key={apartment.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{price} €</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(apartment.id, apartment.name, week.start, week.end)}
                          title="Modifica prezzo"
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifica</span>
                        </Button>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <PriceDialog
        isOpen={!!editingPrice}
        onClose={() => setEditingPrice(null)}
        onSave={handleSavePrice}
        apartmentName={editingPrice?.apartmentName || ""}
        weekStart={editingPrice?.weekStart}
        weekEnd={editingPrice?.weekEnd}
        currentPrice={editingPrice?.currentPrice || 0}
      />
    </>
  );
};

export default PriceTable;
