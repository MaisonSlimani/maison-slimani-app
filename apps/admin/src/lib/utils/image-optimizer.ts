/**
 * Client-side high-performance image optimization utility.
 * resizes and converts images to WebP before upload to save bandwidth and storage.
 */

interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg';
}

export async function optimizeImage(
  file: File, 
  options: OptimizationOptions = {}
): Promise<Blob> {
  const { 
    maxWidth = 1600, 
    maxHeight = 1600, 
    quality = 0.82, 
    format = 'image/webp' 
  } = options;

  // If the file is already small or is a GIF (we don't optimize animated GIFs easily), return as is
  if (file.size < 50000 || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve, _reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio resizing
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // Fallback to original
          return;
        }

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Return whichever is smaller (rare cases the "optimized" is larger)
              resolve(blob.size < file.size ? blob : file);
            } else {
              resolve(file);
            }
          },
          format,
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
