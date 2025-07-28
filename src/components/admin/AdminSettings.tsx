
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteImageSettings } from "./settings/SiteImageSettings";
import { AccountTab } from "./settings/AccountTab";
import { BlockedDatesTab } from "./settings/BlockedDatesTab";
import { SettingsProvider } from "@/hooks/useSettings";

const AdminSettings = () => {
  return (
    <SettingsProvider>
      <div className="space-y-6">
        <Tabs defaultValue="images" className="w-full">
          <TabsList>
            <TabsTrigger value="images">Immagini Sito</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="blocked-dates">Date Bloccate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="images">
            <SiteImageSettings />
          </TabsContent>
          
          <TabsContent value="account">
            <AccountTab />
          </TabsContent>
          
          <TabsContent value="blocked-dates">
            <BlockedDatesTab />
          </TabsContent>
        </Tabs>
      </div>
    </SettingsProvider>
  );
};

export default AdminSettings;
