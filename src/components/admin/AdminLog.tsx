
import * as React from "react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, isWithinInterval, startOfDay, endOfDay, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { useActivityLog } from "@/hooks/activity/useActivityLog";
import { useReservations } from "@/hooks/useReservations";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarIcon, Info, CalendarDays, Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { calculateTotalPrice } from "@/utils/quoteCalculator";
import { apartments } from "@/data/apartments";
import AdminLogDelete from "./AdminLogDelete";
import { toast } from "sonner";

const AdminLog = () => {
  const { quoteLogs, siteVisits, getVisitsCount, loading, refreshData } = useActivityLog();
  const { apartments: apartmentsFromContext } = useReservations();
  const isMobile = useIsMobile();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Caricamento dati...</span>
        </div>
      </div>
    );
  }
  
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
  
  // Prepare visits data for charts with better performance
  const visitChartData = useMemo(() => {
    if (!dateRange?.from) return [];
    
    const chartData = [];
    let currentDate = new Date(dateRange.from);
    const endDate = dateRange.to ? new Date(dateRange.to) : new Date(currentDate);
    
    // Limit to 30 days for performance
    const daysDiff = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      endDate.setDate(currentDate.getDate() + 30);
    }
    
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Log delle Attività</h2>
        <Button onClick={refreshData} variant="outline" size="sm">
          Aggiorna Dati
        </Button>
      </div>
      
      <Tabs defaultValue="visits">
        <TabsList>
          <TabsTrigger value="visits">Visite</TabsTrigger>
          <TabsTrigger value="quotes">Preventivi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visits" className="mt-6 space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">Sistema ottimizzato</p>
                <p className="text-green-700 text-sm">Query ottimizzate per migliori performance. Limite di 500 visite caricate.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Visite oggi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getVisitsCount('day')}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Visite uniche al sito
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
                  Performance ottimizzata
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
                  Database Supabase
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
                    Visualizzazione ottimizzata (max 30 giorni)
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
                    Elenco dei preventivi salvati nel database Supabase
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
                        <TableHead className="w-[120px]">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuotes.map((quote) => {
                        const formValues = quote.form_values;
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
                              <div className="flex gap-1">
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
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Log completo del preventivo</DialogTitle>
                                    </DialogHeader>
                                    
                                    {selectedQuote && (
                                      <div className="space-y-6 py-4">
                                        {/* Informazioni generali */}
                                        <div className="bg-muted p-4 rounded-lg">
                                          <h3 className="font-medium mb-3">Informazioni del log</h3>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                              <p className="text-muted-foreground">ID Log</p>
                                              <p className="font-mono text-xs">{selectedQuote.id}</p>
                                            </div>
                                            <div>
                                              <p className="text-muted-foreground">Timestamp</p>
                                              <p>{format(new Date(selectedQuote.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: it })}</p>
                                            </div>
                                            <div>
                                              <p className="text-muted-foreground">Step completato</p>
                                              <p>{selectedQuote.step}/5</p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Dettagli soggiorno */}
                                        <div>
                                          <h3 className="font-medium mb-3">Dettagli soggiorno</h3>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                              <p className="text-muted-foreground">Check-in</p>
                                              <p>{selectedQuote.form_values.checkIn ? 
                                                format(new Date(selectedQuote.form_values.checkIn), "dd/MM/yyyy", { locale: it }) : 
                                                "Non specificato"}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-muted-foreground">Check-out</p>
                                              <p>{selectedQuote.form_values.checkOut ? 
                                                format(new Date(selectedQuote.form_values.checkOut), "dd/MM/yyyy", { locale: it }) : 
                                                "Non specificato"}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-muted-foreground">Notti</p>
                                              <p>{selectedQuote.price.nights}</p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Ospiti */}
                                        <div>
                                          <h3 className="font-medium mb-3">Composizione gruppo</h3>
                                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                              <p className="text-muted-foreground">Adulti</p>
                                              <p>{selectedQuote.form_values.adults}</p>
                                            </div>
                                            <div>
                                              <p className="text-muted-foreground">Bambini</p>
                                              <p>{selectedQuote.form_values.children || 0}</p>
                                            </div>
                                            <div>
                                              <p className="text-muted-foreground">Animali</p>
                                              <p>{selectedQuote.form_values.hasPets ? "Sì" : "No"}</p>
                                            </div>
                                            <div>
                                              <p className="text-muted-foreground">Totale ospiti</p>
                                              <p>{selectedQuote.form_values.adults + (selectedQuote.form_values.children || 0)}</p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Appartamenti */}
                                        <div>
                                          <h3 className="font-medium mb-3">Appartamenti selezionati</h3>
                                          <div className="space-y-2">
                                            {selectedQuote.form_values.selectedApartments ? 
                                              selectedQuote.form_values.selectedApartments.map((aptId: string) => {
                                                const apt = apartments.find(a => a.id === aptId);
                                                return apt ? (
                                                  <div key={aptId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                    <div>
                                                      <p className="font-medium">{apt.name}</p>
                                                      <p className="text-sm text-muted-foreground">{apt.capacity} persone • {apt.bedrooms} camere</p>
                                                    </div>
                                                    <Badge variant="outline">{apt.id}</Badge>
                                                  </div>
                                                ) : null;
                                              }) :
                                              selectedQuote.form_values.selectedApartment ? (
                                                <div className="p-3 bg-muted rounded-lg">
                                                  {(() => {
                                                    const apt = apartments.find(a => a.id === selectedQuote.form_values.selectedApartment);
                                                    return apt ? (
                                                      <div className="flex items-center justify-between">
                                                        <div>
                                                          <p className="font-medium">{apt.name}</p>
                                                          <p className="text-sm text-muted-foreground">{apt.capacity} persone • {apt.bedrooms} camere</p>
                                                        </div>
                                                        <Badge variant="outline">{apt.id}</Badge>
                                                      </div>
                                                    ) : <p className="text-muted-foreground">Appartamento non trovato</p>;
                                                  })()}
                                                </div>
                                              ) : (
                                                <p className="text-sm text-muted-foreground">Nessun appartamento selezionato</p>
                                              )
                                            }
                                          </div>
                                        </div>

                                        {/* Servizi extra */}
                                        <div>
                                          <h3 className="font-medium mb-3">Servizi aggiuntivi</h3>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                              <p className="text-muted-foreground">Biancheria</p>
                                              <p>{selectedQuote.form_values.linenOption || "Non specificato"}</p>
                                            </div>
                                            <div>
                                              <p className="text-muted-foreground">Lettini</p>
                                              <p>{selectedQuote.form_values.cribs || 0}</p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Riepilogo prezzi */}
                                        <div>
                                          <h3 className="font-medium mb-3">Riepilogo costi</h3>
                                          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Prezzo base</span>
                                              <span>{selectedQuote.price.basePrice}€</span>
                                            </div>
                                            {selectedQuote.price.extras > 0 && (
                                              <div className="flex justify-between">
                                                <span className="text-muted-foreground">Extra</span>
                                                <span>{selectedQuote.price.extras}€</span>
                                              </div>
                                            )}
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Pulizia</span>
                                              <span>{selectedQuote.price.cleaningFee}€</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Tassa di soggiorno</span>
                                              <span className="text-green-600">Inclusa</span>
                                            </div>
                                            {selectedQuote.price.savings > 0 && (
                                              <div className="flex justify-between">
                                                <span className="text-muted-foreground">Risparmio</span>
                                                <span className="text-green-600">-{selectedQuote.price.savings}€</span>
                                              </div>
                                            )}
                                            <div className="border-t pt-2 mt-2">
                                              <div className="flex justify-between font-medium text-base">
                                                <span>Totale</span>
                                                <span>{selectedQuote.price.totalPrice}€</span>
                                              </div>
                                              <div className="flex justify-between text-muted-foreground mt-1">
                                                <span>Caparra (30%)</span>
                                                <span>{selectedQuote.price.deposit}€</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Note */}
                                        {selectedQuote.form_values.notes && (
                                          <div>
                                            <h3 className="font-medium mb-3">Note</h3>
                                            <div className="bg-muted p-4 rounded-lg">
                                              <p className="text-sm">{selectedQuote.form_values.notes}</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>

                                <AdminLogDelete 
                                  quoteId={quote.id} 
                                  customerName={formValues.name} 
                                />
                              </div>
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
