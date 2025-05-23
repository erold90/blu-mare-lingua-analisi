
import { ImageStorageService } from "./storage";
import { ImageDatabaseService } from "./database";

/**
 * Main image service that combines storage and database functionality
 */
class ImageService extends ImageStorageService {
  private databaseService = new ImageDatabaseService();

  // Database operations
  getImagesByCategory = this.databaseService.getImagesByCategory.bind(this.databaseService);
  updateImage = this.databaseService.updateImage.bind(this.databaseService);
  setCoverImage = this.databaseService.setCoverImage.bind(this.databaseService);
  reorderImages = this.databaseService.reorderImages.bind(this.databaseService);
  getCoverImage = this.databaseService.getCoverImage.bind(this.databaseService);
}

// Export single instance
export const imageService = new ImageService();
export * from "./types";
