
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Apartment } from "@/data/apartments";
import { Edit } from "lucide-react";

interface EditApartmentDialogProps {
  apartment: Apartment;
  onSave: (apartment: Apartment) => void;
}

export const EditApartmentDialog: React.FC<EditApartmentDialogProps> = ({ 
  apartment, 
  onSave 
}) => {
  const [editedApartment, setEditedApartment] = React.useState<Apartment | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setEditedApartment(apartment);
    } else {
      setEditedApartment(null);
    }
  };

  const handleSave = () => {
    if (editedApartment) {
      onSave(editedApartment);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
        >
          <Edit className="h-4 w-4 mr-2" /> Modifica
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica {apartment.name}</DialogTitle>
          <DialogDescription>
            Modifica i dettagli dell'appartamento. Tutti i campi sono modificabili.
          </DialogDescription>
        </DialogHeader>
        
        {editedApartment && (
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={editedApartment.name}
                onChange={(e) => setEditedApartment({
                  ...editedApartment,
                  name: e.target.value
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrizione breve</Label>
              <Input
                id="description"
                value={editedApartment.description}
                onChange={(e) => setEditedApartment({
                  ...editedApartment,
                  description: e.target.value
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="longDescription">Descrizione completa</Label>
              <Textarea
                id="longDescription"
                rows={5}
                value={editedApartment.longDescription || ''}
                onChange={(e) => setEditedApartment({
                  ...editedApartment,
                  longDescription: e.target.value
                })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacità</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={editedApartment.capacity}
                  onChange={(e) => setEditedApartment({
                    ...editedApartment,
                    capacity: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="floor">Piano</Label>
                <Input
                  id="floor"
                  value={editedApartment.floor}
                  onChange={(e) => setEditedApartment({
                    ...editedApartment,
                    floor: e.target.value
                  })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="size">Dimensioni (m²)</Label>
                <Input
                  id="size"
                  type="number"
                  min="1"
                  value={editedApartment.size}
                  onChange={(e) => setEditedApartment({
                    ...editedApartment,
                    size: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Prezzo base</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  value={editedApartment.price}
                  onChange={(e) => setEditedApartment({
                    ...editedApartment,
                    price: parseInt(e.target.value)
                  })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bedrooms">Camere da letto</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="1"
                  value={editedApartment.bedrooms || 1}
                  onChange={(e) => setEditedApartment({
                    ...editedApartment,
                    bedrooms: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="beds">Posti letto</Label>
                <Input
                  id="beds"
                  type="number"
                  min="1"
                  value={editedApartment.beds || editedApartment.capacity}
                  onChange={(e) => setEditedApartment({
                    ...editedApartment,
                    beds: parseInt(e.target.value)
                  })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cleaningFee">Costo pulizie</Label>
                <Input
                  id="cleaningFee"
                  type="number"
                  min="0"
                  value={editedApartment.cleaningFee || 50}
                  onChange={(e) => setEditedApartment({
                    ...editedApartment,
                    cleaningFee: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="view">Vista</Label>
                <Input
                  id="view"
                  value={editedApartment.view}
                  onChange={(e) => setEditedApartment({
                    ...editedApartment,
                    view: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Servizi e caratteristiche</Label>
              <div className="flex flex-wrap gap-4 pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasVeranda" 
                    checked={editedApartment.hasVeranda || false}
                    onCheckedChange={(checked) => setEditedApartment({
                      ...editedApartment,
                      hasVeranda: !!checked
                    })}
                  />
                  <Label htmlFor="hasVeranda">Veranda</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasTerrace" 
                    checked={editedApartment.hasTerrace || false}
                    onCheckedChange={(checked) => setEditedApartment({
                      ...editedApartment,
                      hasTerrace: !!checked
                    })}
                  />
                  <Label htmlFor="hasTerrace">Terrazzo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasAirConditioning" 
                    checked={editedApartment.hasAirConditioning || false}
                    onCheckedChange={(checked) => setEditedApartment({
                      ...editedApartment,
                      hasAirConditioning: !!checked
                    })}
                  />
                  <Label htmlFor="hasAirConditioning">Aria Condizionata</Label>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1">Annulla</Button>
          </DialogClose>
          <Button onClick={handleSave} className="flex-1">Salva modifiche</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
