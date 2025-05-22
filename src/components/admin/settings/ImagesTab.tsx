
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroImageSection } from "./HeroImageSection";
import { HomeImagesSection } from "./HomeImagesSection";
import { SocialMediaTab } from "./SocialMediaTab";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FolderIcon } from "lucide-react";

export const ImagesTab = () => {
  const [activeTab, setActiveTab] = React.useState("info");
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informazioni</TabsTrigger>
          <TabsTrigger value="hero">Hero Image</TabsTrigger>
          <TabsTrigger value="gallery">Galleria Home</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Immagini</CardTitle>
              <CardDescription>
                Informazioni sulla struttura delle cartelle per le immagini del sito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-4">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <FolderIcon className="h-5 w-5 mr-2" /> Struttura Cartelle
                </h3>
                <div className="font-mono text-sm bg-muted p-3 rounded">
                  <p>public/</p>
                  <p className="ml-4">└── images/</p>
                  <p className="ml-8">├── hero/</p>
                  <p className="ml-12">└── hero.jpg</p>
                  <p className="ml-8">├── gallery/</p>
                  <p className="ml-12">└── [image1.jpg, ...]</p>
                  <p className="ml-8">├── apartments/</p>
                  <p className="ml-12">├── apartment1/</p>
                  <p className="ml-16">└── [image1.jpg, ...]</p>
                  <p className="ml-12">└── ...</p>
                  <p className="ml-8">└── social/</p>
                  <p className="ml-12">└── [image1.jpg, ...]</p>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Per aggiungere o modificare immagini, caricarle manualmente nelle rispettive cartelle.
                </p>
              </div>
              <div className="rounded-md border p-4">
                <h3 className="text-lg font-medium mb-2">Linee Guida</h3>
                <ul className="space-y-2 text-sm">
                  <li><strong>Hero Image</strong>: 1920x1080px, formato JPG, nome file "hero.jpg"</li>
                  <li><strong>Galleria</strong>: 1200x800px, formato JPG o PNG</li>
                  <li><strong>Appartamenti</strong>: creare cartella con ID appartamento, immagini numerate da 1 a N</li>
                  <li><strong>Social</strong>: 1200x630px, formato JPG o PNG</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hero" className="mt-6">
          <HeroImageSection />
        </TabsContent>
        
        <TabsContent value="gallery" className="mt-6">
          <HomeImagesSection />
        </TabsContent>
        
        <TabsContent value="social" className="mt-6">
          <SocialMediaTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
