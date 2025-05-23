
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompactPrices } from "@/hooks/prices/useCompactPrices";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface PriceCopyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetYear: number;
  apartmentId?: string;
}

const PriceCopyDialog: React.FC<PriceCopyDialogProps> = ({
  isOpen,
  onClose,
  targetYear,
  apartmentId
}) => {
  const [sourceYear, setSourceYear] = useState<number>(2025);
  const [percentIncrease, setPercentIncrease] = useState<string>("0");
  const [rounding, setRounding] = useState<string>("none");
  const [roundToNearest, setRoundToNearest] = useState<string>("5");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { copyPricesFromYear, initializeDefaultPrices } = useCompactPrices();
  
  const handleCopyPrices = async () => {
    setIsLoading(true);
    try {
      const percent = parseInt(percentIncrease, 10);
      const roundTo = parseInt(roundToNearest, 10);
      
      await copyPricesFromYear(
        sourceYear, 
        targetYear, 
        percent, 
        rounding as 'up' | 'down' | 'none', 
        roundTo,
        apartmentId
      );
      
      onClose();
    } catch (error) {
      console.error("Error copying prices:", error);
      toast.error("Errore durante la copia dei prezzi");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInitializeDefaultPrices = async () => {
    setIsLoading(true);
    try {
      await initializeDefaultPrices(targetYear);
      toast.success(`Prezzi standard inizializzati per l'anno ${targetYear}`);
      onClose();
    } catch (error) {
      console.error("Error initializing default prices:", error);
      toast.error("Errore durante l'inizializzazione dei prezzi");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={value => !value && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Copia Prezzi</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Inizializza prezzi per {targetYear}</Label>
            <Button 
              onClick={handleInitializeDefaultPrices} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Inizializzazione...
                </>
              ) : (
                "Inizializza prezzi standard"
              )}
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Oppure</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sourceYear">Copia da anno</Label>
            <Select
              value={sourceYear.toString()}
              onValueChange={(value) => setSourceYear(parseInt(value, 10))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona anno origine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="percentIncrease">Aumento percentuale</Label>
            <div className="flex items-center">
              <Input
                id="percentIncrease"
                type="number"
                value={percentIncrease}
                onChange={(e) => setPercentIncrease(e.target.value)}
                className="flex-1"
              />
              <span className="ml-2">%</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rounding">Arrotondamento</Label>
            <Select
              value={rounding}
              onValueChange={(value) => setRounding(value)}
            >
              <SelectTrigger id="rounding">
                <SelectValue placeholder="Tipo arrotondamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessuno</SelectItem>
                <SelectItem value="up">Per eccesso</SelectItem>
                <SelectItem value="down">Per difetto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="roundToNearest">Arrotonda al più vicino</Label>
            <Select
              value={roundToNearest}
              onValueChange={(value) => setRoundToNearest(value)}
            >
              <SelectTrigger id="roundToNearest">
                <SelectValue placeholder="Arrotonda al" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5€</SelectItem>
                <SelectItem value="10">10€</SelectItem>
                <SelectItem value="25">25€</SelectItem>
                <SelectItem value="50">50€</SelectItem>
                <SelectItem value="100">100€</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleCopyPrices}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Copia in corso...
              </>
            ) : (
              "Copia Prezzi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PriceCopyDialog;
