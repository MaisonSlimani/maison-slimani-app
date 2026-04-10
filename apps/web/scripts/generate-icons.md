# Generating PWA Icons

## Quick Guide

You need to create icons for both PWAs. Here are the required sizes:

### Customer PWA Icons
Place in: `public/icons/`
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png (maskable)
- icon-384x384.png
- icon-512x512.png (maskable)

### Admin PWA Icons
Place in: `admin-app/public/icons/`
- Same sizes as above

## Online Tools

1. **PWA Builder Image Generator:**
   - https://www.pwabuilder.com/imageGenerator
   - Upload 512x512 source image
   - Download all sizes

2. **RealFaviconGenerator:**
   - https://realfavicongenerator.net/
   - Generates all PWA icons

3. **Favicon.io:**
   - https://favicon.io/
   - Simple icon generator

## Design Guidelines

- Use brand colors (dore #D4AF37 for customer, charbon #1A1A1A for admin)
- Keep design simple and recognizable at small sizes
- Maskable icons should have safe zone (80% of canvas)
- Use transparent background or brand color background

## Source Image

Start with a high-resolution image (1024x1024 or larger):
- Customer: Logo with "Maison Slimani" text
- Admin: Simplified logo or "MS" monogram

