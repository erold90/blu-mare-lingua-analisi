
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useIsMobile } from "@/hooks/use-mobile";

export const ImagesTab = () => {
  const { siteSettings, updateSiteSettings } = useSettings();
  const isMobile = useIsMobile();

  const handleImageUpload = (
    type: 'hero' | 'home',
    index: number | null = null,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // In a real app, you would upload the file to a server and get back a URL
    // For this demo, we'll use local file URLs
    const file = e.target.files[0];
    const objectURL = URL.createObjectURL(file);
    
    if (type === 'hero') {
      updateSiteSettings({ heroImage: objectURL });
      toast.success("Immagine hero aggiornata");
    } else if (type === 'home' && index !== null) {
      const newHomeImages = [...siteSettings.homeImages];
      newHomeImages[index] = objectURL;
      updateSiteSettings({ homeImages: newHomeImages });
      toast.success(`Immagine ${index + 1} aggiornata`);
    }
  };

  const isValidImage = (url: string) => {
    return url && !url.includes("placeholder.svg");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Immagine Hero</CardTitle>
          <CardDescription>
            L'immagine principale visualizzata nella home page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="aspect-video rounded-md overflow-hidden border bg-muted relative">
                {isValidImage(siteSettings.heroImage) ? (
                  <img
                    src={siteSettings.heroImage}
                    alt="Hero"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`${isValidImage(siteSettings.heroImage) ? 'hidden' : ''} absolute inset-0 flex flex-col items-center justify-center bg-muted`}>
                  <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                  <p className="text-sm text-muted-foreground">Nessuna immagine caricata</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Si consiglia un'immagine in formato 16:9 con alta risoluzione
              </p>
            </div>
            <div className="flex items-center">
              <div>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('hero-upload')?.click()}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> Cambia immagine
                </Button>
                <Input
                  id="hero-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload('hero', null, e)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Immagini Home Page</CardTitle>
          <CardDescription>
            Immagini aggiuntive visualizzate nella home page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-6`}>
            {siteSettings.homeImages.map((imageUrl, index) => (
              <div key={index} className="space-y-3">
                <div className="aspect-square rounded-md overflow-hidden border bg-muted relative">
                  {isValidImage(imageUrl) ? (
                    <img
                      src={imageUrl}
                      alt={`Home ${index+1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`${isValidImage(imageUrl) ? 'hidden' : ''} absolute inset-0 flex flex-col items-center justify-center bg-muted`}>
                    <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50 mb-2" />
                    <p className="text-xs text-muted-foreground">Nessuna immagine</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => document.getElementById(`home-upload-${index}`)?.click()}
                >
                  <Plus className="h-3 w-3 mr-1" /> Cambia
                </Button>
                <Input
                  id={`home-upload-${index}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload('home', index, e)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
