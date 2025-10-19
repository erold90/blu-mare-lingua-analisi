import React, { useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useReservations, Reservation } from '@/hooks/useReservations';
import { toast } from 'sonner';
import { AddReservationModal } from './AddReservationModal';
import { EditReservationModal } from './EditReservationModal';

export function ReservationsList() {
  const { reservations, loading, deleteReservation } = useReservations();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deletingId) return;

    const { error } = await deleteReservation(deletingId);
    
    if (error) {
      toast.error('Errore durante l\'eliminazione della prenotazione');
    } else {
      toast.success('Prenotazione eliminata con successo');
    }
    
    setDeletingId(null);
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      paid: { variant: 'default', label: 'Pagato' },
      deposit: { variant: 'secondary', label: 'Acconto' },
      notPaid: { variant: 'destructive', label: 'Non Pagato' },
    };
    
    const config = variants[status] || variants.notPaid;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tutte le Prenotazioni</h2>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Aggiungi Prenotazione
        </Button>
      </div>

      {reservations.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Nessuna prenotazione trovata
        </p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ospite</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Appartamenti</TableHead>
                <TableHead>Ospiti</TableHead>
                <TableHead>Prezzo</TableHead>
                <TableHead>Stato Pagamento</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => {
                const apartmentIds = Array.isArray(reservation.apartment_ids) 
                  ? reservation.apartment_ids 
                  : [];
                
                return (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">{reservation.guest_name}</TableCell>
                    <TableCell>{reservation.guest_phone || '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(reservation.start_date), 'dd MMM', { locale: it })} - 
                      {format(new Date(reservation.end_date), 'dd MMM yyyy', { locale: it })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {apartmentIds.map((id: string) => (
                          <Badge key={id} variant="outline">
                            {id.replace('appartamento-', 'App. ')}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {reservation.adults} A
                      {reservation.children > 0 && `, ${reservation.children} B`}
                      {reservation.cribs > 0 && `, ${reservation.cribs} C`}
                    </TableCell>
                    <TableCell className="font-semibold">
                      €{reservation.final_price?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(reservation.payment_status || 'notPaid')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingReservation(reservation)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingId(reservation.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AddReservationModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen}
      />

      {editingReservation && (
        <EditReservationModal
          reservation={editingReservation}
          open={!!editingReservation}
          onOpenChange={(open) => !open && setEditingReservation(null)}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa prenotazione? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
