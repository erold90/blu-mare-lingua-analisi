
import * as React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertCircle, Database, Loader2, RefreshCw } from "lucide-react";
import { pingApi } from "@/api/apiClient";
import { DataType } from "@/services/externalStorage";
import { databaseProxy } from "@/services/databaseProxy";

/**
 * Componente per verificare lo stato del database e della sincronizzazione dei dati
 */
const DatabaseStatusChecker: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [dbStatus, setDbStatus] = useState<boolean | null>(null);
  const [syncStats, setSyncStats] = useState<{
    reservations: boolean | null;
    cleaningTasks: boolean | null;
    apartments: boolean | null;
    prices: boolean | null;
  }>({
    reservations: null,
    cleaningTasks: null,
    apartments: null,
    prices: null,
  });
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Controlla lo stato iniziale
  useEffect(() => {
    const lastCheck = localStorage.getItem('last_db_status_check');
    if (lastCheck) {
      setLastChecked(new Date(parseInt(lastCheck)).toLocaleString());
    }
  }, []);

  // Funzione per testare la connessione al database
  const checkDatabaseConnection = async () => {
    setIsChecking(true);
    setDbStatus(null);
    setProgress(10);
    
    try {
      // Testa la connessione al database
      const response = await pingApi.testDatabaseConnection();
      setDbStatus(response.success);
      setProgress(30);
      
      if (response.success) {
        toast.success("Connessione al database stabilita con successo");
        await checkSyncStatus();
      } else {
        toast.error("Impossibile connettersi al database");
        resetSyncStats();
        setProgress(100);
      }
      
      // Salva il timestamp dell'ultimo controllo
      const now = Date.now();
      localStorage.setItem('last_db_status_check', now.toString());
      setLastChecked(new Date(now).toLocaleString());
    } catch (error) {
      console.error("Errore durante il test della connessione al database:", error);
      toast.error("Errore durante il test della connessione");
      setDbStatus(false);
      resetSyncStats();
      setProgress(100);
    } finally {
      setIsChecking(false);
    }
  };
  
  // Reset degli stati di sincronizzazione
  const resetSyncStats = () => {
    setSyncStats({
      reservations: null,
      cleaningTasks: null,
      apartments: null,
      prices: null
    });
  };

  // Funzione per controllare lo stato di sincronizzazione dei dati
  const checkSyncStatus = async () => {
    try {
      // Controlla le prenotazioni
      setProgress(40);
      const reservationsStatus = await checkDataTypeSync(DataType.RESERVATIONS);
      setSyncStats(prev => ({ ...prev, reservations: reservationsStatus }));
      
      // Controlla le attività di pulizia
      setProgress(60);
      const cleaningStatus = await checkDataTypeSync(DataType.CLEANING_TASKS);
      setSyncStats(prev => ({ ...prev, cleaningTasks: cleaningStatus }));
      
      // Controlla gli appartamenti
      setProgress(80);
      const apartmentsStatus = await checkDataTypeSync(DataType.APARTMENTS);
      setSyncStats(prev => ({ ...prev, apartments: apartmentsStatus }));
      
      // Controlla i prezzi
      setProgress(90);
      const pricesStatus = await checkDataTypeSync(DataType.PRICES);
      setSyncStats(prev => ({ ...prev, prices: pricesStatus }));
      
      setProgress(100);
    } catch (error) {
      console.error("Errore durante il controllo della sincronizzazione:", error);
      resetSyncStats();
      setProgress(100);
    }
  };

  // Funzione per verificare la sincronizzazione di un tipo di dati specifico
  const checkDataTypeSync = async (dataType: DataType): Promise<boolean> => {
    try {
      const lastSync = localStorage.getItem(`last_sync_${dataType}`);
      
      if (!lastSync) {
        return false; // Mai sincronizzato
      }
      
      const lastSyncTime = parseInt(lastSync);
      const now = Date.now();
      const hoursDifference = (now - lastSyncTime) / (1000 * 60 * 60);
      
      // Se la sincronizzazione è avvenuta nelle ultime 12 ore, consideriamola valida
      return hoursDifference < 12;
    } catch (error) {
      console.error(`Errore nel controllo della sincronizzazione per ${dataType}:`, error);
      return false;
    }
  };

  // Funzione per forzare la sincronizzazione di tutti i dati
  const forceSyncAllData = async () => {
    setIsChecking(true);
    setProgress(10);
    
    try {
      toast.loading("Sincronizzazione di tutti i dati in corso...");
      
      // Verifica prima la connessione
      const connTest = await pingApi.testDatabaseConnection();
      setDbStatus(connTest.success);
      
      if (!connTest.success) {
        toast.dismiss();
        toast.error("Database non raggiungibile, impossibile sincronizzare");
        setProgress(100);
        return;
      }
      
      setProgress(30);
      
      // Forza la sincronizzazione di tutti i dati
      await databaseProxy.synchronizeAll();
      
      setProgress(80);
      
      // Aggiorna gli stati di sincronizzazione
      await checkSyncStatus();
      
      setProgress(100);
      toast.dismiss();
      toast.success("Sincronizzazione completata con successo");
      
      // Aggiorna il timestamp dell'ultimo controllo
      const now = Date.now();
      localStorage.setItem('last_db_status_check', now.toString());
      setLastChecked(new Date(now).toLocaleString());
    } catch (error) {
      console.error("Errore durante la sincronizzazione:", error);
      toast.dismiss();
      toast.error("Errore durante la sincronizzazione");
      setProgress(100);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Stato Database e Sincronizzazione
        </CardTitle>
        <CardDescription>
          Verifica lo stato della connessione al database e della sincronizzazione dei dati
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stato connessione */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connessione al database:</span>
          {dbStatus === null ? (
            <Badge variant="outline">Non verificato</Badge>
          ) : dbStatus ? (
            <Badge variant="success" className="flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connesso
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center">
              <XCircle className="h-3 w-3 mr-1" />
              Non connesso
            </Badge>
          )}
        </div>
        
        {/* Stato sincronizzazione dati */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium mb-2">Stato sincronizzazione dati:</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
              <span className="text-xs">Prenotazioni</span>
              {renderSyncStatus(syncStats.reservations)}
            </div>
            
            <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
              <span className="text-xs">Attività pulizia</span>
              {renderSyncStatus(syncStats.cleaningTasks)}
            </div>
            
            <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
              <span className="text-xs">Appartamenti</span>
              {renderSyncStatus(syncStats.apartments)}
            </div>
            
            <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
              <span className="text-xs">Prezzi</span>
              {renderSyncStatus(syncStats.prices)}
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        {isChecking && (
          <Progress value={progress} className="h-2" />
        )}
        
        {/* Alert info */}
        {dbStatus === false && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database non raggiungibile</AlertTitle>
            <AlertDescription>
              I dati sono salvati solo localmente. Assicurati che la connessione internet sia attiva.
            </AlertDescription>
          </Alert>
        )}
        
        {dbStatus && allSyncOk(syncStats) && (
          <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Tutto sincronizzato</AlertTitle>
            <AlertDescription className="text-green-700">
              Tutti i dati sono correttamente sincronizzati con il database.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Last checked */}
        {lastChecked && (
          <div className="text-xs text-muted-foreground">
            Ultimo controllo: {lastChecked}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={checkDatabaseConnection}
          disabled={isChecking}
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Database className="h-4 w-4 mr-2" />
          )}
          Verifica stato
        </Button>
        
        <Button
          variant="default"
          onClick={forceSyncAllData}
          disabled={isChecking || dbStatus === false}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isChecking && "animate-spin")} />
          Sincronizza tutto
        </Button>
      </CardFooter>
    </Card>
  );
};

// Helper per verificare se tutti gli stati di sincronizzazione sono ok
const allSyncOk = (stats: {[key: string]: boolean | null}): boolean => {
  return Object.values(stats).every(status => status === true);
};

// Helper per renderizzare lo stato di sincronizzazione
const renderSyncStatus = (status: boolean | null) => {
  if (status === null) {
    return <Badge variant="outline" className="text-xs">Non verificato</Badge>;
  } else if (status) {
    return (
      <Badge variant="success" className="flex items-center text-xs">
        <CheckCircle className="h-2 w-2 mr-1" />
        Sincronizzato
      </Badge>
    );
  } else {
    return (
      <Badge variant="warning" className="flex items-center text-xs bg-amber-100 text-amber-800 hover:bg-amber-200">
        <AlertCircle className="h-2 w-2 mr-1" />
        Da sincronizzare
      </Badge>
    );
  }
};

// Helper per la classe condizionale
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default DatabaseStatusChecker;
