
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
import { CalendarIcon, Info, Loader2, AlertCircle, RefreshCw, CheckCircle2, BarChart3, TrendingUp, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminLogAnalytics } from "./analytics/AdminLogAnalytics";
import { AdminLogQuotes } from "./quotes/AdminLogQuotes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { testSupabaseConnection } from "@/hooks/analytics/operations/siteOperations";

const AdminAnalytics = () => {
  const { quoteLogs, siteVisits, getVisitsCount, loading, error, refreshData } = useUnifiedAnalytics();
  const isMobile = useIsMobile();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [refreshing, setRefreshing] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing analytics data...');
      await refreshData();
      toast.success('Analytics aggiornati con successo');
    } catch (error) {
      console.error("❌ Error during refresh:", error);
      toast.error('Errore durante il refresh dei dati');
    } finally {
      setRefreshing(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      console.log('🔗 Testing database connection...');
      const isConnected = await testSupabaseConnection();
      if (isConnected) {
        toast.success('Connessione database OK');
      } else {
        toast.error('Problemi di connessione al database');
      }
    } catch (error) {
      console.error("❌ Connection test error:", error);
      toast.error('Errore nel test di connessione');
    } finally {
      setTestingConnection(false);
    }
  };

  // Calcola statistiche in tempo reale
  const stats = React.useMemo(() => {
    const visitsToday = getVisitsCount('day');
    const visitsMonth = getVisitsCount('month');
    const visitsYear = getVisitsCount('year');
    
    console.log('📊 Stats calculated:', { visitsToday, visitsMonth, visitsYear, totalSiteVisits: siteVisits.length });
    
    return {
      visitsToday,
      visitsMonth,
      visitsYear,
      totalQuotes: quoteLogs.length,
      completedQuotes: quoteLogs.filter(q => q.completed).length
    };
  }, [quoteLogs, getVisitsCount, siteVisits.length]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Caricamento analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Analytics Villa MareBlu</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sistema di tracciamento unificato per preventivi e visite
            </p>
          </div>
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
            onClick={handleTestConnection} 
            variant="outline" 
            size="sm"
            disabled={testingConnection}
          >
            {testingConnection ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Test DB
          </Button>
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

      {/* Debug information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Stato Sistema:</strong>
              <br />
              Visite caricate: {siteVisits.length}
              <br />
              Preventivi: {quoteLogs.length}
            </div>
            <div>
              <strong>Debug Info:</strong>
              <br />
              Errori: {error ? 'Presenti' : 'Nessuno'}
              <br />
              Ultima query: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Indicatori di stato migliorati */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {error ? (
          <Alert variant="destructive" className="col-span-full">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert>
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="font-semibold">Visite Oggi</div>
                <div className="text-2xl font-bold text-blue-600">{stats.visitsToday}</div>
                <div className="text-xs text-muted-foreground">
                  {stats.visitsToday === 0 && siteVisits.length > 0 ? 
                    'Nessuna visita oggi' : 
                    'Visite registrate'}
                </div>
              </AlertDescription>
            </Alert>
            <Alert>
              <BarChart3 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="font-semibold">Preventivi Totali</div>
                <div className="text-2xl font-bold text-green-600">{stats.totalQuotes}</div>
              </AlertDescription>
            </Alert>
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
              <AlertDescription>
                <div className="font-semibold">Preventivi Completati</div>
                <div className="text-2xl font-bold text-purple-600">{stats.completedQuotes}</div>
              </AlertDescription>
            </Alert>
            <Alert>
              <Info className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <div className="font-semibold">Visite Totali</div>
                <div className="text-2xl font-bold text-orange-600">{siteVisits.length}</div>
                <div className="text-xs text-muted-foreground">Ultimi 30 giorni</div>
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
      
      <Tabs defaultValue="visits" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visits">
            Visite Sito ({siteVisits.length})
          </TabsTrigger>
          <TabsTrigger value="quotes">
            Preventivi ({quoteLogs.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="visits" className="mt-6 space-y-6">
          {siteVisits.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Nessuna visita registrata.</strong>
                <br />
                Il sistema di tracking è attivo e registra automaticamente le visite alle pagine pubbliche.
                <br />
                <em>Suggerimento: Visita il sito in una nuova finestra privata per testare il tracking.</em>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Sistema tracking operativo. Registrate {siteVisits.length} visite negli ultimi 30 giorni.
                <br />
                Oggi: {stats.visitsToday} visite | Questo mese: {stats.visitsMonth} visite
              </AlertDescription>
            </Alert>
          )}
          
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
                Nessun preventivo trovato. I preventivi vengono salvati automaticamente quando gli utenti completano il form.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Sistema preventivi operativo. Trovati {quoteLogs.length} preventivi di cui {stats.completedQuotes} completati.
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

export default AdminAnalytics;
