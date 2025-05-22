
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

export const HomeImagesSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Immagini Galleria Home</CardTitle>
        <CardDescription>
          Le immagini che appaiono nella galleria della home page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 border rounded-md">
          <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            Per gestire le immagini della galleria, caricare manualmente i file nella cartella /public/images/gallery/
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Le immagini devono essere in formato JPG o PNG e verranno mostrate automaticamente nella galleria.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
