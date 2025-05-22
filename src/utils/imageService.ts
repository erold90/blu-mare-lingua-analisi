
import { toast } from "sonner";

// We're now using a manual image upload approach
// This service is maintained for backward compatibility
// but with reduced functionality

class ImageService {
  // Simple method to check if an image exists at a given path
  async checkImageExists(path: string): Promise<boolean> {
    try {
      const response = await fetch(path, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch (error) {
      console.error('Error checking image:', error);
      return false;
    }
  }
}

// Export a single instance of the service
export const imageService = new ImageService();
