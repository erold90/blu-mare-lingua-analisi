
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, BarChart3, Target, X } from "lucide-react";
import { useCookieConsent, CookiePreferences } from "@/contexts/CookieContext";

export const CookieCustomization: React.FC = () => {
  const { showCustomization, closeCustomization, saveCustomPreferences } = useCookieConsent();
  
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Sempre attivi
    analytics: false,
    marketing: false
  });

  const handleSave = () => {
    saveCustomPreferences(preferences);
  };

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'necessary') return; // Non modificabile
    
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <Dialog open={showCustomization} onOpenChange={closeCustomization}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Personalizza Cookie
          </DialogTitle>
          <DialogDescription>
            Scegli quali cookie accettare. I cookie necessari sono sempre attivi per garantire il funzionamento del sito.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cookie Necessari */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <CardTitle className="text-base">Cookie Necessari</CardTitle>
                </div>
                <Switch checked={true} disabled />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm">
                Questi cookie sono essenziali per il funzionamento del sito web e non possono essere disattivati. 
                Includono cookie di sessione, preferenze di lingua e sicurezza.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Cookie Analytics */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-base">Cookie Statistici</CardTitle>
                </div>
                <Switch 
                  checked={preferences.analytics} 
                  onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm">
                Questi cookie ci permettono di contare le visite e analizzare il traffico per migliorare le prestazioni del sito. 
                Utilizziamo Google Analytics per raccogliere dati anonimi.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Cookie Marketing */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-600" />
                  <CardTitle className="text-base">Cookie Marketing</CardTitle>
                </div>
                <Switch 
                  checked={preferences.marketing} 
                  onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm">
                Questi cookie vengono utilizzati per mostrare pubblicità pertinenti e misurare l'efficacia delle campagne pubblicitarie. 
                Possono essere impostati dai nostri partner pubblicitari.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} className="flex-1">
            Salva Preferenze
          </Button>
          <Button onClick={closeCustomization} variant="outline">
            Annulla
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
