
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Image as ImageIcon } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useIsMobile } from "@/hooks/use-mobile";

export const HomeImagesSection = () => {
  const { siteSettings, updateSiteSettings } = useSettings();
  const isMobile = useIsMobile();

  const handleImageUpload = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // In a real app, you would upload the file to a server and get back a URL
    // For this demo, we'll use local file URLs
    const file = e.target.files[0];
    const objectURL = URL.createObjectURL(file);
    
    const newHomeImages = [...siteSettings.homeImages];
    newHomeImages[index] = objectURL;
    updateSiteSettings({ homeImages: newHomeImages });
    toast.success(`Immagine ${index + 1} aggiornata`);
  };

  const isValidImage = (url: string) => {
    return url && !url.includes("placeholder.svg");
  };

  return (
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
                onChange={(e) => handleImageUpload(index, e)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
