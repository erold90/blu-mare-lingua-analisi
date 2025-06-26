
import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Database, Trash2, Eye, AlertTriangle, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cleanupOldVisits, loadOptimizedStats } from "@/hooks/analytics/operations/siteOperations";

interface SiteVisit {
  id: string;
  page: string;
  created_at: string;
}

interface VisitStats {
  total_records: number;
  first_record: string;
  last_record: string;
  unique_pages: number;
}

interface PageStats {
  page: string;
  visit_count: number;
  visit_date: string;
}

interface OptimizedStats {
  visit_date: string;
  page: string;
  visit_count: number;
}

export const SiteVisitsDebug = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [recentVisits, setRecentVisits] = useState<SiteVisit[]>([]);
  const [pageStats, setPageStats] = useState<PageStats[]>([]);
  const [optimizedStats, setOptimizedStats] = useState<OptimizedStats[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const loadDebugInfo = async () => {
    setLoading(true);
    try {
      // Carica statistiche generali ottimizzate
      const { data: allVisits, error: visitsError } = await supabase
        .from('site_visits')
        .select('created_at, page')
        .order('created_at', { ascending: true });

      if (visitsError) throw visitsError;

      if (allVisits && allVisits.length > 0) {
        const uniquePages = new Set(allVisits.map(v => v.page)).size;
        
        setStats({
          total_records: allVisits.length,
          first_record: allVisits[0].created_at,
          last_record: allVisits[allVisits.length - 1].created_at,
          unique_pages: uniquePages
        });
      }

      // Carica visite recenti ottimizzate
      const { data: recentData, error: recentError } = await supabase
        .from('site_visits')
        .select('id, page, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!recentError && recentData) {
        setRecentVisits(recentData);
      }

      // Carica statistiche ottimizzate usando la vista
      try {
        const optimizedData = await loadOptimizedStats();
        setOptimizedStats(optimizedData);
      } catch (error) {
        console.warn('⚠️ Could not load optimized stats:', error);
      }

      // Carica statistiche per pagina usando query ottimizzata
      const { data: pageData, error: pageError } = await supabase
        .from('site_visits')
        .select('page, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (!pageError && pageData) {
        const pageGroups = pageData.reduce((acc, visit) => {
          acc[visit.page] = (acc[visit.page] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const pageStatsData = Object.entries(pageGroups)
          .map(([page, count]) => ({ 
            page, 
            visit_count: count, 
            visit_date: new Date().toISOString()
          }))
          .sort((a, b) => b.visit_count - a.visit_count)
          .slice(0, 15);

        setPageStats(pageStatsData);
      }

      setShowDetails(true);
      toast.success('Debug info caricato con successo');

    } catch (error) {
      console.error('❌ Errore nel caricamento debug info:', error);
      toast.error('Errore nel caricamento delle informazioni di debug');
    } finally {
      setLoading(false);
    }
  };

  const clearAllVisits = async () => {
    if (!confirm('⚠️ ATTENZIONE: Questa azione eliminerà TUTTE le visite registrate. Sei sicuro di voler procedere?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_visits')
        .delete()
        .neq('id', '');

      if (error) throw error;

      toast.success('Tutte le visite sono state eliminate');
      setStats(null);
      setRecentVisits([]);
      setPageStats([]);
      setOptimizedStats([]);
      setShowDetails(false);
      
      window.location.reload();

    } catch (error) {
      console.error('❌ Errore nell\'eliminazione:', error);
      toast.error('Errore nell\'eliminazione delle visite');
    } finally {
      setLoading(false);
    }
  };

  const performOptimizedCleanup = async () => {
    if (!confirm('Eliminare automaticamente le visite più vecchie di 90 giorni usando la funzione ottimizzata?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await cleanupOldVisits();
      
      if (result.success) {
        toast.success(result.message);
        await loadDebugInfo(); // Ricarica i dati
      } else {
        toast.error(result.message);
      }

    } catch (error) {
      console.error('❌ Errore nella pulizia ottimizzata:', error);
      toast.error('Errore nella pulizia automatica');
    } finally {
      setLoading(false);
    }
  };

  const clearOldVisits = async () => {
    if (!confirm('Eliminare le visite più vecchie di 7 giorni?')) {
      return;
    }

    setLoading(true);
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { error } = await supabase
        .from('site_visits')
        .delete()
        .lt('created_at', sevenDaysAgo.toISOString());

      if (error) throw error;

      toast.success('Visite vecchie eliminate');
      await loadDebugInfo();

    } catch (error) {
      console.error('❌ Errore nell\'eliminazione visite vecchie:', error);
      toast.error('Errore nell\'eliminazione delle visite vecchie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Debug Visite Sito - Sistema Ottimizzato
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showDetails ? (
          <div className="text-center">
            <Button 
              onClick={loadDebugInfo} 
              disabled={loading}
              className="mb-4"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Analizza Dati Visite
            </Button>
            <p className="text-sm text-muted-foreground">
              Clicca per vedere i dettagli delle visite con sistema ottimizzato
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statistiche generali */}
            {stats && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Record totali:</strong> {stats.total_records.toLocaleString()}
                      <br />
                      <strong>Pagine uniche:</strong> {stats.unique_pages}
                    </div>
                    <div>
                      <strong>Prima visita:</strong> {format(new Date(stats.first_record), 'dd/MM/yyyy HH:mm', { locale: it })}
                      <br />
                      <strong>Ultima visita:</strong> {format(new Date(stats.last_record), 'dd/MM/yyyy HH:mm', { locale: it })}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Azioni di pulizia ottimizzate */}
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={performOptimizedCleanup} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                🚀 Pulizia Ottimizzata (90+ giorni)
              </Button>
              <Button 
                onClick={clearOldVisits} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Elimina Visite Vecchie (7+ giorni)
              </Button>
              <Button 
                onClick={clearAllVisits} 
                variant="destructive" 
                size="sm"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                ⚠️ Elimina TUTTE le Visite
              </Button>
            </div>

            {/* Statistiche ottimizzate dalla vista */}
            {optimizedStats.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Statistiche Ottimizzate (Vista Database)
                </h4>
                <ScrollArea className="h-32 border rounded p-2">
                  {optimizedStats.slice(0, 10).map((stat, index) => (
                    <div key={index} className="flex justify-between items-center py-1 text-sm border-b last:border-0">
                      <span className="flex-1 truncate">{stat.page}</span>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          {stat.visit_count} visite
                        </Badge>
                        <Badge variant="outline">
                          {format(new Date(stat.visit_date), 'dd/MM', { locale: it })}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            {/* Visite recenti */}
            {recentVisits.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Ultime 20 Visite</h4>
                <ScrollArea className="h-48 border rounded p-2">
                  {recentVisits.map((visit) => (
                    <div key={visit.id} className="flex justify-between items-center py-1 text-sm border-b last:border-0">
                      <span className="flex-1 truncate">{visit.page}</span>
                      <Badge variant="outline" className="ml-2">
                        {format(new Date(visit.created_at), 'dd/MM HH:mm', { locale: it })}
                      </Badge>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            {/* Pagine più visitate (ultimi 7 giorni) */}
            {pageStats.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Pagine Più Visitate (Ultimi 7 giorni)</h4>
                <ScrollArea className="h-48 border rounded p-2">
                  {pageStats.map((stat) => (
                    <div key={stat.page} className="flex justify-between items-center py-1 text-sm border-b last:border-0">
                      <span className="flex-1 truncate">{stat.page}</span>
                      <Badge variant="secondary" className="ml-2">
                        {stat.visit_count} visite
                      </Badge>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
