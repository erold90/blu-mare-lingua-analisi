
import * as React from "react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { useUnifiedAnalytics } from "@/hooks/analytics/useUnifiedAnalytics";
import { CalendarIcon, Info, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminLogAnalytics } from "./analytics/AdminLogAnalytics";
import { AdminLogQuotes } from "./quotes/AdminLogQuotes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const AdminLogUnified = () => {
  const { quoteLogs, siteVisits, getVisitsCount, loading, error, refreshData } = useUnifiedAnalytics();
  const isMobile = useIsMobile();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔍 Refreshing analytics data...');
      await refreshData();
      if (error) {
        toast.warning('Dati parzialmente aggiornati');
      } else {
        toast.success('Dati aggiornati con successo');
      }
    } catch (error) {
      console.error("❌ Error during refresh:", error);
      toast.error('Errore durante il refresh dei dati');
    } finally {
      setRefreshing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Caricamento analytics ottimizzato...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Ottimizzato</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Sistema ultra-veloce con caricamento intelligente
          </p>
        </div>
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
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Aggiorna
          </Button>
        </div>
      </div>

      {/* Error handling with better messaging */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>{error}</p>
              <p className="text-xs">
                Questo è normale durante i primi utilizzi o con connessioni lente. 
                I dati disponibili vengono comunque mostrati correttamente.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success indicators when data loads properly */}
      {!error && (quoteLogs.length > 0 || siteVisits.length > 0) && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>Sistema operativo:</strong> Tutti i dati caricati correttamente con sistema ottimizzato.
          </AlertDescription>
        </Alert>
      )}

      {/* Status indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Visite:</strong> {siteVisits.length} caricate (ultime 24h per performance)
          </AlertDescription>
        </Alert>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Preventivi:</strong> {quoteLogs.length} salvati nel database
          </AlertDescription>
        </Alert>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Performance:</strong> Caricamento ultra-veloce attivo
          </AlertDescription>
        </Alert>
      </div>
      
      <Tabs defaultValue="quotes">
        <TabsList>
          <TabsTrigger value="quotes">
            Preventivi ({quoteLogs.length})
          </TabsTrigger>
          <TabsTrigger value="visits">
            Visite ({siteVisits.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="quotes" className="mt-6 space-y-6">
          {quoteLogs.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nessun preventivo trovato. I preventivi vengono salvati automaticamente quando gli utenti completano il form.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Trovati {quoteLogs.length} preventivi. Sistema database operativo.
              </AlertDescription>
            </Alert>
          )}
          
          <AdminLogQuotes 
            quoteLogs={quoteLogs} 
            dateRange={dateRange}
          />
        </TabsContent>
        
        <TabsContent value="visits" className="mt-6 space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Sistema ultra-veloce attivo. Visualizzando le visite delle ultime 24 ore per performance ottimali.
              {siteVisits.length === 0 && " Nessuna visita recente registrata."}
            </AlertDescription>
          </Alert>
          
          <AdminLogAnalytics 
            siteVisits={siteVisits} 
            getVisitsCount={getVisitsCount} 
            dateRange={dateRange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLogUnified;
