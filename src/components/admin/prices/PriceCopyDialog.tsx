
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useCompactPrices } from "@/hooks/prices/useCompactPrices";

interface PriceCopyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetYear: number;
  apartmentId: string;
}

const PriceCopyDialog: React.FC<PriceCopyDialogProps> = ({
  isOpen,
  onClose,
  targetYear,
  apartmentId
}) => {
  const [sourceYear, setSourceYear] = useState(targetYear - 1);
  const [percentage, setPercentage] = useState("0");
  const [rounding, setRounding] = useState<"up" | "down" | "none">("none");
  const [roundToNearest, setRoundToNearest] = useState("5");
  const [isLoading, setIsLoading] = useState(false);
  
  const { copyPricesFromYear } = useCompactPrices();

  const handleCopyPrices = async () => {
    setIsLoading(true);
    
    try {
      const success = await copyPricesFromYear(
        sourceYear,
        targetYear,
        parseFloat(percentage),
        rounding,
        parseInt(roundToNearest),
        apartmentId
      );
      
      if (success) {
        onClose();
      }
    } catch (error) {
      toast.error("Errore durante la copia dei prezzi");
      console.error("Error copying prices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate valid source years (current year and before)
  const availableSourceYears = [];
  for (let year = 2025; year < targetYear; year++) {
    availableSourceYears.push(year);
  }

  return (
    <Dialog open={isOpen} onOpenChange={value => !value && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copia prezzi da anno precedente</DialogTitle>
          <DialogDescription>
            Copia e adatta i prezzi da un anno precedente all'anno {targetYear}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="source-year" className="text-right">
              Anno sorgente
            </Label>
            <Select 
              value={sourceYear.toString()} 
              onValueChange={value => setSourceYear(parseInt(value))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleziona anno" />
              </SelectTrigger>
              <SelectContent>
                {availableSourceYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="percentage" className="text-right">
              Aumento (%)
            </Label>
            <Input
              id="percentage"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              type="number"
              className="col-span-3"
              min="0"
              max="100"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Arrotondamento
            </Label>
            <RadioGroup 
              defaultValue={rounding}
              value={rounding}
              onValueChange={(value) => setRounding(value as "up" | "down" | "none")}
              className="col-span-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none">Nessuno</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="up" id="up" />
                <Label htmlFor="up">Per eccesso</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="down" id="down" />
                <Label htmlFor="down">Per difetto</Label>
              </div>
            </RadioGroup>
          </div>
          
          {rounding !== "none" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="roundToNearest" className="text-right">
                Multiplo di
              </Label>
              <Input
                id="roundToNearest"
                value={roundToNearest}
                onChange={(e) => setRoundToNearest(e.target.value)}
                type="number"
                className="col-span-3"
                min="1"
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annulla
          </Button>
          <Button onClick={handleCopyPrices} disabled={isLoading}>
            {isLoading ? "Elaborazione..." : "Copia prezzi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PriceCopyDialog;
