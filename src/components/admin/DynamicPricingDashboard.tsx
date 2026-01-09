import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Edit, Trash2, Calendar, Euro, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { APARTMENTS } from '@/config/apartments';

interface PricingPeriod {
  id: number;
  apartment_id: number;
  start_date: string;
  end_date: string;
  weekly_price: number;
  season_name: string;
  is_active: boolean;
}

interface QuoteAnalytics {
  totalQuotes: number;
  conversionRate: number;
  averageValue: number;
  recentQuotes: any[];
}

export const DynamicPricingDashboard: React.FC = () => {
  const [selectedApartment, setSelectedApartment] = useState(1);
  const [periods, setPeriods] = useState<PricingPeriod[]>([]);
  const [analytics, setAnalytics] = useState<QuoteAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PricingPeriod | null>(null);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    weekly_price: 0,
    season_name: ''
  });

  // Usa configurazione centralizzata degli appartamenti
  const apartments = APARTMENTS;

  const seasonTypes = [
    { value: 'Bassa', label: 'Bassa Stagione', color: 'bg-blue-100 text-blue-800' },
    { value: 'Media', label: 'Media Stagione', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Alta', label: 'Alta Stagione', color: 'bg-orange-100 text-orange-800' },
    { value: 'Altissima', label: 'Altissima Stagione', color: 'bg-red-100 text-red-800' }
  ];

  const loadPricingPeriods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pricing_periods')
        .select('*')
        .eq('apartment_id', selectedApartment)
        .eq('is_active', true)
        .order('start_date');

      if (error) throw error;
      setPeriods(data || []);
    } catch (error: any) {
      toast.error('Errore nel caricamento prezzi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Carica statistiche preventivi
      const { data: quotes, error } = await supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const totalQuotes = quotes?.length || 0;
      const averageValue = quotes?.reduce((sum, q) => sum + (q.final_total || 0), 0) / totalQuotes || 0;
      
      setAnalytics({
        totalQuotes,
        conversionRate: 0, // Da implementare con logica bookings
        averageValue,
        recentQuotes: quotes?.slice(0, 5) || []
      });
    } catch (error: any) {
      toast.error('Errore nel caricamento delle statistiche: ' + error.message);
    }
  };

  const savePricingPeriod = async () => {
    try {
      if (!formData.start_date || !formData.end_date || !formData.weekly_price || !formData.season_name) {
        toast.error('Compila tutti i campi obbligatori');
        return;
      }

      // Verifica overlap
      const { data: overlapping, error: overlapError } = await supabase
        .from('pricing_periods')
        .select('id')
        .eq('apartment_id', selectedApartment)
        .eq('is_active', true)
        .or(`start_date.lte.${formData.end_date},end_date.gte.${formData.start_date}`)
        .neq('id', editingPeriod?.id || 0);

      if (overlapError) throw overlapError;

      if (overlapping && overlapping.length > 0) {
        toast.error('Periodo sovrapposto con prezzi esistenti');
        return;
      }

      if (editingPeriod) {
        // Update
        const { error } = await supabase
          .from('pricing_periods')
          .update({
            start_date: formData.start_date,
            end_date: formData.end_date,
            weekly_price: formData.weekly_price,
            season_name: formData.season_name,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPeriod.id);

        if (error) throw error;
        toast.success('Periodo aggiornato con successo');
      } else {
        // Insert
        const { error } = await supabase
          .from('pricing_periods')
          .insert({
            apartment_id: selectedApartment,
            start_date: formData.start_date,
            end_date: formData.end_date,
            weekly_price: formData.weekly_price,
            season_name: formData.season_name
          });

        if (error) throw error;
        toast.success('Periodo creato con successo');
      }

      setEditingPeriod(null);
      setFormData({ start_date: '', end_date: '', weekly_price: 0, season_name: '' });
      loadPricingPeriods();
    } catch (error: any) {
      toast.error('Errore nel salvataggio: ' + error.message);
    }
  };

  const deletePeriod = async (id: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo periodo?')) return;

    try {
      const { error } = await supabase
        .from('pricing_periods')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      toast.success('Periodo eliminato');
      loadPricingPeriods();
    } catch (error: any) {
      toast.error('Errore nell\'eliminazione: ' + error.message);
    }
  };

  const editPeriod = (period: PricingPeriod) => {
    setEditingPeriod(period);
    setFormData({
      start_date: period.start_date,
      end_date: period.end_date,
      weekly_price: period.weekly_price,
      season_name: period.season_name
    });
  };

  const copyPricesFromPreviousYear = async () => {
    if (!window.confirm('Copiare i prezzi dall\'anno precedente? Questa operazione sovrascriverà i prezzi esistenti.')) return;

    try {
      setLoading(true);
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;

      // Carica prezzi anno precedente
      const { data: previousPrices, error } = await supabase
        .from('pricing_periods')
        .select('*')
        .eq('apartment_id', selectedApartment)
        .eq('is_active', true)
        .gte('start_date', `${previousYear}-01-01`)
        .lte('end_date', `${previousYear}-12-31`);

      if (error) throw error;

      if (!previousPrices?.length) {
        toast.error('Nessun prezzo trovato per l\'anno precedente');
        return;
      }

      // Disattiva prezzi attuali
      await supabase
        .from('pricing_periods')
        .update({ is_active: false })
        .eq('apartment_id', selectedApartment)
        .eq('is_active', true);

      // Crea nuovi prezzi per l'anno corrente
      const newPrices = previousPrices.map(price => ({
        apartment_id: selectedApartment,
        start_date: price.start_date.replace(previousYear.toString(), currentYear.toString()),
        end_date: price.end_date.replace(previousYear.toString(), currentYear.toString()),
        weekly_price: price.weekly_price,
        season_name: price.season_name
      }));

      const { error: insertError } = await supabase
        .from('pricing_periods')
        .insert(newPrices);

      if (insertError) throw insertError;

      toast.success(`Copiati ${newPrices.length} periodi dall'anno precedente`);
      loadPricingPeriods();
    } catch (error: any) {
      toast.error('Errore nella copia: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeasonBadge = (seasonName: string) => {
    const season = seasonTypes.find(s => s.value === seasonName);
    return (
      <Badge className={season?.color || 'bg-gray-100 text-gray-800'}>
        {season?.label || seasonName}
      </Badge>
    );
  };

  useEffect(() => {
    loadPricingPeriods();
  }, [selectedApartment]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Gestione Prezzi Dinamici
          </h2>
          <p className="text-muted-foreground">Sistema avanzato di pricing stagionale</p>
        </div>
        
        <div className="flex gap-4">
          <Select value={selectedApartment.toString()} onValueChange={(value) => setSelectedApartment(Number(value))}>
            <SelectTrigger className="w-[250px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {apartments.map(apt => (
                <SelectItem key={apt.id} value={apt.id.toString()}>
                  {apt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={copyPricesFromPreviousYear} variant="outline" disabled={loading}>
            Copia da Anno Precedente
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Preventivi Totali</p>
                  <p className="text-2xl font-bold">{analytics.totalQuotes}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valore Medio</p>
                  <p className="text-2xl font-bold">€{Math.round(analytics.averageValue)}</p>
                </div>
                <Euro className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tasso Conversione</p>
                  <p className="text-2xl font-bold">{analytics.conversionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Gestione Prezzi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingPeriod ? 'Modifica Periodo' : 'Nuovo Periodo di Prezzo'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Data Inizio</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end_date">Data Fine</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="weekly_price">Prezzo Settimanale (€)</Label>
              <Input
                id="weekly_price"
                type="number"
                value={formData.weekly_price}
                onChange={(e) => setFormData(prev => ({ ...prev, weekly_price: Number(e.target.value) }))}
                placeholder="400"
              />
            </div>
            
            <div>
              <Label htmlFor="season_name">Stagione</Label>
              <Select 
                value={formData.season_name} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, season_name: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona stagione" />
                </SelectTrigger>
                <SelectContent>
                  {seasonTypes.map(season => (
                    <SelectItem key={season.value} value={season.value}>
                      {season.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={savePricingPeriod} className="flex-1">
                {editingPeriod ? 'Aggiorna' : 'Crea'} Periodo
              </Button>
              {editingPeriod && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingPeriod(null);
                    setFormData({ start_date: '', end_date: '', weekly_price: 0, season_name: '' });
                  }}
                >
                  Annulla
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista Periodi Esistenti */}
        <Card>
          <CardHeader>
            <CardTitle>Periodi di Prezzo Attuali</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Caricamento...</div>
            ) : periods.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p>Nessun periodo di prezzo configurato</p>
              </div>
            ) : (
              <div className="space-y-3">
                {periods.map(period => (
                  <div key={period.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getSeasonBadge(period.season_name)}
                        <span className="font-semibold">€{period.weekly_price}/settimana</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(period.start_date), 'dd MMM', { locale: it })} - 
                        {format(new Date(period.end_date), 'dd MMM yyyy', { locale: it })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ~€{Math.round(period.weekly_price / 7)}/notte
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => editPeriod(period)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deletePeriod(period.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preventivi Recenti */}
      {analytics?.recentQuotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preventivi Recenti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.recentQuotes.map((quote, index) => (
                <div key={quote.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">{quote.guest_name || 'Anonimo'}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(quote.checkin_date), 'dd MMM', { locale: it })} - 
                      {format(new Date(quote.checkout_date), 'dd MMM yyyy', { locale: it })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">€{quote.final_total}</p>
                    <p className="text-xs text-muted-foreground">
                      {quote.adults + quote.children} ospiti
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};