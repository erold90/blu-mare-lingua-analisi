
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useAnalyticsCore } from "@/hooks/analytics/useAnalyticsCore";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminLogDeleteProps {
  quoteId: string;
  customerName?: string;
}

const AdminLogDelete: React.FC<AdminLogDeleteProps> = ({ quoteId, customerName }) => {
  const { deleteQuoteLog } = useAnalyticsCore();

  const handleDeleteQuote = async () => {
    try {
      await deleteQuoteLog(quoteId);
      toast.success("Log del preventivo eliminato con successo");
    } catch (error) {
      toast.error("Errore durante l'eliminazione del log");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler eliminare il log del preventivo{customerName ? ` di ${customerName}` : ""}?
            Questa azione non può essere annullata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteQuote} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Elimina
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdminLogDelete;
