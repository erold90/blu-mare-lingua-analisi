
import * as React from "react";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePrices } from "@/hooks/usePrices";
import { apartments } from "@/data/apartments";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminPrices = () => {
  const { weeklyPrices, updateWeeklyPrice, generateWeeksForSeason, getCurrentSeason } = usePrices();
  const isMobile = useIsMobile();
  
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  const [selectedYear, setSelectedYear] = React.useState<number>(currentYear);
  const [weeks, setWeeks] = React.useState<{ start: Date, end: Date }[]>(
    generateWeeksForSeason(selectedYear, 6, 9) // June to September
  );
  
  // Re-generate weeks when selected year changes
  React.useEffect(() => {
    setWeeks(generateWeeksForSeason(selectedYear, 6, 9));
  }, [selectedYear, generateWeeksForSeason]);
  
  const handlePriceChange = (
    apartmentId: string,
    weekStartStr: string,
    value: string
  ) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      updateWeeklyPrice(apartmentId, weekStartStr, numValue);
      toast.success(`Prezzo aggiornato con successo`);
    }
  };
  
  // Get price for a specific apartment and week
  const getPriceForWeek = (apartmentId: string, weekStart: Date): number => {
    const weekStartStr = weekStart.toISOString();
    const price = weeklyPrices.find(
      p => p.apartmentId === apartmentId && 
           p.weekStart.substring(0, 10) === weekStartStr.substring(0, 10)
    );
    
    if (price) return price.price;
    
    // If no price found for this specific week, return the apartment's default price
    const apartment = apartments.find(apt => apt.id === apartmentId);
    return apartment ? apartment.price : 0;
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue={currentYear.toString()}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger 
              value={currentYear.toString()}
              onClick={() => setSelectedYear(currentYear)}
            >
              {currentYear}
            </TabsTrigger>
            <TabsTrigger 
              value={nextYear.toString()}
              onClick={() => setSelectedYear(nextYear)}
            >
              {nextYear}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value={currentYear.toString()} className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prezzi Settimanali {currentYear}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto">
              <div className="text-sm text-muted-foreground mb-4">
                <p>I prezzi sono da intendersi per settimana (da sabato a sabato).</p>
                <p>Anche per soggiorni più brevi verrà applicato il prezzo settimanale.</p>
              </div>
              
              {isMobile ? (
                // Mobile view with vertical layout
                <div className="space-y-8">
                  {apartments.map(apartment => (
                    <div key={apartment.id} className="border rounded-lg p-4">
                      <h3 className="font-bold mb-2">{apartment.name}</h3>
                      <div className="space-y-3">
                        {weeks.map((week, idx) => (
                          <div key={idx} className="grid grid-cols-2 gap-2 items-center">
                            <Label className="text-xs">
                              {format(week.start, "d MMM", { locale: it })} - {format(week.end, "d MMM", { locale: it })}
                            </Label>
                            <div className="flex items-center">
                              <Input
                                type="number"
                                min="0"
                                value={getPriceForWeek(apartment.id, week.start)}
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
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop view with table
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
                        {apartments.map(apartment => (
                          <TableCell key={apartment.id}>
                            <div className="flex items-center">
                              <Input
                                type="number"
                                min="0"
                                value={getPriceForWeek(apartment.id, week.start)}
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
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value={nextYear.toString()} className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prezzi Settimanali {nextYear}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto">
              <div className="text-sm text-muted-foreground mb-4">
                <p>I prezzi sono da intendersi per settimana (da sabato a sabato).</p>
                <p>Anche per soggiorni più brevi verrà applicato il prezzo settimanale.</p>
              </div>
              
              {isMobile ? (
                // Mobile view with vertical layout
                <div className="space-y-8">
                  {apartments.map(apartment => (
                    <div key={apartment.id} className="border rounded-lg p-4">
                      <h3 className="font-bold mb-2">{apartment.name}</h3>
                      <div className="space-y-3">
                        {weeks.map((week, idx) => (
                          <div key={idx} className="grid grid-cols-2 gap-2 items-center">
                            <Label className="text-xs">
                              {format(week.start, "d MMM", { locale: it })} - {format(week.end, "d MMM", { locale: it })}
                            </Label>
                            <div className="flex items-center">
                              <Input
                                type="number"
                                min="0"
                                value={getPriceForWeek(apartment.id, week.start)}
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
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop view with table
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
                        {apartments.map(apartment => (
                          <TableCell key={apartment.id}>
                            <div className="flex items-center">
                              <Input
                                type="number"
                                min="0"
                                value={getPriceForWeek(apartment.id, week.start)}
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
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPrices;
