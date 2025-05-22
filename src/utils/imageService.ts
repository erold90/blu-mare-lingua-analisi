
import { toast } from "sonner";

// We're now using a manual image upload approach
// This service is maintained for backward compatibility and for helper methods

class ImageService {
  // Simple method to check if an image exists at a given path
  async checkImageExists(path: string): Promise<boolean> {
    try {
      const response = await fetch(path, { 
        method: 'HEAD',
        cache: 'no-cache',  // Prevent caching to always get the latest status
        headers: { 'Cache-Control': 'no-cache' }
      });
      return response.ok;
    } catch (error) {
      console.error('Error checking image:', error);
      return false;
    }
  }
  
  // Helper for debugging image issues
  async debugImage(path: string): Promise<void> {
    try {
      const exists = await this.checkImageExists(path);
      console.log(`Image debug for ${path}:`, exists ? "EXISTS" : "NOT FOUND");
      
      if (!exists) {
        // Try to load with regular fetch to see detailed errors
        const response = await fetch(path);
        console.log(`Status: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Image debug error:", error);
    }
  }
}

// Export a single instance of the service
export const imageService = new ImageService();
