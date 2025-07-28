
import React, { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Pencil, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUnifiedPrices } from "@/hooks/useUnifiedPrices";
import { apartments } from "@/data/apartments";
import { useIsMobile } from "@/hooks/use-mobile";
import { generateSeasonWeeks } from "@/utils/price/seasonCalendar";
import PriceDialog from "./PriceDialog";

const UnifiedPriceManager: React.FC = () => {
  const {
    prices,
    isLoading,
    currentYear,
    setCurrentYear,
    availableYears,
    updatePrice,
    getPriceForWeek
  } = useUnifiedPrices();

  const isMobile = useIsMobile();
  const [editingPrice, setEditingPrice] = useState<{
    apartmentId: string;
    apartmentName: string;
    weekStart: string;
    currentPrice: number;
  } | null>(null);

  // Usa la funzione centralizzata per generare le settimane
  const weeks = generateSeasonWeeks(currentYear);

  const handleEditClick = (apartmentId: string, apartmentName: string, weekStart: string) => {
    const currentPrice = getPriceForWeek(apartmentId, weekStart);
    setEditingPrice({
      apartmentId,
      apartmentName,
      weekStart,
      currentPrice,
    });
  };

  const handleSavePrice = async (newPrice: number) => {
    if (editingPrice) {
      const success = await updatePrice(
        editingPrice.apartmentId,
        editingPrice.weekStart,
        newPrice,
        currentYear
      );
      
      if (success) {
        setEditingPrice(null);
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Caricamento prezzi...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selettore Anno */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Anno Selezionato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={currentYear.toString()} onValueChange={(value) => setCurrentYear(parseInt(value))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleziona anno" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tabella Prezzi */}
      <Card>
        <CardHeader>
          <CardTitle>Prezzi Stagione {currentYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            // Vista mobile
            <div className="space-y-4">
              {weeks.map((week, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">
                    {format(week.start, "d MMM", { locale: it })} - {format(week.end, "d MMM", { locale: it })}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {apartments.map(apartment => {
                      const price = getPriceForWeek(apartment.id, week.startStr);
                      return (
                        <div key={apartment.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <div className="text-sm font-medium">{apartment.name}</div>
                            <div className="text-lg font-bold">{price} €</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(apartment.id, apartment.name, week.startStr)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Vista desktop
            <div className="rounded-md border overflow-hidden">
              <Table>
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
                        const price = getPriceForWeek(apartment.id, week.startStr);
                        return (
                          <TableCell key={apartment.id}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">{price} €</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(apartment.id, apartment.name, week.startStr)}
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
          )}
        </CardContent>
      </Card>

      {/* Dialog per modificare i prezzi */}
      <PriceDialog
        isOpen={!!editingPrice}
        onClose={() => setEditingPrice(null)}
        onSave={handleSavePrice}
        apartmentName={editingPrice?.apartmentName || ""}
        weekStart={editingPrice ? new Date(editingPrice.weekStart) : undefined}
        weekEnd={editingPrice ? new Date(new Date(editingPrice.weekStart).getTime() + 6 * 24 * 60 * 60 * 1000) : undefined}
        currentPrice={editingPrice?.currentPrice || 0}
      />
    </div>
  );
};

export default UnifiedPriceManager;
