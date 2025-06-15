
import * as React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCleaningManagement } from "@/hooks/useCleaningManagement";
import { pingApi } from "@/api/apiClient";
import { RefreshCw, Database, AlertCircle, CheckCircle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import CleaningHeader from "./CleaningHeader";
import CalendarView from "./views/CalendarView";
import ListView from "./views/ListView";
import StatisticsView from "./views/StatisticsView";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AdminCleaningManagement = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"calendar" | "list" | "statistics">("calendar");
  const [selectedApartment, setSelectedApartment] = useState<string>("all");
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<boolean | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const isMobile = useIsMobile();
  const { refreshTasks, isLoading } = useCleaningManagement();
  
  // Controlla lo stato del database all'avvio
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const isConnected = await pingApi.testDatabaseConnection()
          .then(res => res.success)
          .catch(() => false);
        
        setDbStatus(isConnected);
        console.log("Stato database iniziale:", isConnected ? "connesso" : "non connesso");
      } catch (error) {
        console.error("Errore nel controllo iniziale del database:", error);
        setDbStatus(false);
      }
    };
    
    checkDbStatus();
    
    // Recupera l'ultima sincronizzazione
    const lastSync = localStorage.getItem('last_sync_CLEANING_TASKS');
    if (lastSync) {
      const date = new Date(parseInt(lastSync));
      setLastSyncTime(date.toLocaleString());
    }
  }, []);
  
  const handleRefresh = async () => {
    try {
      await refreshTasks();
      
      // Aggiorna timestamp dell'ultima sincronizzazione
      const now = Date.now();
      localStorage.setItem('last_sync_CLEANING_TASKS', now.toString());
      setLastSyncTime(new Date(now).toLocaleString());
      
      // Verifica lo stato del database
      const isConnected = await pingApi.testDatabaseConnection()
        .then(res => res.success)
        .catch(() => false);
      setDbStatus(isConnected);
      
      toast.success("Attività di pulizia sincronizzate");
    } catch (error) {
      console.error("Errore durante l'aggiornamento:", error);
      toast.error("Errore nella sincronizzazione");
    }
  };
  
  const handleTestConnection = async () => {
    setIsTestingDb(true);
    try {
      const isConnected = await pingApi.testDatabaseConnection()
        .then(res => res.success)
        .catch(() => false);
      setDbStatus(isConnected);
      
      if (isConnected) {
        toast.success("Database connesso correttamente");
      } else {
        toast.error("Impossibile connettersi al database");
      }
    } catch (error) {
      console.error("Errore durante il test della connessione:", error);
      setDbStatus(false);
      toast.error("Errore nel test della connessione");
    } finally {
      setIsTestingDb(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <CleaningHeader 
          view={view}
          setView={setView}
          selectedApartment={selectedApartment}
          setSelectedApartment={setSelectedApartment}
        />
        
        <div className="flex gap-2 items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant={dbStatus ? "default" : dbStatus === null ? "outline" : "destructive"} className="mr-2">
                  {dbStatus ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <WifiOff className="h-3 w-3 mr-1" />
                  )}
                  {dbStatus ? "DB Online" : "DB Offline"}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {dbStatus 
                    ? "Database connesso" 
                    : "Database non raggiungibile"}
                </p>
                {lastSyncTime && (
                  <p className="text-xs mt-1">Ultima sincronizzazione: {lastSyncTime}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            onClick={handleTestConnection} 
            size="sm" 
            variant="outline"
            disabled={isTestingDb}
          >
            <Database className={cn("h-4 w-4 mr-2", isTestingDb && "animate-pulse")} />
            Test DB
          </Button>
          
          <Button 
            onClick={handleRefresh} 
            size="sm" 
            variant={dbStatus ? "default" : "outline"}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Sincronizza
          </Button>
        </div>
      </div>
      
      {dbStatus === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center text-amber-800 mb-4">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p className="text-sm">
            Database non connesso. Le modifiche potrebbero non essere salvate.
            {lastSyncTime && (
              <span className="block text-xs mt-1">Ultima sincronizzazione: {lastSyncTime}</span>
            )}
          </p>
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Caricamento attività di pulizia...</p>
          </div>
        </div>
      )}
      
      {!isLoading && view === "calendar" && (
        <CalendarView
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedApartment={selectedApartment}
          isMobile={isMobile}
        />
      )}
      
      {!isLoading && view === "list" && (
        <ListView
          selectedApartment={selectedApartment}
          isMobile={isMobile}
        />
      )}
      
      {!isLoading && view === "statistics" && (
        <StatisticsView />
      )}
    </div>
  );
};

export default AdminCleaningManagement;
