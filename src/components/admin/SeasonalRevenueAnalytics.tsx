import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { useSeasonalRevenue, SeasonalFilters } from '@/hooks/useSeasonalRevenue';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export function SeasonalRevenueAnalytics() {
  const { data, loading, calculateSeasonalRevenue } = useSeasonalRevenue();
  const [filters, setFilters] = useState<SeasonalFilters>({
    period: 'seasonal',
    year: new Date().getFullYear()
  });

  useEffect(() => {
    calculateSeasonalRevenue(filters);
  }, [filters, calculateSeasonalRevenue]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const updateFilters = (key: keyof SeasonalFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Caricamento dati ricavi...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">📊 Ricavi Stagione Estiva {filters.year}</h2>
          <p className="text-muted-foreground">Performance giugno - settembre</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={filters.year.toString()} onValueChange={(value) => updateFilters('year', parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.apartmentId || 'all'} onValueChange={(value) => updateFilters('apartmentId', value === 'all' ? undefined : value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli appartamenti</SelectItem>
              <SelectItem value="appartamento-1">Appartamento 1</SelectItem>
              <SelectItem value="appartamento-2">Appartamento 2</SelectItem>
              <SelectItem value="appartamento-3">Appartamento 3</SelectItem>
              <SelectItem value="appartamento-4">Appartamento 4</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.period} onValueChange={(value: 'daily' | 'monthly' | 'seasonal') => updateFilters('period', value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seasonal">Stagionale</SelectItem>
              <SelectItem value="monthly">Mensile</SelectItem>
              <SelectItem value="daily">Giornaliero</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Prenotazioni</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalReservations}</div>
            <p className="text-xs text-muted-foreground">
              Periodo: Giu-Set {filters.year}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ricavi Totali</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Estate {filters.year}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ricavo Medio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.averageRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per prenotazione
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Trend Mensile Ricavi Estate {filters.year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Ricavi']}
                  labelFormatter={(label) => `Mese: ${label}`}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#3b82f6" 
                  name="Ricavi"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Apartment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance per Appartamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.apartmentBreakdown.map((apt, index) => (
              <div key={apt.apartmentId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                  <div>
                    <h4 className="font-medium">{apt.apartmentName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {apt.reservations} prenotazioni
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-green-600">
                    {formatCurrency(apt.revenue)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(apt.reservations > 0 ? apt.revenue / apt.reservations : 0)} / prenotazione
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Reservations Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Numero Prenotazioni per Mese</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value, 'Prenotazioni']}
                  labelFormatter={(label) => `Mese: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="reservations" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  name="Prenotazioni"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}