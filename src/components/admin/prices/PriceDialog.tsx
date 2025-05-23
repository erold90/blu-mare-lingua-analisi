
import React, { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PriceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (price: number) => void;
  apartmentName: string;
  weekLabel?: string;
  currentPrice: number;
  weekStart?: Date;
  weekEnd?: Date;
}

const PriceDialog: React.FC<PriceDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  apartmentName,
  weekLabel,
  currentPrice,
  weekStart,
  weekEnd
}) => {
  const [price, setPrice] = useState(currentPrice.toString());
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value);
  };
  
  const handleSave = () => {
    const numericPrice = parseInt(price);
    if (!isNaN(numericPrice) && numericPrice >= 0) {
      onSave(numericPrice);
    }
  };
  
  // Generate the week label if weekStart and weekEnd are provided but no weekLabel
  const displayWeekLabel = weekLabel || (weekStart && weekEnd ? 
    `${format(weekStart, "d MMM", { locale: it })} - ${format(weekEnd, "d MMM", { locale: it })}` : 
    "");
  
  return (
    <Dialog open={isOpen} onOpenChange={value => !value && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifica prezzo</DialogTitle>
          <DialogDescription>
            {apartmentName} - {displayWeekLabel}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="price" className="w-24">
              Prezzo (€)
            </Label>
            <Input
              id="price"
              value={price}
              onChange={handlePriceChange}
              type="number"
              min="0"
              className="flex-1"
              autoFocus
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={handleSave}>
            Salva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PriceDialog;
