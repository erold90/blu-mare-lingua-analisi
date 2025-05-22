
import { toast } from "sonner";

// We're now using a manual image upload approach
// This service is maintained for backward compatibility and for helper methods

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
        cache: 'no-cache',  // Prevent caching to always get the latest status
        headers: { 'Cache-Control': 'no-cache' }
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
    try {
      console.log(`Starting image debug for ${path}`);
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const urlWithTimestamp = `${path}?t=${timestamp}`;
      
      // Try HEAD request first
      const headResponse = await fetch(urlWithTimestamp, { 
        method: 'HEAD',
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      console.log(`HEAD response for ${path}:`, {
        status: headResponse.status,
        statusText: headResponse.statusText,
        ok: headResponse.ok,
        headers: Array.from(headResponse.headers.entries())
      });
      
      // Then try normal GET request
      const getResponse = await fetch(urlWithTimestamp, {
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      console.log(`GET response for ${path}:`, {
        status: getResponse.status,
        statusText: getResponse.statusText,
        ok: getResponse.ok,
        headers: Array.from(getResponse.headers.entries()),
        contentType: getResponse.headers.get('content-type')
      });
      
      // If we got a successful image response, log that it's an image
      if (getResponse.ok && getResponse.headers.get('content-type')?.startsWith('image/')) {
        console.log(`${path} is a valid image`);
      } else {
        console.error(`${path} is NOT a valid image or not found`);
      }
    } catch (error) {
      console.error("Image debug error:", error);
    }
  }
}

// Export a single instance of the service
export const imageService = new ImageService();
