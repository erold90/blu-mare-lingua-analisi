import * as React from "react";
import { toast } from "sonner";
import { Plus, RefreshCw, FileText } from "lucide-react";
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
import { AdminFilters } from "./shared/AdminFilters";
import { useAdminFilters } from "@/hooks/admin/useAdminFilters";
import { checkReservationConflicts } from "@/utils/admin/dateValidation";
import { generateReservationsPdf } from "@/utils/pdf/reservationsPdf";

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
  
  // Filtri
  const { filters, setFilters, filteredData } = useAdminFilters(reservations);
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [reservationToDelete, setReservationToDelete] = React.useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = React.useState<Reservation | null>(null);
  const [summaryReservation, setSummaryReservation] = React.useState<Reservation | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const isMobile = useIsMobile();

  // Find the reservation being edited
  const reservationToEdit = editingId 
    ? reservations.find(r => r.id === editingId) || null 
    : null;

  // Handle manual refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error("Error in manual refresh:", error);
      toast.error("Errore durante l'aggiornamento dei dati");
    } finally {
      setRefreshing(false);
    }
  };

  // Handle PDF generation
  const handleGeneratePdf = () => {
    try {
      generateReservationsPdf(reservations, apartments);
      toast.success("PDF generato con successo!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Errore nella generazione del PDF");
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

  // Function to handle form submission with conflict validation
  const onSubmit = async (data: ReservationFormData) => {
    try {
      // Verifica conflitti prima di salvare
      const { hasConflict, conflictingReservations } = checkReservationConflicts(
        {
          apartmentIds: data.apartmentIds,
          startDate: data.startDate,
          endDate: data.endDate,
          id: editingId || undefined
        },
        reservations
      );

      if (hasConflict) {
        const conflictMessages = conflictingReservations.map(res => 
          `${res.guestName} (${res.startDate} - ${res.endDate})`
        ).join(', ');
        toast.error(`Conflitto rilevato con: ${conflictMessages}`);
        return;
      }

      setIsDialogOpen(false);

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
        const updatedReservation: Reservation = {
          id: editingId,
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
      }
    } catch (error) {
      console.error("Error saving reservation:", error);
      toast.error("Errore nel salvare la prenotazione");
    }
  };

  // Load data on mount
  React.useEffect(() => {
    refreshData()
      .then(() => console.log("Initial data refresh successful"))
      .catch(err => console.error("Error in initial data refresh:", err));
  }, [refreshData]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold">Gestione Prenotazioni</h2>
          <p className="text-sm text-muted-foreground">
            {filteredData.length} di {reservations.length} prenotazioni
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleGeneratePdf} 
            size="sm" 
            variant="outline"
            disabled={reservations.length === 0}
          >
            <FileText className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Esporta PDF</span>}
          </Button>
          <Button 
            onClick={handleRefresh} 
            size="sm" 
            variant="outline"
            disabled={isLoading || refreshing}
          >
            <RefreshCw className={cn("h-4 w-4", (isLoading || refreshing) && "animate-spin")} />
            {!isMobile && <span className="ml-2">Aggiorna</span>}
          </Button>
          <Button onClick={handleAddNew} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {!isMobile && "Nuova Prenotazione"}
            {isMobile && "Nuovo"}
          </Button>
        </div>
      </div>

      {/* Filtri */}
      <AdminFilters
        filters={filters}
        onFiltersChange={setFilters}
        apartments={apartments}
        placeholder="Cerca per nome ospite..."
        showPaymentStatus={true}
        showDateRange={true}
        showApartments={true}
        showGuestName={false} // Già coperto dalla search
      />

      {/* Loading indicator */}
      {(isLoading || refreshing) && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Caricamento...</p>
          </div>
        </div>
      )}

      {/* Mobile view */}
      {!(isLoading || refreshing) && isMobile && (
        <div className="mt-4">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {reservations.length === 0 ? "Nessuna prenotazione trovata" : "Nessuna prenotazione corrisponde ai filtri"}
            </div>
          ) : (
            filteredData.map(reservation => (
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
          reservations={filteredData}
          apartments={apartments}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewSummary={handleViewSummary}
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

export default AdminReservations;
