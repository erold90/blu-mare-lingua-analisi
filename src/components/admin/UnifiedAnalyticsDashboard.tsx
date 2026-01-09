/**
 * UnifiedAnalyticsDashboard - Dashboard analitica unificata
 *
 * Include:
 * - Overview sessioni e visite
 * - Analisi funnel preventivo
 * - Statistiche dispositivi e browser
 * - Conversioni e metriche
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Target,
  RefreshCw,
  MessageSquare,
  FileText,
  Globe,
  Clock,
  UserCheck,
  UserX,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';

interface SessionStats {
  totalSessions: number;
  uniqueVisitors: number;
  returningVisitors: number;
  avgPagesViewed: number;
  deviceBreakdown: { name: string; value: number; color: string }[];
  browserBreakdown: { name: string; value: number }[];
  topLandingPages: { page: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
}

interface FunnelStats {
  formOpened: number;
  stepGuests: number;
  stepDates: number;
  stepApartments: number;
  stepExtras: number;
  stepSummary: number;
  stepContact: number;
  formComplete: number;
  whatsappClicked: number;
}

interface ConversionStats {
  sessionToFormRate: number;
  formToCompleteRate: number;
  overallConversionRate: number;
  avgTimeToComplete: number;
}

const DEVICE_COLORS = {
  desktop: '#3B82F6',
  mobile: '#10B981',
  tablet: '#F59E0B'
};

const FUNNEL_COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#EFF6FF', '#F1F5F9'];

export const UnifiedAnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [funnelStats, setFunnelStats] = useState<FunnelStats | null>(null);
  const [conversionStats, setConversionStats] = useState<ConversionStats | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      // Calcola date range
      const endDate = new Date();
      let startDate = new Date();

      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case 'all':
          startDate = new Date('2020-01-01');
          break;
      }

      const startStr = startDate.toISOString();
      const endStr = endDate.toISOString();

      // Query sessioni
      const { data: sessions, error: sessionsError } = await supabase
        .from('analytics_sessions')
        .select('*')
        .gte('created_at', startStr)
        .lte('created_at', endStr);

      if (sessionsError) {
        console.error('Sessions query error:', sessionsError);
      }

      // Query eventi funnel
      const { data: funnelEvents, error: funnelError } = await supabase
        .from('quote_funnel_events')
        .select('*')
        .gte('created_at', startStr)
        .lte('created_at', endStr);

      if (funnelError) {
        console.error('Funnel query error:', funnelError);
      }

      // Query quote completate
      const { data: quotes, error: quotesError } = await supabase
        .from('quote_requests')
        .select('id, created_at')
        .gte('created_at', startStr)
        .lte('created_at', endStr);

      if (quotesError) {
        console.error('Quotes query error:', quotesError);
      }

      // Processa statistiche sessioni
      if (sessions && sessions.length > 0) {
        const uniqueVisitors = new Set(sessions.map(s => s.visitor_id)).size;
        const returningVisitors = sessions.filter(s => s.is_returning).length;
        const avgPages = sessions.reduce((sum, s) => sum + (s.pages_viewed || 1), 0) / sessions.length;

        // Device breakdown
        const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
        sessions.forEach(s => {
          const device = s.device_type || 'desktop';
          deviceCounts[device] = (deviceCounts[device] || 0) + 1;
        });

        const deviceBreakdown = Object.entries(deviceCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: DEVICE_COLORS[name as keyof typeof DEVICE_COLORS] || '#6B7280'
        }));

        // Browser breakdown
        const browserCounts: Record<string, number> = {};
        sessions.forEach(s => {
          const browser = s.browser || 'Unknown';
          browserCounts[browser] = (browserCounts[browser] || 0) + 1;
        });

        const browserBreakdown = Object.entries(browserCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        // Top landing pages
        const landingCounts: Record<string, number> = {};
        sessions.forEach(s => {
          const page = s.landing_page || '/';
          landingCounts[page] = (landingCounts[page] || 0) + 1;
        });

        const topLandingPages = Object.entries(landingCounts)
          .map(([page, count]) => ({ page, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Top referrers
        const referrerCounts: Record<string, number> = {};
        sessions.forEach(s => {
          const ref = s.referrer || 'Direct';
          try {
            const refDomain = ref !== 'Direct' ? new URL(ref).hostname : 'Direct';
            referrerCounts[refDomain] = (referrerCounts[refDomain] || 0) + 1;
          } catch {
            referrerCounts['Direct'] = (referrerCounts['Direct'] || 0) + 1;
          }
        });

        const topReferrers = Object.entries(referrerCounts)
          .map(([referrer, count]) => ({ referrer, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setSessionStats({
          totalSessions: sessions.length,
          uniqueVisitors,
          returningVisitors,
          avgPagesViewed: Math.round(avgPages * 10) / 10,
          deviceBreakdown,
          browserBreakdown,
          topLandingPages,
          topReferrers
        });
      } else {
        setSessionStats(null);
      }

      // Processa statistiche funnel
      if (funnelEvents && funnelEvents.length > 0) {
        const eventCounts: Record<string, number> = {};
        funnelEvents.forEach(e => {
          eventCounts[e.event_type] = (eventCounts[e.event_type] || 0) + 1;
        });

        setFunnelStats({
          formOpened: eventCounts['form_start'] || eventCounts['form_opened'] || 0,
          stepGuests: eventCounts['step_guests'] || 0,
          stepDates: eventCounts['step_dates'] || 0,
          stepApartments: eventCounts['step_apartments'] || 0,
          stepExtras: eventCounts['step_extras'] || 0,
          stepSummary: eventCounts['step_summary'] || 0,
          stepContact: eventCounts['step_contact'] || 0,
          formComplete: eventCounts['form_complete'] || eventCounts['quote_created'] || 0,
          whatsappClicked: eventCounts['whatsapp_clicked'] || 0
        });

        // Calcola conversioni
        const totalSessions = sessions?.length || 1;
        const formOpened = eventCounts['form_start'] || eventCounts['form_opened'] || 0;
        const formComplete = eventCounts['form_complete'] || eventCounts['quote_created'] || 0;

        setConversionStats({
          sessionToFormRate: Math.round((formOpened / totalSessions) * 100),
          formToCompleteRate: formOpened > 0 ? Math.round((formComplete / formOpened) * 100) : 0,
          overallConversionRate: Math.round((formComplete / totalSessions) * 100),
          avgTimeToComplete: 0 // TODO: calcolare dal timestamp
        });
      } else {
        setFunnelStats(null);
        setConversionStats(null);
      }

    } catch (err) {
      console.error('Error loading analytics:', err);
      toast.error('Errore nel caricamento delle analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const DeviceIcon = ({ type }: { type: string }) => {
    switch (type.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  // Prepara dati funnel per il grafico
  const funnelData = funnelStats ? [
    { name: 'Form Aperto', value: funnelStats.formOpened, fill: FUNNEL_COLORS[0] },
    { name: 'Step Ospiti', value: funnelStats.stepGuests, fill: FUNNEL_COLORS[1] },
    { name: 'Step Date', value: funnelStats.stepDates, fill: FUNNEL_COLORS[2] },
    { name: 'Step Appartamenti', value: funnelStats.stepApartments, fill: FUNNEL_COLORS[3] },
    { name: 'Step Extra', value: funnelStats.stepExtras, fill: FUNNEL_COLORS[4] },
    { name: 'Step Riepilogo', value: funnelStats.stepSummary, fill: FUNNEL_COLORS[5] },
    { name: 'Completato', value: funnelStats.formComplete, fill: '#10B981' }
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics Unificata</h2>
          <p className="text-muted-foreground">
            Sessioni, funnel preventivo e conversioni
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Ultimi 7 giorni</SelectItem>
              <SelectItem value="30d">Ultimi 30 giorni</SelectItem>
              <SelectItem value="90d">Ultimi 90 giorni</SelectItem>
              <SelectItem value="all">Tutto</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={loadAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="funnel">Funnel Preventivo</TabsTrigger>
            <TabsTrigger value="devices">Dispositivi</TabsTrigger>
            <TabsTrigger value="sources">Sorgenti</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessioni Totali</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sessionStats?.totalSessions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Periodo selezionato
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visitatori Unici</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sessionStats?.uniqueVisitors || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Basato su visitor ID
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visitatori di Ritorno</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {sessionStats?.returningVisitors || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sessionStats && sessionStats.totalSessions > 0
                      ? `${Math.round((sessionStats.returningVisitors / sessionStats.totalSessions) * 100)}%`
                      : '0%'} delle sessioni
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pagine/Sessione</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sessionStats?.avgPagesViewed || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Media pagine visualizzate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Conversion Overview */}
            {conversionStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Tassi di Conversione
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sessione → Form</span>
                        <span className="font-semibold">{conversionStats.sessionToFormRate}%</span>
                      </div>
                      <Progress value={conversionStats.sessionToFormRate} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Visitatori che aprono il form preventivo
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Form → Completato</span>
                        <span className="font-semibold">{conversionStats.formToCompleteRate}%</span>
                      </div>
                      <Progress value={conversionStats.formToCompleteRate} className="h-2 [&>div]:bg-green-500" />
                      <p className="text-xs text-muted-foreground">
                        Chi inizia il form e lo completa
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Conversione Totale</span>
                        <span className="font-semibold text-primary">{conversionStats.overallConversionRate}%</span>
                      </div>
                      <Progress value={conversionStats.overallConversionRate} className="h-2 [&>div]:bg-primary" />
                      <p className="text-xs text-muted-foreground">
                        Sessioni → Preventivo completato
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Funnel Tab */}
          <TabsContent value="funnel" className="space-y-6">
            {funnelStats ? (
              <>
                {/* Funnel Steps Visualization */}
                <Card>
                  <CardHeader>
                    <CardTitle>Funnel Preventivo</CardTitle>
                    <CardDescription>
                      Analisi step-by-step del form preventivo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'Form Aperto', value: funnelStats.formOpened, icon: FileText },
                        { name: 'Step Ospiti', value: funnelStats.stepGuests, icon: Users },
                        { name: 'Step Date', value: funnelStats.stepDates, icon: Clock },
                        { name: 'Step Appartamenti', value: funnelStats.stepApartments, icon: Monitor },
                        { name: 'Step Extra', value: funnelStats.stepExtras, icon: FileText },
                        { name: 'Step Riepilogo', value: funnelStats.stepSummary, icon: Eye },
                        { name: 'Completato', value: funnelStats.formComplete, icon: Target },
                      ].map((step, index, arr) => {
                        const prevValue = index > 0 ? arr[index - 1].value : step.value;
                        const dropOff = prevValue > 0 ? Math.round(((prevValue - step.value) / prevValue) * 100) : 0;
                        const percentage = funnelStats.formOpened > 0
                          ? Math.round((step.value / funnelStats.formOpened) * 100)
                          : 0;

                        return (
                          <div key={step.name} className="relative">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <step.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{step.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold">{step.value}</span>
                                    <Badge variant="secondary">{percentage}%</Badge>
                                  </div>
                                </div>
                                <Progress
                                  value={percentage}
                                  className={`h-2 ${index === arr.length - 1 ? '[&>div]:bg-green-500' : ''}`}
                                />
                              </div>
                              {index > 0 && dropOff > 0 && (
                                <div className="flex-shrink-0 w-20 text-right">
                                  <Badge variant="destructive" className="text-xs">
                                    -{dropOff}%
                                  </Badge>
                                </div>
                              )}
                            </div>
                            {index < arr.length - 1 && (
                              <div className="ml-5 border-l-2 border-dashed border-muted h-4" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* WhatsApp Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      Invii WhatsApp
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div className="text-4xl font-bold text-green-600">
                        {funnelStats.whatsappClicked}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Preventivi inviati via WhatsApp</p>
                        {funnelStats.formComplete > 0 && (
                          <p className="mt-1">
                            {Math.round((funnelStats.whatsappClicked / funnelStats.formComplete) * 100)}%
                            dei preventivi completati
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nessun dato funnel</h3>
                    <p>I dati del funnel appariranno quando gli utenti inizieranno a usare il form preventivo.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            {sessionStats && sessionStats.deviceBreakdown.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dispositivi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sessionStats.deviceBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {sessionStats.deviceBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex justify-center gap-6">
                      {sessionStats.deviceBreakdown.map(device => (
                        <div key={device.name} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: device.color }}
                          />
                          <span className="text-sm">
                            {device.name}: {device.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Browser Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Browser</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sessionStats.browserBreakdown} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={80} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nessun dato dispositivi</h3>
                    <p>Le statistiche dei dispositivi appariranno con le nuove sessioni.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            {sessionStats ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Landing Pages */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pagine di Atterraggio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sessionStats.topLandingPages.map((page, index) => (
                        <div key={page.page} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-mono text-sm">{page.page}</span>
                          </div>
                          <Badge variant="secondary">{page.count}</Badge>
                        </div>
                      ))}
                      {sessionStats.topLandingPages.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Nessun dato disponibile
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Referrers */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sorgenti di Traffico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sessionStats.topReferrers.map((ref, index) => (
                        <div key={ref.referrer} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{ref.referrer}</span>
                          </div>
                          <Badge variant="secondary">{ref.count}</Badge>
                        </div>
                      ))}
                      {sessionStats.topReferrers.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Nessun dato disponibile
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nessun dato sorgenti</h3>
                    <p>Le sorgenti di traffico appariranno con le nuove sessioni.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default UnifiedAnalyticsDashboard;
