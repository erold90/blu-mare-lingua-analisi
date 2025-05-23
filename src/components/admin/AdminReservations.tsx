import * as React from "react";
import { toast } from "sonner";
import { Plus, RefreshCw, Info, Database, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReservations, Reservation } from "@/hooks/useReservations";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ReservationFormData } from "./reservations/reservationSchema";
import { ReservationDetailsDialog } from "./reservations/ReservationDetailsDialog";
import { MobileReservationCard } from "./reservations/MobileReservationCard";
import { ReservationFormDialog } from "./reservations/ReservationFormDialog";
import { ReservationSummaryDialog } from "./reservations/ReservationSummaryDialog";
import { DeleteConfirmationDialog } from "./reservations/DeleteConfirmationDialog";
import { ReservationTable } from "./reservations/ReservationTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { databaseProxy } from "@/services/databaseProxy";
import { testDatabaseConnection } from "@/hooks/cleaning/cleaningStorage";

const AdminReservations = () => {
  const { 
    reservations, 
    apartments, 
    addReservation, 
    updateReservation, 
    deleteReservation,
    refreshData,
    isLoading
  } = useReservations();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [reservationToDelete, setReservationToDelete] = React.useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = React.useState<Reservation | null>(null);
  const [summaryReservation, setSummaryReservation] = React.useState<Reservation | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [testingDatabase, setTestingDatabase] = React.useState(false);
  const [dbStatus, setDbStatus] = React.useState<boolean | null>(null);
  const [lastSyncTime, setLastSyncTime] = React.useState<string>("");
  const isMobile = useIsMobile();

  // Find the reservation being edited
  const reservationToEdit = editingId 
    ? reservations.find(r => r.id === editingId) || null 
    : null;

  // Mostra notifica al primo caricamento per informare sulla persistenza
  React.useEffect(() => {
    if (reservations.length > 0) {
      const persistenceInfoKey = 'persistence_info_shown';
      if (!localStorage.getItem(persistenceInfoKey)) {
        toast.info(
          "I dati vengono salvati sia localmente che sul database quando sei online. Usa il pulsante 'Sincronizza' periodicamente.",
          { duration: 6000 }
        );
        localStorage.setItem(persistenceInfoKey, 'true');
      }
    }
  }, [reservations]);
  
  // Aggiorna l'ora dell'ultima sincronizzazione
  React.useEffect(() => {
    const lastSync = localStorage.getItem('last_sync_RESERVATIONS');
    if (lastSync) {
      const date = new Date(parseInt(lastSync));
      setLastSyncTime(date.toLocaleString());
    }
  }, [refreshing]);

  // Handle manual refresh button click - con miglioramento della sincronizzazione
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Prima verifica la connessione al database
      const isConnected = await testDatabaseConnection();
      setDbStatus(isConnected);
      
      if (isConnected) {
        // Se il database è connesso, forza una sincronizzazione completa dal database
        await databaseProxy.synchronize(DataType.RESERVATIONS);
      }
      
      // Poi aggiorna i dati locali (sia in caso di database connesso che non)
      await refreshData();
      
      // Aggiorna timestamp dell'ultima sincronizzazione
      const now = Date.now();
      localStorage.setItem('last_sync_RESERVATIONS', now.toString());
      setLastSyncTime(new Date(now).toLocaleString());
      
      toast.success("Dati aggiornati con successo");
    } catch (error) {
      console.error("Error in manual refresh:", error);
      toast.error("Errore durante l'aggiornamento dei dati");
    } finally {
      setRefreshing(false);
    }
  };

  // Handle database test button click - con miglioramento del feedback
  const handleDatabaseTest = async () => {
    setTestingDatabase(true);
    try {
      const isConnected = await testDatabaseConnection();
      setDbStatus(isConnected);
      
      if (isConnected) {
        toast.success("Connessione al database riuscita! Avvio sincronizzazione...");
        
        // Se la connessione è ok, forza una sincronizzazione completa
        await databaseProxy.synchronizeAll();
        
        // Poi aggiorna i dati locali
        await refreshData();
        
        // Aggiorna timestamp dell'ultima sincronizzazione
        const now = Date.now();
        localStorage.setItem('last_sync_RESERVATIONS', now.toString());
        setLastSyncTime(new Date(now).toLocaleString());
        
        toast.success("Sincronizzazione completata con successo");
      } else {
        toast.error("Connessione al database fallita. I dati sono disponibili solo su questo dispositivo.");
      }
    } catch (error) {
      console.error("Error testing database connection:", error);
      setDbStatus(false);
      toast.error("Errore nel test della connessione al database");
    } finally {
      setTestingDatabase(false);
    }
  };

  // Function to open dialog for adding a new reservation
  const handleAddNew = () => {
    setEditingId(null);
    setIsDialogOpen(true);
  };

  // Function to open dialog for editing a reservation
  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsDialogOpen(true);
  };

  // Function to view reservation summary
  const handleViewSummary = (reservation: Reservation) => {
    setSummaryReservation(reservation);
    setIsSummaryDialogOpen(true);
  };

  // Function to confirm deletion
  const handleDeleteConfirm = async () => {
    if (reservationToDelete) {
      setIsDeleting(true);
      try {
        await deleteReservation(reservationToDelete);
        toast.success("Prenotazione eliminata con successo!");
      } catch (error) {
        console.error("Error deleting reservation:", error);
        toast.error("Errore durante l'eliminazione della prenotazione");
      } finally {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        setReservationToDelete(null);
      }
    }
  };

  // Function to handle deletion process
  const handleDelete = (id: string) => {
    setReservationToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Function to view reservation details (mobile only)
  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
  };

  // Function to handle form submission
  const onSubmit = async (data: ReservationFormData) => {
    try {
      setIsDialogOpen(false); // Chiudi il dialogo prima, per una UX migliore

      if (editingId) {
        await updateReservation({
          ...data,
          id: editingId,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
          guestName: data.guestName,
          adults: data.adults,
          children: data.children,
          cribs: data.cribs,
          hasPets: data.hasPets,
          apartmentIds: data.apartmentIds,
          finalPrice: data.finalPrice,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          hasLinen: data.hasLinen
        });
        toast.success("Prenotazione aggiornata con successo!");
        
        // Show summary after successful update
        const updatedReservation = {
          ...data,
          id: editingId,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
        };
        handleViewSummary(updatedReservation);
      } else {
        const newReservation = {
          guestName: data.guestName,
          adults: data.adults,
          children: data.children,
          cribs: data.cribs,
          hasPets: data.hasPets,
          apartmentIds: data.apartmentIds,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
          finalPrice: data.finalPrice,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus,
          depositAmount: data.depositAmount,
          notes: data.notes,
          hasLinen: data.hasLinen
        };
        
        await addReservation(newReservation);
        toast.success("Nuova prenotazione aggiunta con successo!");
        
        // Find the newly added reservation and show summary
        await refreshData();
        const latestReservation = reservations.find(r => 
          r.guestName === data.guestName && 
          r.startDate === data.startDate.toISOString()
        );
        if (latestReservation) {
          handleViewSummary(latestReservation);
        }
        
        // Dopo un'aggiunta, forza una sincronizzazione immediata
        if (dbStatus) {
          // Piccolo timeout per dare tempo all'operazione precedente di completarsi
          setTimeout(async () => {
            try {
              await databaseProxy.synchronize(DataType.RESERVATIONS);
              
              // Aggiorna timestamp dell'ultima sincronizzazione
              const now = Date.now();
              localStorage.setItem('last_sync_RESERVATIONS', now.toString());
              setLastSyncTime(new Date(now).toLocaleString());
            } catch (syncError) {
              console.error("Error syncing after add:", syncError);
            }
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error saving reservation:", error);
      toast.error("Errore nel salvare la prenotazione");
    }
  };

  // Refresh data automaticamente all'inizio e mostra i logs dell'operazione
  React.useEffect(() => {
    console.log("AdminReservations mounted, refreshing data...");
    
    // Carica lo stato dell'ultima sincronizzazione
    const lastSync = localStorage.getItem('last_sync_RESERVATIONS');
    if (lastSync) {
      const date = new Date(parseInt(lastSync));
      setLastSyncTime(date.toLocaleString());
    }
    
    refreshData()
      .then(() => console.log("Initial data refresh successful"))
      .catch(err => console.error("Error in initial data refresh:", err));
      
    // Testa la connessione al database all'avvio
    testDatabaseConnection()
      .then(isConnected => {
        setDbStatus(isConnected);
        
        // Se siamo connessi al DB, assicurati che i dati siano sincronizzati
        if (isConnected) {
          // Piccolo ritardo per non sovraccaricare l'avvio
          setTimeout(async () => {
            try {
              await databaseProxy.synchronize(DataType.RESERVATIONS);
              
              // Aggiorna i dati locali dopo la sincronizzazione
              refreshData()
                .then(() => {
                  console.log("Data refreshed after sync");
                  
                  // Aggiorna timestamp dell'ultima sincronizzazione
                  const now = Date.now();
                  localStorage.setItem('last_sync_RESERVATIONS', now.toString());
                  setLastSyncTime(new Date(now).toLocaleString());
                })
                .catch(err => console.error("Error refreshing after sync:", err));
            } catch (syncError) {
              console.error("Error in initial sync:", syncError);
            }
          }, 1000);
        }
      })
      .catch(err => {
        console.error("Error in initial database test:", err);
        setDbStatus(false);
      });
      
    // Imposta un intervallo per verificare periodicamente la connessione al database
    const dbCheckInterval = setInterval(() => {
      testDatabaseConnection()
        .then(isConnected => {
          if (isConnected !== dbStatus) {
            setDbStatus(isConnected);
            
            // Se lo stato è cambiato da disconnesso a connesso, sincronizza
            if (isConnected && !dbStatus) {
              toast.info("Connessione al database ripristinata. Sincronizzazione in corso...");
              
              // Forza una sincronizzazione
              databaseProxy.synchronize(DataType.RESERVATIONS)
                .then(() => {
                  // Aggiorna timestamp dell'ultima sincronizzazione
                  const now = Date.now();
                  localStorage.setItem('last_sync_RESERVATIONS', now.toString());
                  setLastSyncTime(new Date(now).toLocaleString());
                  
                  // Ricarica i dati
                  return refreshData();
                })
                .then(() => toast.success("Sincronizzazione completata con successo"))
                .catch(err => {
                  console.error("Error in automatic sync after reconnection:", err);
                  toast.error("Errore nella sincronizzazione automatica");
                });
            }
          }
        })
        .catch(err => console.error("Error in periodic database check:", err));
    }, 60000); // Verifica ogni minuto
    
    // Cleanup dell'intervallo
    return () => {
      clearInterval(dbCheckInterval);
    };
  }, [refreshData, dbStatus]);

  // Log quando le prenotazioni cambiano
  React.useEffect(() => {
    console.log("Reservations updated:", reservations);
  }, [reservations]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-bold">Gestione Prenotazioni</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={handleDatabaseTest} 
            size="sm" 
            variant="outline"
            disabled={testingDatabase}
            className={cn(
              "bg-blue-50 hover:bg-blue-100 border-blue-200",
              dbStatus === true && "bg-green-50 hover:bg-green-100 border-green-200"
            )}
          >
            <Database className={cn(
              "h-4 w-4", 
              testingDatabase && "animate-pulse",
              dbStatus === true ? "text-green-600" : 
              dbStatus === false ? "text-red-600" : 
              "text-blue-600"
            )} />
            {!isMobile && <span className="ml-2">Test Database</span>}
          </Button>
          <Button 
            onClick={handleRefresh} 
            size="sm" 
            variant="outline"
            disabled={isLoading || refreshing}
          >
            <RefreshCw className={cn("h-4 w-4", (isLoading || refreshing) && "animate-spin")} />
            {!isMobile && <span className="ml-2">Sincronizza</span>}
          </Button>
          <Button onClick={handleAddNew} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {!isMobile && "Nuova Prenotazione"}
            {isMobile && "Nuovo"}
          </Button>
        </div>
      </div>

      {/* Avviso di stato connessione con feedback migliorato */}
      <Alert 
        variant="default" 
        className={cn(
          "border",
          dbStatus === true ? "bg-green-50 border-green-200" : 
          dbStatus === false ? "bg-red-50 border-red-200" : 
          "bg-blue-50 border-blue-200"
        )}
      >
        <Info className={cn(
          "h-4 w-4", 
          dbStatus === true ? "text-green-500" : 
          dbStatus === false ? "text-red-500" : 
          "text-blue-500"
        )} />
        <AlertDescription className={cn(
          "text-sm flex flex-col gap-1",
          dbStatus === true ? "text-green-700" : 
          dbStatus === false ? "text-red-700" : 
          "text-blue-700"
        )}>
          <span>
            {dbStatus === true ? (
              "Database MySQL connesso. I dati vengono sincronizzati correttamente tra dispositivi."
            ) : dbStatus === false ? (
              "Database MySQL non raggiungibile. I dati sono salvati solo localmente e non saranno visibili su altri dispositivi."
            ) : (
              "Stato del database in verifica... clicca 'Test Database' per verificare la connessione."
            )}
          </span>
          
          {lastSyncTime && (
            <span className="text-xs opacity-75">
              Ultima sincronizzazione: {lastSyncTime}
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Loading indicator */}
      {(isLoading || refreshing) && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Sincronizzazione in corso...</p>
          </div>
        </div>
      )}

      {/* Mobile view */}
      {!(isLoading || refreshing) && isMobile && (
        <div className="mt-4">
          {reservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessuna prenotazione trovata
            </div>
          ) : (
            reservations.map(reservation => (
              <MobileReservationCard
                key={reservation.id}
                reservation={reservation}
                apartments={apartments}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
                onViewSummary={handleViewSummary}
              />
            ))
          )}
          
          {/* Mobile reservation details dialog */}
          <ReservationDetailsDialog 
            reservation={selectedReservation}
            apartments={apartments}
            onClose={() => setSelectedReservation(null)}
            onEdit={handleEdit}
          />
        </div>
      )}

      {/* Desktop view */}
      {!(isLoading || refreshing) && !isMobile && (
        <ReservationTable 
          reservations={reservations}
          apartments={apartments}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewSummary={handleViewSummary}
        />
      )}

      {/* Debug info con miglioramenti */}
      <div className="mt-4 p-4 bg-gray-50 rounded-md text-xs">
        <p className="font-medium">Stato sincronizzazione:</p>
        <p>Numero prenotazioni: {reservations.length}</p>
        <p>Stato database: {dbStatus === true ? "Connesso ✓" : dbStatus === false ? "Non connesso ✗" : "Non verificato ?"}</p>
        <p>Dati salvati persistentemente: Sì (localStorage e MySQL quando disponibile)</p>
        {lastSyncTime && <p>Ultima sincronizzazione: {lastSyncTime}</p>}
      </div>

      {/* Reservation Form Dialog */}
      <ReservationFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingId={editingId}
        apartments={apartments}
        onSubmit={onSubmit}
        initialData={reservationToEdit}
      />

      {/* Reservation Summary Dialog */}
      <ReservationSummaryDialog
        isOpen={isSummaryDialogOpen}
        onOpenChange={setIsSummaryDialogOpen}
        reservation={summaryReservation}
        apartments={apartments}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

import { DataType } from "@/services/externalStorage";
export default AdminReservations;
