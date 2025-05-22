
import { toast } from "sonner";

class ImageService {
  // Simple method to check if an image exists at a given path
  async checkImageExists(path: string): Promise<boolean> {
    try {
      console.log("Checking if image exists:", path);
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const urlWithTimestamp = `${path}?t=${timestamp}`;
      
      const response = await fetch(urlWithTimestamp, { 
        method: 'HEAD',
        cache: 'no-store',  // Prevent caching completely
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      
      console.log(`Image check response for ${path}:`, response.status, response.ok);
      return response.ok;
    } catch (error) {
      console.error('Error checking image:', error);
      return false;
    }
  }
  
  // Helper for debugging image issues
  async debugImage(path: string): Promise<void> {
    console.log(`Starting image debug for ${path}`);
    
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const urlWithTimestamp = `${path}?t=${timestamp}`;
    
    try {
      // Try HEAD request first
      const headResponse = await fetch(urlWithTimestamp, { 
        method: 'HEAD',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      
      console.log(`HEAD response for ${path}:`, {
        status: headResponse.status,
        statusText: headResponse.statusText,
        ok: headResponse.ok
      });
      
      // Then try normal GET request
      const getResponse = await fetch(urlWithTimestamp, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      
      console.log(`GET response for ${path}:`, {
        status: getResponse.status,
        statusText: getResponse.statusText,
        ok: getResponse.ok,
        contentType: getResponse.headers.get('content-type')
      });
      
      // If we got a successful image response, log that it's an image
      if (getResponse.ok && getResponse.headers.get('content-type')?.startsWith('image/')) {
        console.log(`${path} is a valid image`);
      } else {
        console.error(`${path} is NOT a valid image or not found`);
      }
      
      // Try to directly load the image as an Image object
      const img = new Image();
      img.onload = () => console.log(`Successfully loaded image: ${path} (${img.width}x${img.height})`);
      img.onerror = () => console.error(`Failed to load image as Image object: ${path}`);
      img.src = urlWithTimestamp;
      
    } catch (error) {
      console.error("Image debug error:", error);
    }
  }

  // Get the full URL for a path with cache busting 
  getImageUrl(path: string): string {
    const timestamp = new Date().getTime();
    return `${path}?t=${timestamp}`;
  }
}

// Export a single instance of the service
export const imageService = new ImageService();
