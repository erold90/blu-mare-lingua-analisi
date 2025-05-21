
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlockedDatesTab } from "@/components/admin/settings/BlockedDatesTab";
import { ImagesTab } from "@/components/admin/settings/ImagesTab";
import { AccountTab } from "@/components/admin/settings/AccountTab";

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="blocked-dates">
        <TabsList>
          <TabsTrigger value="blocked-dates">Date Bloccate</TabsTrigger>
          <TabsTrigger value="images">Immagini</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="blocked-dates" className="mt-6">
          <BlockedDatesTab />
        </TabsContent>
        
        <TabsContent value="images" className="mt-6">
          <ImagesTab />
        </TabsContent>
        
        <TabsContent value="account" className="mt-6">
          <AccountTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
