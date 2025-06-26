
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
import { CalendarIcon, Loader2, RefreshCw, BarChart3, TrendingUp, Database, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { AdminLogAnalytics } from "./analytics/AdminLogAnalytics";
import { AdminLogQuotes } from "./quotes/AdminLogQuotes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const AdminAnalytics = () => {
  const { quoteLogs, siteVisits, metrics, loading, error, refreshData, testConnection, cleanupOldData } = useAnalytics();
  const isMobile = useIsMobile();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [refreshing, setRefreshing] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      toast.success('Analytics aggiornati con successo');
    } catch (error) {
      toast.error('Errore durante il refresh dei dati');
    } finally {
      setRefreshing(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const isConnected = await testConnection();
      if (isConnected) {
        toast.success('Connessione database OK');
      } else {
        toast.error('Problemi di connessione al database');
      }
    } catch (error) {
      toast.error('Errore nel test di connessione');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Eliminare i dati analytics vecchi (visite > 6 mesi, preventivi incompleti > 3 mesi)?')) {
      return;
    }

    setCleaning(true);
    try {
      const result = await cleanupOldData();
      toast.success(`Pulizia completata: ${result.deleted_visits} visite e ${result.deleted_quotes} preventivi eliminati`);
    } catch (error) {
      toast.error('Errore durante la pulizia');
    } finally {
      setCleaning(false);
    }
  };
  
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
              Sistema di tracciamento unificato - Versione ottimizzata
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
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
            onClick={handleCleanup} 
            variant="outline" 
            size="sm"
            disabled={cleaning}
          >
            {cleaning ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Pulizia
          </Button>
          
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

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Metriche principali */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Alert>
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="font-semibold">Visite Oggi</div>
            <div className="text-2xl font-bold text-blue-600">{metrics.visitsToday}</div>
          </AlertDescription>
        </Alert>
        <Alert>
          <TrendingUp className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="font-semibold">Visite Settimana</div>
            <div className="text-2xl font-bold text-green-600">{metrics.visitsWeek}</div>
          </AlertDescription>
        </Alert>
        <Alert>
          <TrendingUp className="h-4 w-4 text-purple-600" />
          <AlertDescription>
            <div className="font-semibold">Visite Mese</div>
            <div className="text-2xl font-bold text-purple-600">{metrics.visitsMonth}</div>
          </AlertDescription>
        </Alert>
        <Alert>
          <BarChart3 className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="font-semibold">Preventivi Oggi</div>
            <div className="text-2xl font-bold text-orange-600">{metrics.quotesToday}</div>
          </AlertDescription>
        </Alert>
        <Alert>
          <BarChart3 className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="font-semibold">Preventivi Completati</div>
            <div className="text-2xl font-bold text-red-600">{metrics.quotesCompleted}</div>
          </AlertDescription>
        </Alert>
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
          <AdminLogAnalytics 
            siteVisits={siteVisits} 
            dateRange={dateRange}
            metrics={metrics}
          />
        </TabsContent>
        
        <TabsContent value="quotes" className="mt-6 space-y-6">
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
