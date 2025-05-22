
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

## Image Guidelines

1. **Hero Image**:
   - File should be named `hero.jpg`
   - Recommended resolution: 1920x1080px
   - File format: JPG
   - Path: `/images/hero/hero.jpg`

2. **Gallery Images**:
   - Name format: Any descriptive name (e.g., `beach.jpg`, `pool.jpg`)
   - Recommended resolution: 1200x800px
   - File formats: JPG, PNG
   - Path: `/images/gallery/[filename]`

3. **Apartment Images**:
   - Create a folder with the apartment ID (e.g., `apartment1`)
   - Images should follow naming pattern: `image1.jpg`, `image2.jpg`, etc.
   - The first image (`image1.jpg`) will be used as cover image
   - Recommended resolution: 1200x800px
   - File formats: JPG, PNG
   - Path: `/images/apartments/[apartmentId]/[filename]`

4. **Social Media Images**:
   - Name format: Any descriptive name (e.g., `facebook.jpg`, `instagram.jpg`)
   - Recommended resolution: 1200x630px
   - File formats: JPG, PNG
   - Path: `/images/social/[filename]`
