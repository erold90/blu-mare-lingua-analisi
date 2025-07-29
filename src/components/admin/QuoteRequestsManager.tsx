import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Receipt, 
  Calendar, 
  Users, 
  Home, 
  Heart, 
  Bed, 
  Euro,
  MessageCircle,
  Filter,
  Eye,
  TrendingDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface QuoteRequest {
  id: number;
  checkin_date: string;
  checkout_date: string;
  adults: number;
  children: number;
  children_no_bed: number;
  selected_apartments: number[];
  has_pet: boolean;
  pet_apartment: number | null;
  linen_requested: boolean;
  base_total: number;
  discount_total: number;
  extras_total: number;
  final_total: number;
  whatsapp_sent: boolean;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  created_at: string;
}

export const QuoteRequestsManager: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'abandoned'>('all');

  const apartmentNames = {
    1: "Appartamento 1 (6 posti)",
    2: "Appartamento 2 (8 posti)", 
    3: "Appartamento 3 (4 posti)",
    4: "Appartamento 4 (5 posti)"
  };

  const loadQuotes = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'completed') {
        query = query.eq('whatsapp_sent', true);
      } else if (filter === 'abandoned') {
        query = query.eq('whatsapp_sent', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      setQuotes(data || []);
      console.log('📊 Quotes loaded:', data?.length);
    } catch (err: any) {
      console.error('Error loading quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [filter]);

  const getStatusBadge = (quote: QuoteRequest) => {
    if (quote.whatsapp_sent) {
      return <Badge className="bg-green-500">Inviato WhatsApp</Badge>;
    } else if (quote.guest_name) {
      return <Badge variant="secondary">Completato</Badge>;
    } else {
      return <Badge variant="destructive">Abbandonato</Badge>;
    }
  };

  const calculateNights = (checkin: string, checkout: string) => {
    const start = new Date(checkin);
    const end = new Date(checkout);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getConversionStats = () => {
    const total = quotes.length;
    const completed = quotes.filter(q => q.whatsapp_sent).length;
    const abandoned = total - completed;
    const conversionRate = total > 0 ? (completed / total * 100).toFixed(1) : '0';
    
    return { total, completed, abandoned, conversionRate };
  };

  const stats = getConversionStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricando preventivi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Preventivi Richiesti</h2>
          <p className="text-muted-foreground">
            Analisi dei preventivi generati dai visitatori
          </p>
        </div>
        
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtra preventivi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i preventivi</SelectItem>
            <SelectItem value="completed">Completati</SelectItem>
            <SelectItem value="abandoned">Abbandonati</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preventivi Totali</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completati</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abbandonati</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.abandoned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasso Conversione</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Quotes List */}
      <div className="space-y-4">
        {quotes.map((quote) => (
          <Card key={quote.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    #{quote.id}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(quote.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                  </div>
                  {getStatusBadge(quote)}
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">€{quote.final_total}</div>
                  <div className="text-sm text-muted-foreground">
                    {calculateNights(quote.checkin_date, quote.checkout_date)} notti
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-semibold flex items-center gap-1 mb-1">
                    <Calendar className="h-4 w-4" />
                    Soggiorno
                  </div>
                  <div>{format(new Date(quote.checkin_date), 'dd/MM', { locale: it })} - {format(new Date(quote.checkout_date), 'dd/MM/yyyy', { locale: it })}</div>
                </div>

                <div>
                  <div className="font-semibold flex items-center gap-1 mb-1">
                    <Users className="h-4 w-4" />
                    Ospiti
                  </div>
                  <div>{quote.adults} adulti, {quote.children} bambini</div>
                </div>

                <div>
                  <div className="font-semibold flex items-center gap-1 mb-1">
                    <Home className="h-4 w-4" />
                    Appartamenti
                  </div>
                  <div className="space-y-1">
                    {quote.selected_apartments.map(aptId => (
                      <div key={aptId} className="text-xs">
                        {apartmentNames[aptId as keyof typeof apartmentNames]}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-semibold flex items-center gap-1 mb-1">
                    <Euro className="h-4 w-4" />
                    Dettagli Prezzo
                  </div>
                  <div className="text-xs space-y-1">
                    <div>Base: €{quote.base_total}</div>
                    <div className="text-green-600">Sconto: -€{quote.discount_total}</div>
                    <div>Extra: €{quote.extras_total}</div>
                  </div>
                </div>
              </div>

              {/* Servizi Extra */}
              {(quote.has_pet || quote.linen_requested) && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm font-semibold mb-2">Servizi Aggiuntivi:</div>
                  <div className="flex gap-4 text-sm">
                    {quote.has_pet && (
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        Animale domestico
                      </div>
                    )}
                    {quote.linen_requested && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        Biancheria
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Guest Info */}
              {quote.guest_name && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm font-semibold mb-2">Dati Ospite:</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>Nome: {quote.guest_name}</div>
                    {quote.guest_email && <div>Email: {quote.guest_email}</div>}
                    {quote.guest_phone && <div>Tel: {quote.guest_phone}</div>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {quotes.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessun Preventivo</h3>
              <p className="text-muted-foreground">
                {filter === 'all' ? 'Non ci sono preventivi da mostrare.' :
                 filter === 'completed' ? 'Non ci sono preventivi completati.' :
                 'Non ci sono preventivi abbandonati.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};