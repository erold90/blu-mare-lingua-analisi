
import * as React from "react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, isWithinInterval, startOfDay, endOfDay, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarDays, Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { calculateTotalPrice } from "@/utils/quoteCalculator";
import { apartments } from "@/data/apartments";
import AdminLogDelete from "../AdminLogDelete";

interface QuoteLog {
  id: string;
  timestamp: string;
  form_values: any;
  step: number;
  completed: boolean;
}

interface AdminLogQuotesProps {
  quoteLogs: QuoteLog[];
  dateRange: any;
}

export const AdminLogQuotes = ({ quoteLogs, dateRange }: AdminLogQuotesProps) => {
  const isMobile = useIsMobile();
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preventivi richiesti</CardTitle>
        <CardDescription>
          Elenco dei preventivi salvati nel database Supabase
        </CardDescription>
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
                                <QuoteDetails quote={selectedQuote} />
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
  );
};

const QuoteDetails = ({ quote }: { quote: any }) => {
  return (
    <div className="space-y-6 py-4">
      {/* Informazioni generali */}
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-medium mb-3">Informazioni del log</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">ID Log</p>
            <p className="font-mono text-xs">{quote.id}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Timestamp</p>
            <p>{format(new Date(quote.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: it })}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Step completato</p>
            <p>{quote.step}/5</p>
          </div>
        </div>
      </div>

      {/* Altri dettagli del preventivo */}
      {/* ... resto dei dettagli come nel codice originale ... */}
    </div>
  );
};
