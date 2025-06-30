import { getAllArtworks, getArtworksByMedium, getArtworksByArtist, getUniqueArtists, getUniqueMediums } from '@/lib/database'
import Link from 'next/link'
import Image from 'next/image'
import CollectionFilters from '@/components/CollectionFilters'
import ProductCard from '@/components/ProductCard'

interface SearchParams {
  medium?: string
  artist?: string
  status?: string
  sort?: string
  priceRange?: string
}

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  let artworks
  
  if (params.medium) {
    artworks = await getArtworksByMedium(params.medium)
  } else if (params.artist && params.artist !== 'Artist Unknown') {
    artworks = await getArtworksByArtist(params.artist)
  } else {
    artworks = await getAllArtworks()
  }

  // Filter by status if specified
  if (params.status) {
    artworks = artworks.filter(artwork => artwork.status === params.status)
  }

  // Filter by price range if specified
  if (params.priceRange) {
    artworks = artworks.filter(artwork => {
      const price = parseFloat(artwork.price.replace(/[^0-9.-]+/g, '')) || 0
      
      switch (params.priceRange) {
        case 'under-1000':
          return price < 1000
        case '1000-5000':
          return price >= 1000 && price <= 5000
        case '5000-10000':
          return price >= 5000 && price <= 10000
        case 'over-10000':
          return price > 10000
        default:
          return true
      }
    })
  }

  // Helper function to parse price with special formats
  const parsePrice = (priceStr: string): number => {
    if (!priceStr || priceStr === '' || priceStr.toLowerCase() === 'sold') return 0
    
    // Handle "Pair £X" format - extract the first price only
    const pairMatch = priceStr.match(/Pair\s*£([\d,]+(?:\.\d+)?)/i)
    if (pairMatch) {
      return parseFloat(pairMatch[1].replace(/,/g, '')) || 0
    }
    
    // Extract the first price found in the string
    const priceMatch = priceStr.match(/£?([\d,]+(?:\.\d+)?)/i)
    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(/,/g, '')) || 0
    }
    
    return 0
  }

  // Sort artworks - default to price-high if no sort specified
  const sortMethod = params.sort || 'price-high'
  
  switch (sortMethod) {
    case 'price-low':
      artworks.sort((a, b) => {
        const priceA = parsePrice(a.price)
        const priceB = parsePrice(b.price)
        return priceA - priceB
      })
      break
    case 'price-high':
      artworks.sort((a, b) => {
        const priceA = parsePrice(a.price)
        const priceB = parsePrice(b.price)
        return priceB - priceA
      })
      break
    case 'newest':
      artworks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'oldest':
      artworks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      break
  }
  
  // Always sort by stock - out of stock items go to the bottom
  artworks.sort((a, b) => {
    const stockA = a.stock || 0
    const stockB = b.stock || 0
    if (stockA === 0 && stockB > 0) return 1
    if (stockA > 0 && stockB === 0) return -1
    return 0
  })

  const artists = await getUniqueArtists()
  const mediums = await getUniqueMediums()

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <Image
          src="/ART/landscape-hero-2.jpg"
          alt="Art Collection - Palé Hall"
          fill
          className="object-cover"
          priority
          quality={85}
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container-luxury relative text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="heading-section text-cream-50 mb-6">
              Art Collection
            </h1>
            <p className="text-luxury-large text-cream-100">
              Discover our carefully curated selection of contemporary artworks, featuring both established and emerging artists.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-cream-200">
        <div className="container-luxury">
          <CollectionFilters 
            artists={artists}
            mediums={mediums}
            currentArtist={params.artist}
            currentMedium={params.medium}
            currentStatus={params.status}
            currentSort={params.sort}
            currentPriceRange={params.priceRange}
          />

          <div className="flex items-center justify-between">
            <p className="text-forest-600 font-medium">
              {artworks.length === 0 ? 'No artworks found' : `Showing ${artworks.length} artwork${artworks.length !== 1 ? 's' : ''}`}
            </p>
            
            {artworks.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-forest-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Grid View</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Artworks Grid */}
      <section className="py-8 lg:py-12">
        <div className="container-luxury">
          {artworks.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="heading-card text-forest-900 mb-4">No artworks found</h3>
              <p className="text-luxury text-forest-600 mb-8">
                Try adjusting your filters or browse all artworks.
              </p>
              <Link href="/collection" className="btn-primary">
                View All Artworks
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {artworks.map((artwork) => (
                <ProductCard key={artwork.id} product={artwork} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}