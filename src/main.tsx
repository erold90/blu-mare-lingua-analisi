
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { imageService } from './utils/image'
import { discoveryStorage } from './services/discoveryStorage'

// Initialize discovery storage
console.log("Initializing discovery storage service...");

// Force favicon refresh on application start
document.addEventListener('DOMContentLoaded', () => {
  // Force browser to reload favicon by adding a random query parameter
  const randomParam = Math.floor(Math.random() * 1000000);
  imageService.updateFavicon(`/favicon.ico?v=${randomParam}`);
  
  // Sync data from server (in a real implementation, this would fetch data from a central API)
  discoveryStorage.syncFromServer().then(() => {
    console.log("Discovery storage sync complete");
  });
  
  // Additional logging for debugging
  console.log("Favicon should be loaded from:", `/favicon.ico?v=${randomParam}`);
  
  // Double check after a short delay
  setTimeout(() => {
    const faviconLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    console.log("Current favicon links:", faviconLinks.length);
    faviconLinks.forEach((link, i) => {
      console.log(`Favicon ${i}:`, (link as HTMLLinkElement).href);
    });
  }, 500);
});

createRoot(document.getElementById("root")!).render(<App />);
