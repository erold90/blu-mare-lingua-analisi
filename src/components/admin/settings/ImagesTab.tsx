
import * as React from "react";
import { HeroImageSection } from "./HeroImageSection";
import { HomeImagesSection } from "./HomeImagesSection";

export const ImagesTab = () => {
  return (
    <div className="space-y-6">
      <HeroImageSection />
      <HomeImagesSection />
    </div>
  );
};
