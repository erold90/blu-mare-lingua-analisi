
import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { QuoteLog } from "@/hooks/analytics/useAnalyticsCore";
import { Eye, Calendar, Users, Euro } from "lucide-react";
import { DateRange } from "react-day-picker";

interface AdminLogQuotesProps {
  quoteLogs: QuoteLog[];
  dateRange: DateRange | undefined;
}

export const AdminLogQuotes = ({ quoteLogs, dateRange }: AdminLogQuotesProps) => {
  const [selectedQuote, setSelectedQuote] = useState<QuoteLog | null>(null);

  const filteredQuotes = React.useMemo(() => {
    if (!dateRange?.from) return quoteLogs;
    
    return quoteLogs.filter(quote => {
      const quoteDate = new Date(quote.created_at);
      const fromDate = dateRange.from!;
      const toDate = dateRange.to || new Date();
      
      return quoteDate >= fromDate && quoteDate <= toDate;
    });
  }, [quoteLogs, dateRange]);

  const completedQuotes = filteredQuotes.filter(q => q.completed);
  const inProgressQuotes = filteredQuotes.filter(q => !q.completed);

  return (
    <div className="space-y-6">
      {/* Statistiche rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preventivi Totali</p>
                <p className="text-2xl font-bold">{filteredQuotes.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completati</p>
                <p className="text-2xl font-bold text-green-600">{completedQuotes.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Corso</p>
                <p className="text-2xl font-bold text-orange-600">{inProgressQuotes.length}</p>
              </div>
              <Euro className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista preventivi */}
      <Card>
        <CardHeader>
          <CardTitle>Preventivi Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessun preventivo trovato per il periodo selezionato
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={quote.completed ? "default" : "secondary"}>
                          {quote.completed ? "Completato" : `Step ${quote.step}`}
                        </Badge>
                        {quote.total_price && (
                          <Badge variant="outline">
                            €{quote.total_price.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(quote.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                      </p>
                      {quote.form_data.personalInfo?.firstName && (
                        <p className="text-sm font-medium">
                          {quote.form_data.personalInfo.firstName} {quote.form_data.personalInfo.lastName}
                        </p>
                      )}
                      {quote.form_data.name && !quote.form_data.personalInfo?.firstName && (
                        <p className="text-sm font-medium">
                          {quote.form_data.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedQuote(quote)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Dettagli Preventivo</DialogTitle>
                          </DialogHeader>
                          {selectedQuote && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold">Informazioni Base</h4>
                                  <p>ID: {selectedQuote.id}</p>
                                  <p>Step: {selectedQuote.step}</p>
                                  <p>Stato: {selectedQuote.completed ? "Completato" : "In corso"}</p>
                                  <p>Data: {format(new Date(selectedQuote.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">Periodo Soggiorno</h4>
                                  {selectedQuote.form_data.checkIn && (
                                    <p>Check-in: {typeof selectedQuote.form_data.checkIn === 'string' ? selectedQuote.form_data.checkIn : format(new Date(selectedQuote.form_data.checkIn), 'dd/MM/yyyy')}</p>
                                  )}
                                  {selectedQuote.form_data.checkOut && (
                                    <p>Check-out: {typeof selectedQuote.form_data.checkOut === 'string' ? selectedQuote.form_data.checkOut : format(new Date(selectedQuote.form_data.checkOut), 'dd/MM/yyyy')}</p>
                                  )}
                                  <p>Adulti: {selectedQuote.form_data.adults || 0}</p>
                                  <p>Bambini: {selectedQuote.form_data.children || 0}</p>
                                </div>
                              </div>
                              
                              {selectedQuote.form_data.personalInfo && (
                                <div>
                                  <h4 className="font-semibold">Informazioni Contatto</h4>
                                  <p>Nome: {selectedQuote.form_data.personalInfo.firstName} {selectedQuote.form_data.personalInfo.lastName}</p>
                                  <p>Email: {selectedQuote.form_data.personalInfo.email}</p>
                                  <p>Telefono: {selectedQuote.form_data.personalInfo.phone}</p>
                                </div>
                              )}
                              
                              {selectedQuote.form_data.name && !selectedQuote.form_data.personalInfo && (
                                <div>
                                  <h4 className="font-semibold">Nome Cliente</h4>
                                  <p>{selectedQuote.form_data.name}</p>
                                </div>
                              )}
                              
                              {selectedQuote.form_data.apartments && selectedQuote.form_data.apartments.length > 0 && (
                                <div>
                                  <h4 className="font-semibold">Appartamenti Selezionati</h4>
                                  {selectedQuote.form_data.apartments.map((apt, index) => (
                                    <p key={index}>- {apt.name} (€{apt.price || 0})</p>
                                  ))}
                                </div>
                              )}
                              
                              {selectedQuote.form_data.services && selectedQuote.form_data.services.length > 0 && (
                                <div>
                                  <h4 className="font-semibold">Servizi Aggiuntivi</h4>
                                  {selectedQuote.form_data.services.map((service, index) => (
                                    <p key={index}>- {service.name} (€{service.price || 0})</p>
                                  ))}
                                </div>
                              )}
                              
                              {selectedQuote.total_price && (
                                <div>
                                  <h4 className="font-semibold">Prezzo Totale</h4>
                                  <p className="text-lg font-bold">€{selectedQuote.total_price.toFixed(2)}</p>
                                </div>
                              )}
                              
                              {selectedQuote.form_data.notes && (
                                <div>
                                  <h4 className="font-semibold">Note</h4>
                                  <p>{selectedQuote.form_data.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
