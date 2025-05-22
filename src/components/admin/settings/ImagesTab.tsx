
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroImageSection } from "./HeroImageSection";
import { HomeImagesSection } from "./HomeImagesSection";
import { SocialMediaTab } from "./SocialMediaTab";

export const ImagesTab = () => {
  const [activeTab, setActiveTab] = React.useState("hero");
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="hero">
        <TabsList>
          <TabsTrigger value="hero">Hero Image</TabsTrigger>
          <TabsTrigger value="gallery">Galleria Home</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>
        
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
