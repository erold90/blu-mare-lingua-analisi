
/**
 * Handles session-related functionality for images
 */
export class ImageSessionService {
  /**
   * Gets a session timestamp for cache busting
   */
  getSessionTimestamp(): string {
    const key = "sessionImageTimestamp";
    let timestamp = sessionStorage.getItem(key);
    
    if (!timestamp) {
      timestamp = String(new Date().getTime());
      sessionStorage.setItem(key, timestamp);
    }
    
    return timestamp;
  }
  
  /**
   * Force a new session timestamp (for explicit refresh)
   */
  resetSessionTimestamp(): void {
    const key = "sessionImageTimestamp";
    const timestamp = String(new Date().getTime());
    sessionStorage.setItem(key, timestamp);
  }
}

export const imageSessionService = new ImageSessionService();
