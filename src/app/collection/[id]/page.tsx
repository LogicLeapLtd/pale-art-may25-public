import { getArtworkBySlug, getArtworksByArtist } from '@/lib/database'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const ARTWORK_PLACEHOLDER_IMAGE = '/ART/Landscape_Hero_2.JPG'

interface ArtworkDetailProps {
  params: Promise<{
    id: string
  }>
}

export default async function ArtworkDetail({ params }: ArtworkDetailProps) {
  const { id } = await params
  const artwork = await getArtworkBySlug(id)

  if (!artwork) {
    notFound()
  }

  const relatedArtworks = artwork.artist 
    ? (await getArtworksByArtist(artwork.artist)).filter(art => art.id !== artwork.id).slice(0, 3)
    : []

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-br from-forest-800 via-forest-700 to-forest-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-leaf-pattern opacity-10"></div>
        <div className="container-luxury relative text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="heading-section text-cream-50 mb-6">
              {artwork.name}
            </h1>
            <p className="text-luxury-large text-cream-100">
              {artwork.artist ? `by ${artwork.artist}` : 'From the Palé Hall Art Collection'}
            </p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="py-6 border-b border-cream-200">
        <div className="container-luxury">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-forest-600 hover:text-gold-600 transition-colors">
              Home
            </Link>
            <span className="text-forest-400">/</span>
            <Link href="/collection" className="text-forest-600 hover:text-gold-600 transition-colors">
              Collection
            </Link>
            <span className="text-forest-400">/</span>
            <span className="text-forest-800 font-medium">{artwork.name}</span>
          </nav>
        </div>
      </section>

      {/* Artwork Details */}
      <section className="section-padding">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-20">
            {/* Image */}
            <div className="space-y-6">
              <div className="relative aspect-square overflow-hidden rounded-lg shadow-luxe">
                <Image
                  src={artwork.localImagePath || artwork.originalImageUrl ? artwork.localImagePath || artwork.originalImageUrl : ARTWORK_PLACEHOLDER_IMAGE}
                  alt={artwork.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Kk="
                  quality={90}
                />
                {artwork.status !== 'available' && (
                  <div className="absolute top-6 right-6 bg-gold-600 text-cream-50 px-4 py-2 rounded-full text-sm font-medium capitalize">
                    {artwork.status}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h1 className="heading-featured mb-4">
                  {artwork.name}
                </h1>
                {artwork.artist && (
                  <p className="font-body text-xl text-gold-600 italic mb-4">
                    by {artwork.artist}
                  </p>
                )}
                
                <div className="space-y-2 text-luxury">
                  {artwork.medium && (
                    <p><span className="font-medium">Medium:</span> {artwork.medium.charAt(0).toUpperCase() + artwork.medium.slice(1)}</p>
                  )}
                  {artwork.dimensions && (
                    <p><span className="font-medium">Dimensions:</span> {artwork.dimensions}</p>
                  )}
                  {artwork.year && (
                    <p><span className="font-medium">Year:</span> {artwork.year}</p>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="bg-cream-100/50 backdrop-blur-sm border border-cream-200 rounded-lg p-6">
                <div>
                  <p className="heading-card text-forest-800 mb-2">
                    {artwork.price === '0' || artwork.price === '' || !artwork.price ? 'Enquire for Price' : artwork.price}
                  </p>
                  <p className="text-luxury text-sm mb-4">
                    {(artwork.price === '0' || artwork.price === '' || !artwork.price) ? 'Please contact us for pricing information.' : artwork.price.includes('£') ? 'Price includes VAT. Shipping calculated at enquiry.' : 'Please contact us for pricing information.'}
                  </p>
                  {(artwork.price === '0' || artwork.price === '' || !artwork.price || artwork.price.toLowerCase().includes('request')) && (
                    <Link 
                      href={`/contact?artwork=${artwork.slug}&subject=price-enquiry&artworkName=${encodeURIComponent(artwork.name)}`}
                      className="btn-primary w-full text-center inline-block"
                    >
                      Enquire Now for Pricing
                    </Link>
                  )}
                </div>
              </div>

              {/* Description */}
              {artwork.description && (
                <div>
                  <h3 className="font-elegant text-xl font-medium text-forest-800 mb-4">
                    About This Work
                  </h3>
                  <p className="text-luxury-large leading-relaxed">
                    {artwork.description}
                  </p>
                </div>
              )}

              {/* Artist Info */}
              {artwork.artist && (
                <div className="bg-cream-100/50 backdrop-blur-sm border border-cream-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-forest-300 to-forest-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 bg-gold-400/40 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-elegant text-lg font-medium text-forest-800 mb-2">
                        {artwork.artist}
                      </h4>
                      <p className="text-luxury text-sm mb-3">
                        Featured artist in the Palé Hall Art collection.
                      </p>
                      <Link 
                        href={`/artists?artist=${encodeURIComponent(artwork.artist)}`}
                        className="inline-flex items-center text-gold-600 hover:text-gold-700 transition-colors duration-300 text-sm font-medium"
                      >
                        View More Works
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href={`/contact?artwork=${artwork.slug}&subject=artwork-enquiry`}
                    className="btn-primary flex-1 text-center"
                  >
                    {artwork.status === 'sold' ? 'Enquire About Similar' : 'Purchase Enquiry'}
                  </Link>
                  <Link 
                    href={`/contact?subject=private-viewing`}
                    className="btn-secondary px-6 text-center"
                  >
                    Schedule Viewing
                  </Link>
                </div>
                
                <Link 
                  href="/how-to-buy"
                  className="block text-center font-body text-forest-600 hover:text-gold-600 transition-colors duration-300 text-sm"
                >
                  Learn about our purchase process
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Works */}
      {relatedArtworks.length > 0 && (
        <section className="section-padding border-t border-cream-200">
          <div className="container-luxury">
            <div className="text-center mb-12">
              <h2 className="heading-featured mb-4">
                More by {artwork.artist}
              </h2>
              <p className="text-luxury">
                Explore other exceptional works by this artist
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {relatedArtworks.map((relatedArtwork) => (
                <Link 
                  key={relatedArtwork.id} 
                  href={`/collection/${relatedArtwork.slug}`}
                  className="group block"
                >
                  <div className="card-luxury p-0 overflow-hidden">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={relatedArtwork.localImagePath || relatedArtwork.originalImageUrl ? relatedArtwork.localImagePath || relatedArtwork.originalImageUrl : ARTWORK_PLACEHOLDER_IMAGE}
                        alt={relatedArtwork.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Kk="
                        quality={80}
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-lg font-medium text-forest-800 mb-1 group-hover:text-gold-700 transition-colors duration-300">
                        {relatedArtwork.name}
                      </h3>
                      <p className="text-luxury text-sm text-forest-600">
                        {relatedArtwork.medium && relatedArtwork.medium.charAt(0).toUpperCase() + relatedArtwork.medium.slice(1)}
                      </p>
                      <p className="font-elegant font-medium text-forest-900 mt-2">
                        {relatedArtwork.price === '0' || relatedArtwork.price === '' || !relatedArtwork.price ? 'Enquire for Price' : relatedArtwork.price}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}