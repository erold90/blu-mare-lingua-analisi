
import React from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FamilyGroup {
  adults: number;
  children: number;
  childrenDetails: { isUnder12: boolean; sleepsWithParents: boolean }[];
}

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyGroups: FamilyGroup[];
  groupType: "families" | "couples" | undefined;
  onGroupTypeChange: (value: "families" | "couples") => void;
  onFamilyGroupsChange: (groups: FamilyGroup[]) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const GroupDialog: React.FC<GroupDialogProps> = ({
  open,
  onOpenChange,
  familyGroups,
  groupType,
  onGroupTypeChange,
  onFamilyGroupsChange,
  onConfirm,
  onCancel
}) => {
  // Aggiunge un nuovo gruppo familiare
  const addFamilyGroup = () => {
    onFamilyGroupsChange([...familyGroups, { adults: 2, children: 0, childrenDetails: [] }]);
  };
  
  // Rimuove un gruppo familiare
  const removeFamilyGroup = (index: number) => {
    if (familyGroups.length > 1) {
      const newGroups = [...familyGroups];
      newGroups.splice(index, 1);
      onFamilyGroupsChange(newGroups);
    }
  };
  
  // Aggiorna i dettagli di un gruppo familiare
  const updateFamilyGroup = (index: number, field: 'adults' | 'children', value: number) => {
    const updatedGroups = [...familyGroups];
    updatedGroups[index][field] = value;
    
    // Se cambiamo il numero di bambini, aggiorniamo anche i loro dettagli
    if (field === 'children') {
      let details = updatedGroups[index].childrenDetails || [];
      
      if (value > details.length) {
        // Aggiungiamo nuovi bambini
        const diff = value - details.length;
        for (let i = 0; i < diff; i++) {
          details.push({ isUnder12: true, sleepsWithParents: false });
        }
      } else if (value < details.length) {
        // Rimuoviamo i bambini in eccesso
        details = details.slice(0, value);
      }
      
      updatedGroups[index].childrenDetails = details;
    }
    
    onFamilyGroupsChange(updatedGroups);
  };
  
  // Aggiorna i dettagli di un bambino in un gruppo specifico
  const updateGroupChildDetails = (groupIndex: number, childIndex: number, field: 'isUnder12' | 'sleepsWithParents', value: boolean) => {
    const updatedGroups = [...familyGroups];
    const details = updatedGroups[groupIndex].childrenDetails || [];
    
    details[childIndex][field] = value;
    
    updatedGroups[groupIndex].childrenDetails = details;
    onFamilyGroupsChange(updatedGroups);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Composizione del gruppo</DialogTitle>
          <DialogDescription>
            Specifica la composizione del tuo gruppo per un preventivo più accurato
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 my-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Selezione del tipo di gruppo */}
          <div className="space-y-3">
            <Label>Tipo di gruppo</Label>
            <RadioGroup
              value={groupType || "families"}
              onValueChange={(value) => onGroupTypeChange(value as "families" | "couples")}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="families" id="group-families" />
                <Label htmlFor="group-families" className="cursor-pointer">
                  Famiglie
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="couples" id="group-couples" />
                <Label htmlFor="group-couples" className="cursor-pointer">
                  Coppie
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Lista dei gruppi familiari */}
          <div className="space-y-6">
            {familyGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">
                    {groupType === "couples" ? `Coppia ${groupIndex + 1}` : `Famiglia ${groupIndex + 1}`}
                  </h3>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeFamilyGroup(groupIndex)}
                    className="h-8 px-2 text-destructive"
                    disabled={familyGroups.length <= 1}
                  >
                    Rimuovi
                  </Button>
                </div>
                
                {/* Numero di adulti */}
                <div className="space-y-2">
                  <Label>Adulti</Label>
                  <div className="flex items-center space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={() => {
                        if (group.adults > 1) {
                          updateFamilyGroup(groupIndex, 'adults', group.adults - 1);
                        }
                      }}
                      disabled={group.adults <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      className="w-20 text-center"
                      value={group.adults}
                      readOnly
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={() => updateFamilyGroup(groupIndex, 'adults', group.adults + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Numero di bambini */}
                <div className="space-y-2">
                  <Label>Bambini</Label>
                  <div className="flex items-center space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={() => {
                        if (group.children > 0) {
                          updateFamilyGroup(groupIndex, 'children', group.children - 1);
                        }
                      }}
                      disabled={group.children <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      className="w-20 text-center"
                      value={group.children}
                      readOnly
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={() => updateFamilyGroup(groupIndex, 'children', group.children + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Dettagli dei bambini per questo gruppo */}
                {group.children > 0 && (
                  <div className="space-y-4 mt-2 border-t pt-4">
                    <h4 className="font-medium">Dettagli bambini</h4>
                    {(group.childrenDetails || []).map((child, childIndex) => (
                      <div key={childIndex} className="space-y-4 pt-4 border-t first:border-t-0 first:pt-0">
                        <h5>Bambino {childIndex + 1}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`group-${groupIndex}-is-under-12-${childIndex}`}
                              checked={child.isUnder12}
                              onCheckedChange={(checked) => {
                                updateGroupChildDetails(groupIndex, childIndex, 'isUnder12', checked === true);
                              }}
                            />
                            <Label htmlFor={`group-${groupIndex}-is-under-12-${childIndex}`}>Minore di 12 anni</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`group-${groupIndex}-sleeps-with-parents-${childIndex}`}
                              checked={child.sleepsWithParents}
                              onCheckedChange={(checked) => {
                                updateGroupChildDetails(groupIndex, childIndex, 'sleepsWithParents', checked === true);
                              }}
                            />
                            <Label htmlFor={`group-${groupIndex}-sleeps-with-parents-${childIndex}`}>Dorme con i genitori</Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Pulsante per aggiungere un nuovo gruppo */}
          <Button 
            type="button"
            variant="outline"
            className="flex items-center gap-2"
            onClick={addFamilyGroup}
          >
            <Plus className="h-4 w-4" />
            Aggiungi {groupType === "couples" ? "coppia" : "famiglia"}
          </Button>
          
          {/* Riepilogo */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Riepilogo</h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Totale adulti:</span> {familyGroups.reduce((sum, group) => sum + group.adults, 0)}
              </p>
              <p>
                <span className="font-medium">Totale bambini:</span> {familyGroups.reduce((sum, group) => sum + group.children, 0)}
              </p>
              <p>
                <span className="font-medium">Totale ospiti:</span> {
                  familyGroups.reduce((sum, group) => sum + group.adults + group.children, 0)
                }
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Annulla</Button>
          <Button type="button" onClick={onConfirm}>Conferma</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupDialog;
