import React from "react";
import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const getPageTitle = (pathname: string) => {
  const routes: Record<string, { title: string; subtitle: string }> = {
    '/area-riservata/dashboard': { title: 'Dashboard', subtitle: 'Panoramica generale del sistema' },
    '/area-riservata/prenotazioni': { title: 'Prenotazioni', subtitle: 'Gestisci tutte le prenotazioni' },
    '/area-riservata/appartamenti': { title: 'Appartamenti', subtitle: 'Gestisci gli appartamenti' },
    '/area-riservata/prezzi': { title: 'Prezzi', subtitle: 'Gestisci le tariffe stagionali' },
    '/area-riservata/pulizie': { title: 'Pulizie', subtitle: 'Gestisci le attività di pulizia' },
    '/area-riservata/analytics': { title: 'Analytics', subtitle: 'Statistiche e report dettagliati' },
    '/area-riservata/impostazioni': { title: 'Impostazioni', subtitle: 'Configurazioni del sistema' },
  };
  
  return routes[pathname] || { title: 'Area Riservata', subtitle: 'Benvenuto nel pannello di amministrazione' };
};

export function ModernAdminHeader() {
  const location = useLocation();
  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <header className="bg-white border-b border-slate-200/60 shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-slate-600 hover:text-slate-900" />
          
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Cerca..." 
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 h-9 text-sm"
            />
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          >
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
            >
              3
            </Badge>
          </Button>
          
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-blue-600 text-white">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-medium text-slate-900">Admin</span>
              <span className="text-xs text-slate-500">Amministratore</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}