
import React from "react";
import { CookieBanner } from "./CookieBanner";
import { CookieCustomization } from "./CookieCustomization";

export const CookieConsent: React.FC = () => {
  return (
    <>
      <CookieBanner />
      <CookieCustomization />
    </>
  );
};
