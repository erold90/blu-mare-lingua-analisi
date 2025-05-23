
import React, { useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Pencil, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apartments } from '@/data/apartments';
import { usePriceManagement } from '@/hooks/usePriceManagement';

const PriceGrid: React.FC = () => {
  const { getPriceForWeek, updatePrice, getSeasonWeeks } = usePriceManagement();
  const [editingCell, setEditingCell] = useState<{ apartmentId: string; weekStart: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const weeks = getSeasonWeeks();

  const handleEditStart = (apartmentId: string, weekStart: string) => {
    const currentPrice = getPriceForWeek(apartmentId, weekStart);
    setEditValue(currentPrice.toString());
    setEditingCell({ apartmentId, weekStart });
  };

  const handleEditSave = async () => {
    if (editingCell && editValue) {
      const price = parseInt(editValue);
      if (!isNaN(price) && price >= 0) {
        await updatePrice(editingCell.apartmentId, editingCell.weekStart, price);
      }
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const getPriceLevel = (price: number) => {
    if (price >= 1000) return 'alta';
    if (price >= 600) return 'media-alta';
    if (price >= 400) return 'media';
    return 'bassa';
  };

  const getPriceLevelColor = (level: string) => {
    switch (level) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media-alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'bassa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-lg font-semibold">Prezzi Stagione 2025</h3>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">Bassa stagione</Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Media stagione</Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-700">Alta stagione</Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700">Altissima stagione</Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {apartments.map(apartment => (
          <Card key={apartment.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Euro className="h-4 w-4" />
                {apartment.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {weeks.map((week, idx) => {
                  const price = getPriceForWeek(apartment.id, week.startStr);
                  const priceLevel = getPriceLevel(price);
                  const isEditing = editingCell?.apartmentId === apartment.id && editingCell?.weekStart === week.startStr;
                  
                  return (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg border transition-all hover:shadow-sm ${getPriceLevelColor(priceLevel)}`}
                    >
                      <div className="text-xs font-medium mb-1">
                        {format(week.start, 'd MMM', { locale: it })} - {format(week.end, 'd MMM', { locale: it })}
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={handleEditSave}
                              className="h-6 text-xs px-2"
                            >
                              Salva
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleEditCancel}
                              className="h-6 text-xs px-2"
                            >
                              Annulla
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{price}€</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStart(apartment.id, week.startStr)}
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PriceGrid;
