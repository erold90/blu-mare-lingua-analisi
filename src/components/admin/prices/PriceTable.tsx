
import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apartments } from "@/data/apartments";

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
  // Debug log
  React.useEffect(() => {
    console.log("PriceTable - Weeks:", weeks.length);
    if (weeks.length > 0 && apartments.length > 0) {
      const sample = getPriceForWeek(apartments[0].id, weeks[0].start);
      console.log(`Sample price for first apartment and week (${format(weeks[0].start, "yyyy-MM-dd")}):`, sample);
    }
  }, [weeks, getPriceForWeek]);
  
  return (
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
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PriceTable;
