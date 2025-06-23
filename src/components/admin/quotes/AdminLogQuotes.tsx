
import * as React from "react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format, isWithinInterval, startOfDay, endOfDay, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarDays, Eye, Users, MapPin, Calendar, Euro } from "lucide-react";
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
                                <DialogTitle>Dettagli preventivo completo</DialogTitle>
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
  const formValues = quote.form_values;
  const selectedApartments = formValues.selectedApartments || [];
  
  return (
    <div className="space-y-6 py-4">
      {/* Informazioni generali del log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informazioni del log
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              <div className="flex items-center gap-2">
                <Badge variant={quote.completed ? "default" : "secondary"}>
                  {quote.step}/5
                </Badge>
                {quote.completed && <Badge variant="outline">Completato</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dettagli del cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Dettagli cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{formValues.name || "Non specificato"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{formValues.email || "Non specificata"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefono</p>
              <p className="font-medium">{formValues.phone || "Non specificato"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Persone totali</p>
              <p className="font-medium">
                {formValues.adults || 0} adulti
                {(formValues.children || 0) > 0 && `, ${formValues.children} bambini`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date soggiorno */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Periodo soggiorno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Check-in</p>
              <p className="font-medium">
                {formValues.checkIn ? format(new Date(formValues.checkIn), "dd/MM/yyyy", { locale: it }) : "Non specificato"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-out</p>
              <p className="font-medium">
                {formValues.checkOut ? format(new Date(formValues.checkOut), "dd/MM/yyyy", { locale: it }) : "Non specificato"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Notti</p>
              <p className="font-medium">
                {formValues.checkIn && formValues.checkOut
                  ? Math.ceil((new Date(formValues.checkOut).getTime() - new Date(formValues.checkIn).getTime()) / (1000 * 60 * 60 * 24))
                  : "Non calcolabile"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appartamenti selezionati */}
      {selectedApartments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Appartamenti selezionati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedApartments.map((aptId: string) => {
                const apartment = apartments.find(apt => apt.id === aptId);
                return (
                  <div key={aptId} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="font-medium">{apartment?.name || `Appartamento ${aptId}`}</span>
                    <Badge variant="outline">{apartment?.beds} posti letto</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Servizi aggiuntivi */}
      <Card>
        <CardHeader>
          <CardTitle>Servizi aggiuntivi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Biancheria</span>
              <Badge variant={formValues.needsLinen ? "default" : "secondary"}>
                {formValues.needsLinen ? "Richiesta" : "Non richiesta"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Animali domestici</span>
              <Badge variant={formValues.hasPets ? "default" : "secondary"}>
                {formValues.hasPets ? "Sì" : "No"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Riepilogo prezzi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Riepilogo prezzi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Prezzo base</span>
              <span className="font-medium">€{quote.price?.basePrice || 0}</span>
            </div>
            {quote.price?.linens > 0 && (
              <div className="flex justify-between">
                <span>Biancheria</span>
                <span className="font-medium">€{quote.price.linens}</span>
              </div>
            )}
            {quote.price?.pets > 0 && (
              <div className="flex justify-between">
                <span>Animali</span>
                <span className="font-medium">€{quote.price.pets}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Totale</span>
              <span>€{quote.price?.totalPrice || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note aggiuntive */}
      {formValues.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{formValues.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
