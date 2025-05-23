
import * as React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DatabaseStatusChecker from "@/components/admin/database/DatabaseStatusChecker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { testDatabaseConnection } from "@/hooks/cleaning/cleaningStorage";
import { databaseProxy } from "@/services/databaseProxy";
import { DataType } from "@/services/externalStorage";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const DatabaseTestPage = () => {
  const [testResults, setTestResults] = React.useState<string[]>([]);

  // Funzione per eseguire il test della connessione al database
  const runConnectionTest = async () => {
    setTestResults(prev => [...prev, "🔄 Test della connessione al database in corso..."]);
    
    try {
      const isConnected = await testDatabaseConnection();
      
      if (isConnected) {
        setTestResults(prev => [...prev, "✅ Connessione al database riuscita!"]);
      } else {
        setTestResults(prev => [...prev, "❌ Connessione al database fallita!"]);
      }
    } catch (error) {
      console.error("Errore durante il test della connessione:", error);
      setTestResults(prev => [...prev, `❌ Errore durante il test: ${error}`]);
    }
  };

  // Funzione per eseguire il test del caricamento dei dati
  const runDataLoadTest = async () => {
    setTestResults(prev => [...prev, "🔄 Test del caricamento dei dati in corso..."]);
    
    try {
      // Test del caricamento delle prenotazioni
      setTestResults(prev => [...prev, "📥 Caricamento delle prenotazioni..."]);
      const reservations = await databaseProxy.loadData(DataType.RESERVATIONS);
      setTestResults(prev => [
        ...prev, 
        reservations 
          ? `✅ Caricate ${Array.isArray(reservations) ? reservations.length : 1} prenotazioni` 
          : "⚠️ Nessuna prenotazione trovata"
      ]);
      
      // Test del caricamento delle attività di pulizia
      setTestResults(prev => [...prev, "📥 Caricamento delle attività di pulizia..."]);
      const cleaningTasks = await databaseProxy.loadData(DataType.CLEANING_TASKS);
      setTestResults(prev => [
        ...prev, 
        cleaningTasks 
          ? `✅ Caricate ${Array.isArray(cleaningTasks) ? cleaningTasks.length : 1} attività di pulizia` 
          : "⚠️ Nessuna attività di pulizia trovata"
      ]);
    } catch (error) {
      console.error("Errore durante il test del caricamento dei dati:", error);
      setTestResults(prev => [...prev, `❌ Errore durante il test: ${error}`]);
    }
  };

  // Funzione per eseguire il test della sincronizzazione dei dati
  const runSyncTest = async () => {
    setTestResults(prev => [...prev, "🔄 Test della sincronizzazione dei dati in corso..."]);
    
    try {
      // Test della sincronizzazione delle prenotazioni
      setTestResults(prev => [...prev, "🔄 Sincronizzazione delle prenotazioni..."]);
      await databaseProxy.synchronize(DataType.RESERVATIONS);
      setTestResults(prev => [...prev, "✅ Sincronizzazione delle prenotazioni completata"]);
      
      // Test della sincronizzazione delle attività di pulizia
      setTestResults(prev => [...prev, "🔄 Sincronizzazione delle attività di pulizia..."]);
      await databaseProxy.synchronize(DataType.CLEANING_TASKS);
      setTestResults(prev => [...prev, "✅ Sincronizzazione delle attività di pulizia completata"]);
      
      toast.success("Test di sincronizzazione completato con successo!");
    } catch (error) {
      console.error("Errore durante il test della sincronizzazione:", error);
      setTestResults(prev => [...prev, `❌ Errore durante il test: ${error}`]);
      toast.error("Errore durante il test di sincronizzazione");
    }
  };

  // Funzione per eseguire il test completo
  const runCompleteTest = async () => {
    setTestResults(["🔄 Avvio test completo..."]);
    toast.loading("Test completo in corso...");
    
    try {
      // Test della connessione
      await runConnectionTest();
      
      // Test del caricamento dei dati
      await runDataLoadTest();
      
      // Test della sincronizzazione dei dati
      await runSyncTest();
      
      toast.dismiss();
      toast.success("Test completo eseguito con successo!");
    } catch (error) {
      console.error("Errore durante il test completo:", error);
      toast.dismiss();
      toast.error("Errore durante il test completo");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Test Database e Sincronizzazione</h1>
        <p className="text-muted-foreground">
          Questa pagina permette di verificare la connessione al database e la sincronizzazione dei dati
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strumento di verifica dello stato */}
          <DatabaseStatusChecker />
          
          {/* Test interattivi */}
          <Card>
            <CardHeader>
              <CardTitle>Test Interattivi</CardTitle>
              <CardDescription>
                Esegui test specifici per verificare la funzionalità del database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="individual">
                <TabsList className="mb-4">
                  <TabsTrigger value="individual">Test Individuali</TabsTrigger>
                  <TabsTrigger value="complete">Test Completo</TabsTrigger>
                </TabsList>
                
                <TabsContent value="individual" className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={runConnectionTest} variant="outline">
                      Test Connessione
                    </Button>
                    <Button onClick={runDataLoadTest} variant="outline">
                      Test Caricamento Dati
                    </Button>
                    <Button onClick={runSyncTest} variant="outline">
                      Test Sincronizzazione
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="complete">
                  <div className="flex justify-center my-4">
                    <Button onClick={runCompleteTest} variant="default" size="lg">
                      Esegui Test Completo
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              
              <Separator className="my-4" />
              
              {/* Risultati dei test */}
              <div className="bg-muted p-4 rounded-md h-64 overflow-y-auto text-sm">
                <h3 className="font-medium mb-2">Risultati dei test:</h3>
                {testResults.length === 0 ? (
                  <p className="text-muted-foreground">Nessun test eseguito</p>
                ) : (
                  <ul className="space-y-1">
                    {testResults.map((result, index) => (
                      <li key={index} className="font-mono text-xs">{result}</li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DatabaseTestPage;
