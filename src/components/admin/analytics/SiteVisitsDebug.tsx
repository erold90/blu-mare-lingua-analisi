
import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Database, Trash2, Eye, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface SiteVisit {
  id: string;
  page: string;
  timestamp: string;
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
  first_visit: string;
  last_visit: string;
}

export const SiteVisitsDebug = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [recentVisits, setRecentVisits] = useState<SiteVisit[]>([]);
  const [pageStats, setPageStats] = useState<PageStats[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const loadDebugInfo = async () => {
    setLoading(true);
    try {
      // Carica statistiche generali usando query dirette
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

      // Carica visite recenti
      const { data: recentData, error: recentError } = await supabase
        .from('site_visits')
        .select('id, page, timestamp, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!recentError && recentData) {
        setRecentVisits(recentData);
      }

      // Carica statistiche per pagina
      const { data: pageData, error: pageError } = await supabase
        .from('site_visits')
        .select('page, created_at');

      if (!pageError && pageData) {
        const pageGroups = pageData.reduce((acc, visit) => {
          acc[visit.page] = (acc[visit.page] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const pageStatsData = Object.entries(pageGroups)
          .map(([page, count]) => ({ 
            page, 
            visit_count: count, 
            first_visit: '', 
            last_visit: '' 
          }))
          .sort((a, b) => b.visit_count - a.visit_count)
          .slice(0, 15);

        setPageStats(pageStatsData);
      }

      setShowDetails(true);
      toast.success('Debug info caricato');

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
        .not('id', 'is', null); // Sintassi corretta per eliminare tutti i record

      if (error) throw error;

      toast.success('Tutte le visite sono state eliminate');
      setStats(null);
      setRecentVisits([]);
      setPageStats([]);
      setShowDetails(false);
      
      // Ricarica la pagina per aggiornare tutti i componenti
      window.location.reload();

    } catch (error) {
      console.error('❌ Errore nell\'eliminazione:', error);
      toast.error('Errore nell\'eliminazione delle visite');
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
      await loadDebugInfo(); // Ricarica i dati

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
          Debug Visite Sito
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
              Clicca per vedere i dettagli delle visite registrate
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
                      <strong>Record totali:</strong> {stats.total_records}
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

            {/* Azioni di pulizia */}
            <div className="flex gap-2 flex-wrap">
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

            {/* Pagine più visitate */}
            {pageStats.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Pagine Più Visitate</h4>
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
