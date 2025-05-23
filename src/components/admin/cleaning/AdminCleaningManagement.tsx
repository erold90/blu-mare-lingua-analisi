
import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { CleaningProvider, useCleaningManagement } from "@/hooks/cleaning";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { RefreshCw, Database, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { testDatabaseConnection } from "@/hooks/cleaning/cleaningStorage";
import { pingApi } from "@/api/apiClient";

import CleaningHeader from "./CleaningHeader";
import CalendarView from "./views/CalendarView";
import ListView from "./views/ListView";
import StatisticsView from "./views/StatisticsView";

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
  const isMobile = useIsMobile();
  const { refreshTasks, isLoading } = useCleaningManagement();
  
  const handleRefresh = async () => {
    try {
      await refreshTasks();
    } catch (error) {
      console.error("Errore durante l'aggiornamento:", error);
    }
  };
  
  const handleTestConnection = async () => {
    setIsTestingDb(true);
    try {
      const isConnected = await testDatabaseConnection();
      if (isConnected) {
        toast.success("Connessione al database verificata con successo");
      } else {
        toast.error("Impossibile connettersi al database");
      }
    } catch (error) {
      console.error("Errore durante il test della connessione:", error);
      toast.error("Errore durante il test della connessione");
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
        
        <div className="flex gap-2">
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
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Sincronizza
          </Button>
        </div>
      </div>
      
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
