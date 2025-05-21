
import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PriceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (price: number) => void;
  apartmentName: string;
  weekStart: Date;
  weekEnd: Date;
  currentPrice: number;
}

const PriceDialog: React.FC<PriceDialogProps> = ({
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
    if (isOpen) {
      setPrice(currentPrice);
    }
  }, [isOpen, currentPrice]);
  
  const handleSave = () => {
    onSave(price);
  };
  
  const weekFormatted = `${format(weekStart, "d", { locale: it })} - ${format(weekEnd, "d MMM yyyy", { locale: it })}`;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Modifica Prezzo</DialogTitle>
          <DialogDescription>
            {apartmentName} - {weekFormatted}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="price" className="min-w-[80px]">Prezzo:</Label>
            <div className="flex items-center flex-1">
              <Input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                className="max-w-[120px]"
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

export default PriceDialog;
