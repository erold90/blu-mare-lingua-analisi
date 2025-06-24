
import * as React from "react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { useAnalytics } from "@/hooks/analytics/useAnalytics";
import { CalendarIcon, Info, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminLogAnalytics } from "./analytics/AdminLogAnalytics";
import { AdminLogQuotes } from "./quotes/AdminLogQuotes";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminLog = () => {
  const { quoteLogs, siteVisits, getVisitsCount, loading, refreshData } = useAnalytics();
  const isMobile = useIsMobile();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error("Errore durante il refresh dei dati:", error);
    } finally {
      setRefreshing(false);
    }
  };
  
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Log delle Attività</h2>
        <div className="flex gap-2">
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
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Aggiorna Dati
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="visits">
        <TabsList>
          <TabsTrigger value="visits">
            Visite ({siteVisits.length})
          </TabsTrigger>
          <TabsTrigger value="quotes">
            Preventivi ({quoteLogs.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="visits" className="mt-6 space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Sistema di tracciamento attivo. Totale visite caricate: {siteVisits.length}. 
              Le visite vengono tracciate automaticamente quando gli utenti navigano sul sito.
            </AlertDescription>
          </Alert>
          
          <AdminLogAnalytics 
            siteVisits={siteVisits} 
            getVisitsCount={getVisitsCount} 
            dateRange={dateRange}
          />
        </TabsContent>
        
        <TabsContent value="quotes" className="mt-6 space-y-6">
          {quoteLogs.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nessun preventivo trovato nel database. I preventivi vengono salvati automaticamente quando gli utenti completano il form di richiesta.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Trovati {quoteLogs.length} preventivi nel database. Utilizza il filtro date per visualizzare periodi specifici.
              </AlertDescription>
            </Alert>
          )}
          
          <AdminLogQuotes 
            quoteLogs={quoteLogs} 
            dateRange={dateRange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLog;
