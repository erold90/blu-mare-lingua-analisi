
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { imageService } from './utils/image'

// Force favicon refresh on application start
document.addEventListener('DOMContentLoaded', () => {
  // Load the default favicon.ico
  imageService.updateFavicon('/favicon.ico');
});

createRoot(document.getElementById("root")!).render(<App />);
