
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface QuoteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name?: string) => void;
  onSkip: () => void;
}

const QuoteConfirmationDialog: React.FC<QuoteConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onSkip
}) => {
  const [fullName, setFullName] = useState("");
  
  const handleConfirm = () => {
    // Only pass the name if it's not empty
    if (fullName.trim()) {
      onConfirm(fullName);
    } else {
      onConfirm();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scarica il preventivo</DialogTitle>
          <DialogDescription>
            Inserisci il tuo nome completo per personalizzare il preventivo o scarica senza inserire i tuoi dati.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">
              Nome completo
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Mario Rossi"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onSkip}>
            Scarica senza nome
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Scarica con il mio nome
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteConfirmationDialog;
