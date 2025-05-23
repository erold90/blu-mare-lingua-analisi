
import React, { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Pencil, Copy, AlertCircle } from "lucide-react";
import { PriceData } from "@/hooks/prices/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { apartments } from "@/data/apartments";
import { WeekInfo } from "@/hooks/prices/weekUtils";
import PriceDialog from "./PriceDialog";
import PriceCopyDialog from "./PriceCopyDialog";

interface YearPriceGridProps {
  year: number;
  prices: PriceData[];
  getSeasonWeeks: (year?: number) => WeekInfo[];
  updatePrice: (apartmentId: string, weekStart: string, price: number) => Promise<boolean>;
}

const YearPriceGrid: React.FC<YearPriceGridProps> = ({
  year,
  prices,
  getSeasonWeeks,
  updatePrice
}) => {
  const [editingPrice, setEditingPrice] = useState<{
    apartmentId: string;
    apartmentName: string;
    weekStart: string;
    weekLabel: string;
    currentPrice: number;
  } | null>(null);
  
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(apartments[0].id);

  const weeks = getSeasonWeeks(year);
  
  // Check if this is a future year with no prices
  const isFutureYear = year > 2025;
  const hasData = prices.some(p => {
    const weekDate = new Date(p.weekStart);
    return weekDate.getFullYear() === year;
  });

  // Function to get price for a specific apartment and week
  const findPrice = (apartmentId: string, weekStart: string): number => {
    const price = prices.find(p => p.apartmentId === apartmentId && p.weekStart === weekStart);
    return price ? price.price : 0;
  };

  // Function to handle editing a price
  const handleEditPrice = (apartmentId: string, weekStart: string) => {
    const apartment = apartments.find(a => a.id === apartmentId);
    if (!apartment) return;
    
    const week = weeks.find(w => w.startStr === weekStart);
    if (!week) return;
    
    const weekLabel = `${format(week.start, 'd MMM', { locale: it })} - ${format(week.end, 'd MMM', { locale: it })}`;
    const currentPrice = findPrice(apartmentId, weekStart);
    
    setEditingPrice({
      apartmentId,
      apartmentName: apartment.name,
      weekStart,
      weekLabel,
      currentPrice
    });
  };

  // Function to handle saving the edited price
  const handleSavePrice = async (newPrice: number) => {
    if (editingPrice) {
      await updatePrice(editingPrice.apartmentId, editingPrice.weekStart, newPrice);
      setEditingPrice(null);
    }
  };

  // Group weeks by month for more compact display
  const weeksByMonth: Record<string, WeekInfo[]> = {};
  weeks.forEach(week => {
    const monthKey = format(week.start, 'MMMM', { locale: it });
    if (!weeksByMonth[monthKey]) {
      weeksByMonth[monthKey] = [];
    }
    weeksByMonth[monthKey].push(week);
  });

  return (
    <>
      {isFutureYear && !hasData && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Anno futuro</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Non ci sono ancora prezzi per l'anno {year}.</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCopyDialog(true)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copia prezzi da anno precedente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={apartments[0].id}>
        <TabsList className="mb-4 w-full flex overflow-x-auto">
          {apartments.map((apt) => (
            <TabsTrigger 
              key={apt.id} 
              value={apt.id}
              onClick={() => setSelectedApartment(apt.id)}
            >
              {apt.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {apartments.map((apartment) => (
          <TabsContent key={apartment.id} value={apartment.id} className="mt-0">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Prezzi {year} - {apartment.name}</span>
                  {isFutureYear && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowCopyDialog(true)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copia prezzi
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  {Object.entries(weeksByMonth).map(([monthName, monthWeeks]) => (
                    <div key={monthName} className="space-y-2">
                      <h4 className="font-medium capitalize text-muted-foreground">
                        {monthName}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {monthWeeks.map((week) => {
                          const price = findPrice(apartment.id, week.startStr);
                          let priceClass = "";
                          
                          // Color-coding based on price levels
                          if (price >= 1000) priceClass = "bg-red-50 text-red-800 border-red-200";
                          else if (price >= 700) priceClass = "bg-orange-50 text-orange-800 border-orange-200";
                          else if (price >= 500) priceClass = "bg-yellow-50 text-yellow-800 border-yellow-200";
                          else priceClass = "bg-green-50 text-green-800 border-green-200";
                          
                          return (
                            <div 
                              key={week.startStr} 
                              className={`flex items-center justify-between p-2 rounded-md border ${priceClass}`}
                            >
                              <div>
                                <div className="text-sm font-medium">
                                  {format(week.start, 'd', { locale: it })} - {format(week.end, 'd MMM', { locale: it })}
                                </div>
                                <div className="font-bold">{price}€</div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditPrice(apartment.id, week.startStr)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Modifica</span>
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {editingPrice && (
        <PriceDialog
          isOpen={!!editingPrice}
          onClose={() => setEditingPrice(null)}
          onSave={handleSavePrice}
          apartmentName={editingPrice.apartmentName}
          weekLabel={editingPrice.weekLabel}
          currentPrice={editingPrice.currentPrice}
        />
      )}

      <PriceCopyDialog
        isOpen={showCopyDialog}
        onClose={() => setShowCopyDialog(false)}
        targetYear={year}
        apartmentId={selectedApartment}
      />
    </>
  );
};

export default YearPriceGrid;
