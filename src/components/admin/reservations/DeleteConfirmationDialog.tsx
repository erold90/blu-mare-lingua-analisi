
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmationDialog = ({ 
  isOpen, 
  onOpenChange, 
  onConfirm,
  isDeleting = false
}: DeleteConfirmationDialogProps) => {
  const isMobile = useIsMobile();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "w-[95vw] p-4" : ""}>
        <DialogHeader>
          <DialogTitle>Conferma Eliminazione</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler eliminare questa prenotazione? Questa azione non può essere annullata.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className={isMobile ? "w-full" : ""}
            disabled={isDeleting}
          >
            Annulla
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            className={isMobile ? "w-full" : ""}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center">
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Eliminazione...
              </div>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
