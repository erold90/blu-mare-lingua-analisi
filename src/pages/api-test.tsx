
import { useState, useEffect } from 'react';
import { 
  pingApi, 
  reservationsApi, 
  cleaningApi,
  apartmentsApi, 
  pricesApi, 
  syncApi,
  systemApi,
  checkServerStatus,
  setOfflineMode,
  isOfflineMode
} from '../api/apiClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Signal, Wifi, WifiOff } from 'lucide-react';

const ApiTestPage = () => {
  const [activeTab, setActiveTab] = useState('ping');
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [offline, setOffline] = useState(isOfflineMode());
  
  // Funzione per eseguire un test API generico
  const runTest = async (name: string, testFn: () => Promise<any>) => {
    setIsLoading(prev => ({ ...prev, [name]: true }));
    try {
      const startTime = performance.now();
      const result = await testFn();
      const endTime = performance.now();
      
      setResults(prev => ({ 
        ...prev, 
        [name]: {
          data: result,
          timestamp: new Date().toLocaleTimeString(),
          duration: Math.round(endTime - startTime),
          error: null
        }
      }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [name]: {
          data: null,
          timestamp: new Date().toLocaleTimeString(),
          duration: 0,
          error: error instanceof Error ? error.message : 'Errore sconosciuto'
        }
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, [name]: false }));
    }
  };
  
  // Toggle modalità offline
  const toggleOfflineMode = () => {
    const newMode = !offline;
    setOfflineMode(newMode);
    setOffline(newMode);
  };
  
  // Test individuali per ogni API
  
  // Test ping API
  const testPing = () => runTest('ping', pingApi.check);
  const testDatabaseConnection = () => runTest('database', pingApi.testDatabaseConnection);
  const testServerStatus = () => runTest('serverStatus', checkServerStatus);
  
  // Test reservations API
  const testGetAllReservations = () => runTest('getAllReservations', reservationsApi.getAll);
  
  // Test cleaning API
  const testGetAllCleaningTasks = () => runTest('getAllCleaningTasks', cleaningApi.getAll);
  
  // Test apartments API
  const testGetAllApartments = () => runTest('getAllApartments', apartmentsApi.getAll);
  
  // Test prices API
  const testGetPrices = () => runTest('getPrices', () => pricesApi.getByYear(new Date().getFullYear()));
  
  // Test sync API
  const testSyncData = () => runTest('syncData', () => syncApi.syncData('reservations'));
  
  // Test system API
  const testForceSyncAllData = () => runTest('forceSyncAllData', systemApi.forceSyncAllData);
  
  // Esegui test ping all'avvio della pagina
  useEffect(() => {
    testPing();
  }, []);
  
  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Test API Refactorizzate</h1>
          <Button 
            variant={offline ? "destructive" : "outline"} 
            onClick={toggleOfflineMode}
          >
            {offline ? <WifiOff className="mr-2 h-4 w-4" /> : <Wifi className="mr-2 h-4 w-4" />}
            {offline ? 'Modalità Offline' : 'Modalità Online'}
          </Button>
        </div>
        
        <p className="text-muted-foreground">
          Questa pagina permette di verificare il funzionamento delle API dopo la refactorizzazione.
        </p>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Stato Connessione</CardTitle>
            <CardDescription>Verifica lo stato della connessione al server e al database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={testPing} 
                disabled={isLoading['ping']}
              >
                {isLoading['ping'] ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Signal className="mr-2 h-4 w-4" />}
                Test API Connection
              </Button>
              
              <Button 
                variant="outline" 
                onClick={testDatabaseConnection} 
                disabled={isLoading['database']}
              >
                {isLoading['database'] ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                Test Database
              </Button>
              
              <Button 
                variant="outline" 
                onClick={testServerStatus} 
                disabled={isLoading['serverStatus']}
              >
                {isLoading['serverStatus'] ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Signal className="mr-2 h-4 w-4" />}
                Check Server Status
              </Button>
            </div>
            
            {results['ping'] && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="font-medium">Status API: {' '}
                  <Badge variant={results['ping'].data?.success ? "success" : "destructive"}>
                    {results['ping'].data?.success ? 'Online' : 'Offline'}
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  Risposta ricevuta in {results['ping'].duration}ms alle {results['ping'].timestamp}
                </p>
              </div>
            )}
            
            {results['database'] && (
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="font-medium">Status Database: {' '}
                  <Badge variant={results['database'].data?.success ? "success" : "destructive"}>
                    {results['database'].data?.success ? 'Connesso' : 'Non connesso'}
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  Test completato in {results['database'].duration}ms
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Tabs defaultValue="ping" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="ping">Ping</TabsTrigger>
            <TabsTrigger value="reservations">Prenotazioni</TabsTrigger>
            <TabsTrigger value="cleaning">Pulizie</TabsTrigger>
            <TabsTrigger value="apartments">Appartamenti</TabsTrigger>
            <TabsTrigger value="prices">Prezzi</TabsTrigger>
            <TabsTrigger value="sync">Sincronizzazione</TabsTrigger>
          </TabsList>
          
          {/* Ping API */}
          <TabsContent value="ping" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Ping API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Button onClick={testPing} disabled={isLoading['ping']}>
                      {isLoading['ping'] && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                      Esegui Test Ping
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    {results['ping'] && (
                      <ResultDisplay result={results['ping']} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Reservations API */}
          <TabsContent value="reservations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Reservations API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Button onClick={testGetAllReservations} disabled={isLoading['getAllReservations']}>
                      {isLoading['getAllReservations'] && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                      Carica Tutte le Prenotazioni
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    {results['getAllReservations'] && (
                      <ResultDisplay result={results['getAllReservations']} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Cleaning API */}
          <TabsContent value="cleaning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Cleaning API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Button onClick={testGetAllCleaningTasks} disabled={isLoading['getAllCleaningTasks']}>
                      {isLoading['getAllCleaningTasks'] && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                      Carica Attività di Pulizia
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    {results['getAllCleaningTasks'] && (
                      <ResultDisplay result={results['getAllCleaningTasks']} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Apartments API */}
          <TabsContent value="apartments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Apartments API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Button onClick={testGetAllApartments} disabled={isLoading['getAllApartments']}>
                      {isLoading['getAllApartments'] && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                      Carica Appartamenti
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    {results['getAllApartments'] && (
                      <ResultDisplay result={results['getAllApartments']} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Prices API */}
          <TabsContent value="prices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Prices API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Button onClick={testGetPrices} disabled={isLoading['getPrices']}>
                      {isLoading['getPrices'] && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                      Carica Prezzi Anno Corrente
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    {results['getPrices'] && (
                      <ResultDisplay result={results['getPrices']} />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Sync API */}
          <TabsContent value="sync" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Sync API</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={testSyncData} disabled={isLoading['syncData']}>
                      {isLoading['syncData'] && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                      Sync Reservations
                    </Button>
                    
                    <Button onClick={testForceSyncAllData} disabled={isLoading['forceSyncAllData']}>
                      {isLoading['forceSyncAllData'] && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                      Force Sync All Data
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    {results['syncData'] && (
                      <>
                        <h3 className="font-medium mb-2">Sync Data:</h3>
                        <ResultDisplay result={results['syncData']} />
                      </>
                    )}
                    
                    {results['forceSyncAllData'] && (
                      <>
                        <h3 className="font-medium mb-2 mt-4">Force Sync All Data:</h3>
                        <ResultDisplay result={results['forceSyncAllData']} />
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

// Componente per visualizzare i risultati delle API
const ResultDisplay = ({ result }: { result: any }) => {
  if (result.error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="font-medium text-red-700">Errore: {result.error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p>
          <Badge variant={result.data?.success ? "success" : "destructive"}>
            {result.data?.success ? 'Successo' : 'Errore'}
          </Badge>
          <span className="ml-2 text-sm text-muted-foreground">
            ({result.duration} ms)
          </span>
        </p>
      </div>
      
      <ScrollArea className="h-64 w-full rounded-md border p-4 bg-muted/50">
        <pre className="text-xs font-mono">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      </ScrollArea>
    </div>
  );
};

export default ApiTestPage;
