
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface EditPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (price: number) => void;
  apartmentName: string;
  weekStart: Date;
  weekEnd: Date;
  currentPrice: number;
}

const EditPriceModal: React.FC<EditPriceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  apartmentName,
  weekStart,
  weekEnd,
  currentPrice,
}) => {
  const [price, setPrice] = React.useState<number>(currentPrice);
  
  // Reset price when modal opens with new data
  React.useEffect(() => {
    setPrice(currentPrice);
  }, [currentPrice, isOpen]);
  
  const handleSave = () => {
    onSave(price);
    onClose();
  };
  
  const weekFormatted = `${format(weekStart, "d MMM", { locale: it })} - ${format(weekEnd, "d MMM", { locale: it })}`;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifica Prezzo</DialogTitle>
          <DialogDescription>
            {apartmentName} - Settimana {weekFormatted}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="price" className="text-right col-span-1">
              Prezzo:
            </label>
            <div className="flex items-center col-span-3">
              <Input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                className="w-24 text-right"
                autoFocus
              />
              <span className="ml-2">€</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button onClick={handleSave}>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPriceModal;
