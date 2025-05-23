
import * as React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { CleaningProvider, useCleaningManagement } from "@/hooks/cleaning";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { RefreshCw, Database, AlertCircle, CheckCircle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { testDatabaseConnection, syncCleaningTasks } from "@/hooks/cleaning/cleaningStorage";
import { pingApi } from "@/api/apiClient";
import { DataType } from "@/services/externalStorage";

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

// Componente principale avvolto nel provider
const AdminCleaningManagementWithProvider = () => (
  <CleaningProvider>
    <AdminCleaningManagementContent />
  </CleaningProvider>
);

// Contenuto interno che usa il context
const AdminCleaningManagementContent = () => {
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
      await syncCleaningTasks();
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
    } catch (error) {
      console.error("Errore durante l'aggiornamento:", error);
    }
  };
  
  const handleTestConnection = async () => {
    setIsTestingDb(true);
    try {
      const isConnected = await testDatabaseConnection();
      setDbStatus(isConnected);
      
      if (isConnected) {
        // Verifica se ci sono dati da sincronizzare
        const localData = localStorage.getItem('persistent_cleaning_tasks');
        if (localData) {
          const tasks = JSON.parse(localData);
          if (tasks && tasks.length > 0) {
            toast.info(`${tasks.length} attività locali disponibili per la sincronizzazione`);
          }
        }
      }
    } catch (error) {
      console.error("Errore durante il test della connessione:", error);
      setDbStatus(false);
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
          {/* Stato database */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant={dbStatus ? "success" : dbStatus === null ? "outline" : "destructive"} className="mr-2">
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
                    : "Database non raggiungibile. I dati sono salvati solo localmente."}
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
      
      {/* Messaggi informativi */}
      {dbStatus === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center text-amber-800 mb-4">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p className="text-sm">
            Database non connesso. I dati sono salvati solo localmente e non saranno visibili su altri dispositivi.
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
            <p className="text-muted-foreground">Sincronizzazione in corso...</p>
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

// Esporta il componente avvolto nel provider
const AdminCleaningManagement = () => {
  return <AdminCleaningManagementWithProvider />;
};

export default AdminCleaningManagement;
