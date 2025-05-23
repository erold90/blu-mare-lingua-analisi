
import React, { useEffect } from "react";
import CompactPriceManager from "./prices/CompactPriceManager";
import { useCompactPrices } from "@/hooks/prices/useCompactPrices";

const AdminPrices: React.FC = () => {
  const { prices, initializeDefaultPrices, isLoading } = useCompactPrices();
  
  useEffect(() => {
    // Check if prices need to be initialized on first load
    if (!isLoading && prices.length === 0) {
      initializeDefaultPrices(2025);
    }
  }, [isLoading, prices.length]);

  return <CompactPriceManager />;
};

export default AdminPrices;
