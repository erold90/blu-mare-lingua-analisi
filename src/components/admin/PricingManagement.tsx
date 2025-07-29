import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Euro, Copy, Plus, Edit, Trash2, Ban, Settings } from 'lucide-react';
import { usePricing } from '@/hooks/usePricing';
import { apartments } from '@/data/apartments';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';

export const PricingManagement = () => {
  const {
    weeklyPrices,
    dateBlocks,
    seasonConfigs,
    loading,
    fetchWeeklyPrices,
    updateWeeklyPrice,
    generatePricesForYear,
    createDateBlock,
    updateDateBlock,
    deleteeDateBlock,
    createSeasonConfig,
    updateSeasonConfig
  } = usePricing();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedApartment, setSelectedApartment] = useState<string>('all');
  const [editingPrice, setEditingPrice] = useState<any>(null);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [copyFromYear, setCopyFromYear] = useState<number>(selectedYear - 1);
  const [copyToYear, setCopyToYear] = useState<number>(selectedYear + 1);

  // Generate next 10 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const [newBlock, setNewBlock] = useState({
    apartment_id: null as string | null,
    start_date: '',
    end_date: '',
    block_reason: '',
    is_active: true
  });

  useEffect(() => {
    fetchWeeklyPrices(selectedYear, selectedApartment === 'all' ? undefined : selectedApartment);
  }, [selectedYear, selectedApartment]);

  const filteredPrices = weeklyPrices.filter(price => {
    const yearMatch = price.year === selectedYear;
    const apartmentMatch = selectedApartment === 'all' || price.apartment_id === selectedApartment;
    return yearMatch && apartmentMatch;
  });

  const handlePriceUpdate = async (priceId: string, newPrice: number) => {
    console.log('🔄 Aggiornamento prezzo:', { priceId, newPrice });
    const result = await updateWeeklyPrice(priceId, { price: newPrice });
    console.log('✅ Risultato aggiornamento:', result);
    if (result.success) {
      setEditingPrice(null);
      // Forza il refresh dei dati
      await fetchWeeklyPrices(selectedYear, selectedApartment === 'all' ? undefined : selectedApartment);
    } else {
      console.error('❌ Errore aggiornamento prezzo:', result.error);
    }
  };

  const handleGeneratePrices = async () => {
    const result = await generatePricesForYear(copyToYear, copyFromYear);
    if (result.success) {
      setShowCopyDialog(false);
      if (selectedYear === copyToYear) {
        fetchWeeklyPrices(selectedYear, selectedApartment === 'all' ? undefined : selectedApartment);
      }
    }
  };

  const handleCreateBlock = async () => {
    const result = await createDateBlock(newBlock);
    if (result.success) {
      setShowBlockDialog(false);
      setNewBlock({
        apartment_id: null,
        start_date: '',
        end_date: '',
        block_reason: '',
        is_active: true
      });
    }
  };

  const getApartmentName = (apartmentId: string) => {
    const apartment = apartments.find(apt => apt.id === apartmentId);
    return apartment?.name || apartmentId;
  };

  const groupPricesByApartment = () => {
    const grouped: { [key: string]: typeof filteredPrices } = {};
    filteredPrices.forEach(price => {
      if (!grouped[price.apartment_id]) {
        grouped[price.apartment_id] = [];
      }
      grouped[price.apartment_id].push(price);
    });
    return grouped;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestione Prezzi</h2>
        <div className="flex gap-2">
          <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copia Prezzi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Copia Prezzi tra Anni</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Copia da Anno</Label>
                  <Select value={copyFromYear.toString()} onValueChange={(value) => setCopyFromYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Copia in Anno</Label>
                  <Select value={copyToYear.toString()} onValueChange={(value) => setCopyToYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGeneratePrices} className="w-full">
                  Genera Prezzi per {copyToYear}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Ban className="h-4 w-4" />
                Blocca Date
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crea Blocco Date</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Appartamento (vuoto = tutti)</Label>
                  <Select value={newBlock.apartment_id || 'all'} onValueChange={(value) => setNewBlock(prev => ({ ...prev, apartment_id: value === 'all' ? null : value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti gli appartamenti</SelectItem>
                      {apartments.map(apt => (
                        <SelectItem key={apt.id} value={apt.id}>{apt.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data Inizio</Label>
                  <Input
                    type="date"
                    value={newBlock.start_date}
                    onChange={(e) => setNewBlock(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Data Fine</Label>
                  <Input
                    type="date"
                    value={newBlock.end_date}
                    onChange={(e) => setNewBlock(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Motivo Blocco</Label>
                  <Textarea
                    value={newBlock.block_reason}
                    onChange={(e) => setNewBlock(prev => ({ ...prev, block_reason: e.target.value }))}
                    placeholder="Es: Manutenzione, chiusura stagionale..."
                  />
                </div>
                <Button onClick={handleCreateBlock} className="w-full">
                  Crea Blocco
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="prices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prices" className="flex items-center gap-2">
            <Euro className="h-4 w-4" />
            Prezzi Settimanali
          </TabsTrigger>
          <TabsTrigger value="blocks" className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            Blocchi Date
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurazione
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Anno</Label>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Appartamento</Label>
                  <Select value={selectedApartment} onValueChange={setSelectedApartment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti gli appartamenti</SelectItem>
                      {apartments.map(apt => (
                        <SelectItem key={apt.id} value={apt.id}>{apt.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Grid */}
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p>Caricamento prezzi...</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupPricesByApartment()).map(([apartmentId, prices]) => (
                <Card key={apartmentId}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {getApartmentName(apartmentId)}
                      <Badge variant="outline">{prices.length} settimane</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {prices.map((price) => (
                        <Card key={price.id} className="relative">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground">
                                Settimana {price.week_number}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(price.week_start), 'dd MMM', { locale: it })} - {' '}
                                {format(new Date(price.week_end), 'dd MMM', { locale: it })}
                              </div>
                              <div className="flex items-center justify-between">
                                {editingPrice?.id === price.id ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      value={editingPrice.price}
                                      onChange={(e) => setEditingPrice(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                      className="w-20"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handlePriceUpdate(price.id, editingPrice.price)}
                                    >
                                      ✓
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingPrice(null)}
                                    >
                                      ✕
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="text-lg font-bold">€{price.price}</div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingPrice({ id: price.id, price: price.price })}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="blocks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blocchi Date Attivi</CardTitle>
            </CardHeader>
            <CardContent>
              {dateBlocks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nessun blocco date configurato
                </p>
              ) : (
                <div className="space-y-4">
                  {dateBlocks.map((block) => (
                    <div key={block.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {block.apartment_id ? getApartmentName(block.apartment_id) : 'Tutti gli appartamenti'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(block.start_date), 'dd MMMM yyyy', { locale: it })} - {' '}
                          {format(new Date(block.end_date), 'dd MMMM yyyy', { locale: it })}
                        </div>
                        {block.block_reason && (
                          <div className="text-sm text-amber-600">
                            {block.block_reason}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteeDateBlock(block.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurazioni Stagionali</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seasonConfigs.map((config) => (
                  <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Anno {config.year}</div>
                      <div className="text-sm text-muted-foreground">
                        Stagione: {config.season_start_day}/{config.season_start_month} - {config.season_end_day}/{config.season_end_month}
                      </div>
                      <Badge variant={config.is_active ? "default" : "secondary"}>
                        {config.is_active ? "Attiva" : "Inattiva"}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};