
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteImageManager } from "./images/SiteImageManager";

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="images" className="w-full">
        <TabsList>
          <TabsTrigger value="images">Gestione Immagini</TabsTrigger>
          <TabsTrigger value="general">Impostazioni Generali</TabsTrigger>
        </TabsList>
        
        <TabsContent value="images">
          <SiteImageManager />
        </TabsContent>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Generali</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Altre impostazioni del sito saranno disponibili qui.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
