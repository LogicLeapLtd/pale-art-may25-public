// Image optimization utilities

// Base64 encoded 1x1 pixel blur placeholder
export const blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Kk="

// Get optimized image props for different contexts
export function getImageProps(
  src: string,
  alt: string,
  context: 'collection-grid' | 'collection-detail' | 'related' | 'admin',
  priority?: boolean,
  index?: number
) {
  const baseProps = {
    src,
    alt,
    placeholder: 'blur' as const,
    blurDataURL,
  }

  switch (context) {
    case 'collection-grid':
      return {
        ...baseProps,
        sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw",
        quality: 85,
        priority: priority || (index !== undefined && index < 8),
        loading: (index !== undefined && index < 4) ? 'eager' as const : 'lazy' as const,
      }
    
    case 'collection-detail':
      return {
        ...baseProps,
        sizes: "(max-width: 768px) 100vw, 50vw",
        quality: 90,
        priority: true,
        loading: 'eager' as const,
      }
    
    case 'related':
      return {
        ...baseProps,
        sizes: "(max-width: 768px) 100vw, 33vw",
        quality: 80,
        priority: false,
        loading: 'lazy' as const,
      }
    
    case 'admin':
      return {
        ...baseProps,
        sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
        quality: 75,
        priority: false,
        loading: 'lazy' as const,
      }
    
    default:
      return baseProps
  }
}

// Check if URL is from Vercel Blob Storage
export function isVercelBlobUrl(url: string): boolean {
  return url.includes('public.blob.vercel-storage.com')
}

// Get optimized URL for Vercel Blob (future enhancement)
export function getOptimizedUrl(url: string, width?: number, quality?: number): string {
  if (!isVercelBlobUrl(url)) {
    return url
  }
  
  // For now, return the original URL
  // In the future, you could add Vercel's image optimization parameters here
  return url
}