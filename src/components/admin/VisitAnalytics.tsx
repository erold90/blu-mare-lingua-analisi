import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, MapPin, Calendar, Users, Eye, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CountryStats {
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  count: number;
}

interface AnalyticsData {
  totalVisits: number;
  visitsByCountry: CountryStats[];
  timeline: Array<{ date: string; visits: number }>;
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export const VisitAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      console.log('📊 Loading analytics for period:', period);
      
      const { data, error } = await supabase.functions.invoke('get-visit-analytics', {
        body: { period }
      });

      if (error) throw error;

      if (data?.success) {
        setAnalytics(data.data);
        console.log('✅ Analytics loaded:', data.data);
      } else {
        throw new Error(data?.error || 'Failed to load analytics');
      }
    } catch (err: any) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const formatCountryFlag = (countryCode: string) => {
    try {
      return String.fromCodePoint(
        ...[...countryCode.toUpperCase()].map(char => 127397 + char.charCodeAt(0))
      );
    } catch {
      return '🌍';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricando statistiche visite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analisi Visite</h2>
          <p className="text-muted-foreground">
            Statistiche geografiche delle visite al sito
          </p>
        </div>
        
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Oggi</SelectItem>
            <SelectItem value="monthly">Questo mese</SelectItem>
            <SelectItem value="yearly">Quest'anno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visite Totali</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {analytics?.totalVisits || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {period === 'daily' ? 'Oggi' : 
               period === 'monthly' ? 'Questo mese' : 
               'Quest\'anno'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paesi Unici</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {analytics?.visitsByCountry?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Paesi di provenienza
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Paese</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {analytics?.visitsByCountry?.[0] ? (
                <span className="flex items-center gap-2">
                  {formatCountryFlag(analytics.visitsByCountry[0].country_code)}
                  {analytics.visitsByCountry[0].count}
                </span>
              ) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.visitsByCountry?.[0]?.country || 'Nessun dato'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* World Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Mappa Mondiale Visite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Mappa Interattiva</h3>
              <p className="text-muted-foreground mb-4">
                Visualizzazione geografica delle visite
              </p>
              <p className="text-sm text-muted-foreground">
                La mappa interattiva sarà implementata in una fase successiva
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Countries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Visite per Paese
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics?.visitsByCountry?.slice(0, 10).map((country, index) => (
              <div key={country.country} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{formatCountryFlag(country.country_code)}</span>
                  <div>
                    <div className="font-semibold">{country.country}</div>
                    <div className="text-sm text-muted-foreground">
                      {country.latitude?.toFixed(2)}, {country.longitude?.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {country.count}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    #{index + 1}
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                Nessun dato disponibile per il periodo selezionato
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Andamento Visite (Ultimi 30 giorni)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Grafico timeline delle visite
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {analytics?.timeline?.length || 0} giorni di dati disponibili
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};