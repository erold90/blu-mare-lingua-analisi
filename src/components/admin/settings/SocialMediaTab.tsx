
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

export const SocialMediaTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Immagini Social Media</CardTitle>
        <CardDescription>
          Immagini utilizzate per la condivisione sui social media
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 border rounded-md">
          <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            Per gestire le immagini per i social media, caricare manualmente i file nella cartella /public/images/social/
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Le immagini devono essere in formato JPG o PNG e avere le dimensioni appropriate per i social media.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
