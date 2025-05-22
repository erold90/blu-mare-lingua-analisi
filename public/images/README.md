
# Directory Structure for Images

This project uses a specific directory structure for images. Please follow these guidelines when adding or modifying images:

## Directory Structure

```
public/
  └── images/
      ├── hero/
      │   └── hero.jpg              # Main hero image displayed on homepage
      ├── gallery/
      │   └── [image1.jpg, ...]     # Images displayed in the home page gallery
      ├── apartments/
      │   ├── apartment1/           # Directory named after apartment ID
      │   │   └── [image1.jpg, ...] # Images for specific apartment
      │   ├── apartment2/
      │   └── ...
      └── social/
          └── [image1.jpg, ...]     # Images used for social media
```

## IMPORTANT: Image File Placement

1. **Hero Image**:
   - The file MUST be named exactly `hero.jpg`
   - It MUST be placed directly in the `/public/images/hero/` directory
   - The full path should be `/public/images/hero/hero.jpg`
   - Recommended resolution: 1920x1080px

2. **Image Refresh**:
   - After uploading new images, you may need to refresh the browser
   - If the image still doesn't appear, try clearing your browser cache

## Troubleshooting

If images don't appear after uploading:
1. Verify the image is in the correct location with the exact name required
2. Confirm the image format is JPG (for hero image)
3. Check browser console for any error messages
4. Try clearing your browser cache and reloading
```
