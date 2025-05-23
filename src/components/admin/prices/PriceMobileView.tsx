
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Euro, Edit3, Check, X, Calendar } from 'lucide-react';
import { useCompactPrices } from '@/hooks/useCompactPrices';
import { apartments } from '@/data/apartments';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const PriceMobileView: React.FC = () => {
  const { 
    getSeasonWeeks, 
    getPrice, 
    updatePrice, 
    isLoading 
  } = useCompactPrices();
  
  const [editingCell, setEditingCell] = useState<{ apartmentId: string; weekStart: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const weeks = getSeasonWeeks();

  const getPriceLevel = (price: number) => {
    if (price >= 1000) return { level: 'peak', color: 'bg-red-500', label: 'Peak', textColor: 'text-red-700' };
    if (price >= 700) return { level: 'high', color: 'bg-orange-500', label: 'High', textColor: 'text-orange-700' };
    if (price >= 450) return { level: 'medium', color: 'bg-yellow-500', label: 'Medium', textColor: 'text-yellow-700' };
    return { level: 'low', color: 'bg-green-500', label: 'Low', textColor: 'text-green-700' };
  };

  const startEdit = (apartmentId: string, weekStart: string) => {
    const currentPrice = getPrice(apartmentId, weekStart);
    setEditValue(currentPrice.toString());
    setEditingCell({ apartmentId, weekStart });
  };

  const saveEdit = async () => {
    if (editingCell) {
      const newPrice = parseInt(editValue);
      if (!isNaN(newPrice) && newPrice >= 0) {
        await updatePrice(editingCell.apartmentId, editingCell.weekStart, newPrice);
      }
    }
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Raggruppa settimane per mese
  const weeksByMonth = weeks.reduce((groups, week) => {
    const monthKey = format(week.start, 'yyyy-MM');
    const monthLabel = format(week.start, 'MMMM yyyy', { locale: it });
    
    if (!groups[monthKey]) {
      groups[monthKey] = {
        label: monthLabel,
        weeks: []
      };
    }
    
    groups[monthKey].weeks.push(week);
    return groups;
  }, {} as Record<string, { label: string; weeks: typeof weeks }>);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center gap-2">
          <Euro className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground">Caricamento prezzi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Euro className="h-5 w-5" />
          Prezzi 2025
        </h2>
        <Badge variant="outline" className="text-xs">
          Mobile View
        </Badge>
      </div>

      {/* Legenda compatta */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>€350-449</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>€450-699</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>€700-999</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>€1000+</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accordion per appartamenti */}
      <Accordion type="single" collapsible className="space-y-2">
        {apartments.map(apartment => (
          <AccordionItem 
            key={apartment.id}
            value={apartment.id}
            className="border rounded-lg"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center justify-between w-full mr-2">
                <span className="font-medium">{apartment.name}</span>
                <Badge variant="outline" className="text-xs">
                  {apartment.capacity} posti
                </Badge>
              </div>
            </AccordionTrigger>
            
            <AccordionContent>
              <div className="px-4 pb-4 space-y-4">
                {Object.entries(weeksByMonth).map(([monthKey, monthData]) => (
                  <div key={monthKey}>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2 capitalize flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {monthData.label}
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {monthData.weeks.map((week, idx) => {
                        const price = getPrice(apartment.id, week.startStr);
                        const priceLevel = getPriceLevel(price);
                        const isEditing = editingCell?.apartmentId === apartment.id && 
                                         editingCell?.weekStart === week.startStr;
                        
                        return (
                          <div 
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${priceLevel.color}/10`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${priceLevel.color}`} />
                              <div>
                                <div className="font-medium text-sm">
                                  {format(week.start, 'dd')} - {format(week.end, 'dd MMM', { locale: it })}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {priceLevel.label} Season
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-20 h-8 text-center text-sm"
                                    autoFocus
                                  />
                                  <Button
                                    size="sm"
                                    onClick={saveEdit}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelEdit}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold text-lg ${priceLevel.textColor}`}>
                                    €{price}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEdit(apartment.id, week.startStr)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default PriceMobileView;
