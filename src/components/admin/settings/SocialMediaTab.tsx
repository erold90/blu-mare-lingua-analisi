
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { Image as ImageIcon } from "lucide-react";

export const SocialMediaTab = () => {
  const { siteSettings, updateSiteSettings } = useSettings();
  
  const [formData, setFormData] = React.useState({
    siteName: siteSettings.siteName || "Villa MareBlu",
    siteDescription: siteSettings.siteDescription || "Villa MareBlu - Appartamenti vacanze sul mare",
  });

  React.useEffect(() => {
    setFormData({
      siteName: siteSettings.siteName || "Villa MareBlu",
      siteDescription: siteSettings.siteDescription || "Villa MareBlu - Appartamenti vacanze sul mare",
    });
  }, [siteSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = () => {
    updateSiteSettings({
      siteName: formData.siteName,
      siteDescription: formData.siteDescription,
    });
    toast.success("Impostazioni social media salvate");
  };

  const handleImageUpload = (field: 'socialImage' | 'favicon') => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // In a real app, you would upload the file to a server and get back a URL
    const file = e.target.files[0];
    const objectURL = URL.createObjectURL(file);
    
    updateSiteSettings({ [field]: objectURL });
    toast.success(field === 'socialImage' ? "Immagine social aggiornata" : "Favicon aggiornata");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Condivisione Social Media</CardTitle>
          <CardDescription>
            Personalizza come appare il tuo sito quando viene condiviso sui social media
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nome Sito</Label>
            <Input
              id="siteName"
              name="siteName"
              value={formData.siteName}
              onChange={handleInputChange}
              placeholder="Nome del sito"
            />
            <p className="text-sm text-muted-foreground">
              Questo nome apparirà nei risultati di ricerca e nelle condivisioni sui social media
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Descrizione</Label>
            <Input
              id="siteDescription"
              name="siteDescription"
              value={formData.siteDescription}
              onChange={handleInputChange}
              placeholder="Descrizione breve del sito"
            />
            <p className="text-sm text-muted-foreground">
              Una breve descrizione che apparirà nelle condivisioni sui social media (max 120 caratteri consigliati)
            </p>
          </div>
          
          <div className="space-y-2 pt-4">
            <Label>Immagine Social</Label>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-20 h-20 rounded-md border overflow-hidden bg-muted">
                {siteSettings.socialImage && !siteSettings.socialImage.includes("placeholder") ? (
                  <img 
                    src={siteSettings.socialImage} 
                    alt="Social preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("social-image-upload")?.click()}
                  className="w-full"
                >
                  Carica immagine
                </Button>
                <Input
                  id="social-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload('socialImage')}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Immagine mostrata quando condividi su WhatsApp e altri social media (1200×630px consigliata)
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 pt-4">
            <Label>Favicon</Label>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-md border overflow-hidden bg-muted">
                {siteSettings.favicon && !siteSettings.favicon.includes("favicon.ico") ? (
                  <img 
                    src={siteSettings.favicon} 
                    alt="Favicon" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("favicon-upload")?.click()}
                  className="w-full"
                >
                  Carica favicon
                </Button>
                <Input
                  id="favicon-upload"
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleImageUpload('favicon')}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  L'icona che appare nella scheda del browser (32×32px o 64×64px, formato PNG consigliato)
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button onClick={handleSaveChanges}>Salva modifiche</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Anteprima Condivisione WhatsApp</CardTitle>
          <CardDescription>
            Così apparirà il tuo link quando condiviso su WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden max-w-md">
            <div className="bg-[#f0f0f0] p-3 border-b">
              <div className="flex items-center">
                {siteSettings.favicon && !siteSettings.favicon.includes("favicon.ico") ? (
                  <img src={siteSettings.favicon} alt="Site icon" className="w-8 h-8 rounded mr-2" />
                ) : (
                  <div className="w-8 h-8 bg-primary/20 rounded mr-2 flex items-center justify-center">
                    <span className="text-primary text-xs">VM</span>
                  </div>
                )}
                <div>
                  <div className="font-medium text-sm">{formData.siteName}</div>
                  <div className="text-xs text-muted-foreground">villamareblu.it</div>
                </div>
              </div>
            </div>
            <div className="bg-white">
              {siteSettings.socialImage && !siteSettings.socialImage.includes("placeholder") ? (
                <div className="aspect-[1.91/1] overflow-hidden">
                  <img 
                    src={siteSettings.socialImage} 
                    alt="Social preview" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ) : (
                <div className="aspect-[1.91/1] bg-muted flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
              <div className="p-3">
                <h3 className="font-medium text-sm">{formData.siteName}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {formData.siteDescription}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
