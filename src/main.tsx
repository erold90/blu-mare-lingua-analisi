
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { imageService } from './utils/image'

// Force favicon refresh on application start
document.addEventListener('DOMContentLoaded', () => {
  // Force browser to reload favicon by adding a random query parameter
  const randomParam = Math.floor(Math.random() * 1000000);
  imageService.updateFavicon(`/favicon.ico?v=${randomParam}`);
  
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
