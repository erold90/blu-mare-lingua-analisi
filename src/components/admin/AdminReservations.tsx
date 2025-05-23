import * as React from "react";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReservations, Reservation } from "@/hooks/useReservations";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ReservationFormData } from "./reservations/reservationSchema";
import { ReservationDetailsDialog } from "./reservations/ReservationDetailsDialog";
import { MobileReservationCard } from "./reservations/MobileReservationCard";
import { ReservationFormDialog } from "./reservations/ReservationFormDialog";
import { DeleteConfirmationDialog } from "./reservations/DeleteConfirmationDialog";
import { ReservationTable } from "./reservations/ReservationTable";

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
  const [isDeleting, setIsDeleting] = React.useState(false);
  const isMobile = useIsMobile();

  // Find the reservation being edited
  const reservationToEdit = editingId 
    ? reservations.find(r => r.id === editingId) || null 
    : null;

  // Handle manual refresh button click
  const handleRefresh = () => {
    refreshData();
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

  // Function to confirm deletion
  const handleDeleteConfirm = async () => {
    if (reservationToDelete) {
      setIsDeleting(true);
      try {
        await deleteReservation(reservationToDelete);
        toast.success("Prenotazione eliminata con successo!");
        
        // Forza sincronizzazione dopo eliminazione
        await refreshData();
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
          paymentStatus: data.paymentStatus
        });
        toast.success("Prenotazione aggiornata con successo!");
      } else {
        await addReservation({
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
          notes: data.notes
        });
        toast.success("Nuova prenotazione aggiunta con successo!");
      }
      
      // Forza sincronizzazione dopo salvataggio
      await refreshData();
    } catch (error) {
      console.error("Error saving reservation:", error);
      toast.error("Errore nel salvare la prenotazione");
    }
  };

  // Refresh data automaticamente all'inizio
  React.useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-bold">Gestione Prenotazioni</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={handleRefresh} 
            size="sm" 
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            {!isMobile && <span className="ml-2">Sincronizza</span>}
          </Button>
          <Button onClick={handleAddNew} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {!isMobile && "Nuova Prenotazione"}
            {isMobile && "Nuovo"}
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Sincronizzazione in corso...</p>
          </div>
        </div>
      )}

      {/* Mobile view */}
      {!isLoading && isMobile && (
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
      {!isLoading && !isMobile && (
        <ReservationTable 
          reservations={reservations}
          apartments={apartments}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Reservation Form Dialog */}
      <ReservationFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingId={editingId}
        apartments={apartments}
        onSubmit={onSubmit}
        initialData={reservationToEdit}
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

export default AdminReservations;
