
import * as React from "react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, isWithinInterval, startOfDay, endOfDay, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useReservations } from "@/hooks/useReservations";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarIcon, Info, CalendarDays, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { calculateTotalPrice } from "@/utils/quoteCalculator";
import { apartments } from "@/data/apartments";

const AdminLog = () => {
  const { quoteLogs, siteVisits, getVisitsCount } = useActivityLog();
  const { apartments: apartmentsFromContext } = useReservations();
  const isMobile = useIsMobile();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  
  // Filter quotes based on date range
  const filteredQuotes = useMemo(() => {
    if (!dateRange?.from) return quoteLogs;
    
    return quoteLogs.filter(quote => {
      const quoteDate = new Date(quote.timestamp);
      if (dateRange.to) {
        return isWithinInterval(quoteDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to)
        });
      }
      return isSameDay(quoteDate, dateRange.from);
    });
  }, [quoteLogs, dateRange]);
  
  // Prepare visits data for charts
  const visitChartData = useMemo(() => {
    if (!dateRange?.from) return [];
    
    const chartData = [];
    let currentDate = new Date(dateRange.from);
    const endDate = dateRange.to ? new Date(dateRange.to) : new Date(currentDate);
    
    // Generate data for each day in the range
    while (currentDate <= endDate) {
      const day = format(currentDate, 'dd/MM', { locale: it });
      const count = siteVisits.filter(visit => {
        const visitDate = new Date(visit.timestamp);
        return isSameDay(visitDate, currentDate);
      }).length;
      
      chartData.push({ name: day, visits: count });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return chartData;
  }, [siteVisits, dateRange]);
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="visits">
        <TabsList>
          <TabsTrigger value="visits">Visite</TabsTrigger>
          <TabsTrigger value="quotes">Preventivi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visits" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Visite oggi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getVisitsCount('day')}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Visite uniche al sito (esclusa area riservata)
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Visite questo mese</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getVisitsCount('month')}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Totale di {siteVisits.length} visite dall'inizio
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Visite quest'anno</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getVisitsCount('year')}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tendenza in {getVisitsCount('year') > getVisitsCount('month') * 6 ? 'crescita' : 'calo'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>Andamento visite</CardTitle>
                  <CardDescription>
                    Visualizzazione delle visite nel periodo selezionato
                  </CardDescription>
                </div>
                
                <div className={cn("grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-[auto_1fr]")}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                              {format(dateRange.to, "dd/MM/yyyy")}
                            </>
                          ) : (
                            format(dateRange.from, "dd/MM/yyyy")
                          )
                        ) : (
                          <span>Seleziona date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        locale={it}
                        numberOfMonths={isMobile ? 1 : 2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {visitChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={visitChartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [`${value} visite`, "Visite"]}
                        labelFormatter={(value: any) => `Giorno: ${value}`}
                      />
                      <Bar dataKey="visits" fill="#8b87f5" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Nessun dato disponibile per il periodo selezionato</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quotes" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>Preventivi richiesti</CardTitle>
                  <CardDescription>
                    Elenco dei preventivi richiesti dai clienti
                  </CardDescription>
                </div>
                
                <div className={cn("grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-[auto_1fr]")}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                              {format(dateRange.to, "dd/MM/yyyy")}
                            </>
                          ) : (
                            format(dateRange.from, "dd/MM/yyyy")
                          )
                        ) : (
                          <span>Seleziona date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        locale={it}
                        numberOfMonths={isMobile ? 1 : 2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredQuotes.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Data</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="hidden md:table-cell">Persone</TableHead>
                        <TableHead className="hidden md:table-cell">Check-in</TableHead>
                        <TableHead className="hidden md:table-cell">Check-out</TableHead>
                        <TableHead className="text-right">Prezzo</TableHead>
                        <TableHead className="w-[80px]">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuotes.map((quote) => {
                        const formValues = quote.formValues;
                        const price = calculateTotalPrice(formValues, apartments);
                        
                        return (
                          <TableRow key={quote.id}>
                            <TableCell className="font-medium">
                              {format(new Date(quote.timestamp), "dd/MM/yyyy", { locale: it })}
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(quote.timestamp), "HH:mm", { locale: it })}
                              </div>
                            </TableCell>
                            <TableCell>
                              {formValues.name || "Anonimo"}
                              {formValues.email && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {formValues.email}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {formValues.adults + (formValues.children || 0)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {formValues.checkIn ? format(new Date(formValues.checkIn), "dd/MM/yyyy", { locale: it }) : "-"}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {formValues.checkOut ? format(new Date(formValues.checkOut), "dd/MM/yyyy", { locale: it }) : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {price.totalPrice > 0 ? `${price.totalPrice}€` : "-"}
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedQuote({
                                      ...quote,
                                      price
                                    })}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Dettagli preventivo</DialogTitle>
                                  </DialogHeader>
                                  
                                  {selectedQuote && (
                                    <div className="space-y-6 py-4">
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                          <p className="text-sm font-medium">Data richiesta</p>
                                          <p className="text-sm text-muted-foreground">
                                            {format(new Date(selectedQuote.timestamp), "dd/MM/yyyy HH:mm", { locale: it })}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Cliente</p>
                                          <p className="text-sm text-muted-foreground">
                                            {selectedQuote.formValues.name || "Anonimo"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Email</p>
                                          <p className="text-sm text-muted-foreground">
                                            {selectedQuote.formValues.email || "-"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Telefono</p>
                                          <p className="text-sm text-muted-foreground">
                                            {selectedQuote.formValues.phone || "-"}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <div className="border-t pt-4">
                                        <h3 className="text-sm font-medium mb-2">Dettagli soggiorno</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                          <div>
                                            <p className="text-xs text-muted-foreground">Check-in</p>
                                            <p className="text-sm">
                                              {selectedQuote.formValues.checkIn ? 
                                                format(new Date(selectedQuote.formValues.checkIn), "dd/MM/yyyy", { locale: it }) : 
                                                "-"}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-muted-foreground">Check-out</p>
                                            <p className="text-sm">
                                              {selectedQuote.formValues.checkOut ? 
                                                format(new Date(selectedQuote.formValues.checkOut), "dd/MM/yyyy", { locale: it }) : 
                                                "-"}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-muted-foreground">Notti</p>
                                            <p className="text-sm">{selectedQuote.price.nights}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-muted-foreground">Ospiti</p>
                                            <p className="text-sm">
                                              {selectedQuote.formValues.adults + (selectedQuote.formValues.children || 0)}
                                            </p>
                                          </div>
                                        </div>
                                        
                                        <div className="mt-4 space-y-2">
                                          <div>
                                            <p className="text-xs text-muted-foreground">Adulti</p>
                                            <p className="text-sm">{selectedQuote.formValues.adults}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-muted-foreground">Bambini</p>
                                            <p className="text-sm">{selectedQuote.formValues.children || 0}</p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="border-t pt-4">
                                        <h3 className="text-sm font-medium mb-2">Appartamenti selezionati</h3>
                                        <div className="space-y-3">
                                          {selectedQuote.formValues.selectedApartments ? 
                                            selectedQuote.formValues.selectedApartments.map((aptId: string) => {
                                              const apt = apartments.find(a => a.id === aptId);
                                              return apt ? (
                                                <div key={aptId} className="flex items-center justify-between border-b pb-2">
                                                  <span>{apt.name}</span>
                                                  <Badge variant="outline">{apt.capacity} persone</Badge>
                                                </div>
                                              ) : null;
                                            }) :
                                            selectedQuote.formValues.selectedApartment ? (
                                              <div className="flex items-center justify-between border-b pb-2">
                                                {(() => {
                                                  const apt = apartments.find(a => a.id === selectedQuote.formValues.selectedApartment);
                                                  return apt ? (
                                                    <>
                                                      <span>{apt.name}</span>
                                                      <Badge variant="outline">{apt.capacity} persone</Badge>
                                                    </>
                                                  ) : null;
                                                })()}
                                              </div>
                                            ) : (
                                              <p className="text-sm text-muted-foreground">Nessun appartamento selezionato</p>
                                            )
                                          }
                                        </div>
                                      </div>
                                      
                                      <div className="border-t pt-4">
                                        <h3 className="text-sm font-medium mb-2">Riepilogo costi</h3>
                                        <div className="space-y-2">
                                          <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Prezzo base</span>
                                            <span className="text-sm">{selectedQuote.price.basePrice}€</span>
                                          </div>
                                          {selectedQuote.price.extras > 0 && (
                                            <div className="flex justify-between">
                                              <span className="text-sm text-muted-foreground">Extra</span>
                                              <span className="text-sm">{selectedQuote.price.extras}€</span>
                                            </div>
                                          )}
                                          <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Pulizia</span>
                                            <span className="text-sm">{selectedQuote.price.cleaningFee}€</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Tassa di soggiorno</span>
                                            <span className="text-sm text-green-600">Inclusa</span>
                                          </div>
                                          {selectedQuote.price.savings > 0 && (
                                            <div className="flex justify-between">
                                              <span className="text-sm text-muted-foreground">Risparmio</span>
                                              <span className="text-sm text-green-600">-{selectedQuote.price.savings}€</span>
                                            </div>
                                          )}
                                          <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between font-medium">
                                              <span>Totale</span>
                                              <span>{selectedQuote.price.totalPrice}€</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                              <span>Caparra (30%)</span>
                                              <span>{selectedQuote.price.deposit}€</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {selectedQuote.formValues.notes && (
                                        <div className="border-t pt-4">
                                          <h3 className="text-sm font-medium mb-2">Note</h3>
                                          <p className="text-sm text-muted-foreground">
                                            {selectedQuote.formValues.notes}
                                          </p>
                                        </div>
                                      )}
                                      
                                      <div className="flex justify-end">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedQuote(null);
                                          }}
                                        >
                                          Chiudi
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-2 text-lg font-medium">Nessun preventivo trovato</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Non ci sono preventivi richiesti nel periodo selezionato
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLog;
