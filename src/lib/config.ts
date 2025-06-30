// Site configuration constants

// Production base URL - used for QR codes and other absolute URLs
// This ensures QR codes always point to the correct production domain
export const PRODUCTION_BASE_URL = 'http://palehallfineartandantiques.co.uk'

// Get the appropriate base URL based on environment
export const getBaseUrl = () => {
  // Always use production URL for QR codes and other permanent links
  return PRODUCTION_BASE_URL
}

// Site metadata
export const SITE_CONFIG = {
  name: 'Palé Hall Fine Art & Antiques',
  shortName: 'Palé Hall Art',
  description: 'Exceptional contemporary artworks at the distinguished Palé Hall',
  baseUrl: PRODUCTION_BASE_URL,
}