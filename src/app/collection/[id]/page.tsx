import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getArtworkBySlug, getArtworksByArtist } from '@/lib/database'
import { parsePrice } from '@/lib/pricing'
import AddToCartButton from '@/components/AddToCartButton'
import EnquireButton from '@/components/EnquireButton'
import ProductCard from '@/components/ProductCard'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ArtworkPage({ params }: PageProps) {
  const { id } = await params
  const artwork = await getArtworkBySlug(id)
  
  if (!artwork) {
    notFound()
  }

  const priceInfo = parsePrice(artwork.price)
  const isAvailable = artwork.status === 'available'

  const relatedArtworks = artwork.artist 
    ? (await getArtworksByArtist(artwork.artist)).filter(art => art.id !== artwork.id).slice(0, 4)
    : []

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="container-luxury">
        <Link 
          href="/collection" 
          className="inline-flex items-center text-sage hover:text-forest mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg shadow-luxe">
              <Image
                src={artwork.localImagePath || artwork.originalImageUrl}
                alt={artwork.name}
                width={800}
                height={800}
                className="w-full h-auto object-contain"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={90}
              />
              {!isAvailable && (
                <div className="absolute top-4 right-4 bg-gold-600 text-cream-50 px-4 py-2 rounded-full text-sm font-medium capitalize">
                  {artwork.status}
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div>
            <h1 className="text-3xl md:text-4xl font-display text-forest-900 mb-4">
              {artwork.name}
            </h1>
            
            {artwork.artist && (
              <p className="text-xl text-gold-600 italic mb-6">
                by {artwork.artist}
              </p>
            )}

            <div className="prose prose-lg text-forest-700 mb-8">
              {artwork.description && (
                <p>{artwork.description}</p>
              )}
            </div>

            {/* Artwork Details */}
            <div className="border-t border-gold-200/50 pt-6 mb-8">
              <h3 className="text-lg font-medium text-forest-900 mb-4">Artwork Details</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {artwork.medium && (
                  <>
                    <dt className="text-sm font-medium text-sage">Medium</dt>
                    <dd className="text-sm text-forest-700">{artwork.medium}</dd>
                  </>
                )}
                {artwork.dimensions && (
                  <>
                    <dt className="text-sm font-medium text-sage">Dimensions</dt>
                    <dd className="text-sm text-forest-700">{artwork.dimensions}</dd>
                  </>
                )}
                {artwork.year && (
                  <>
                    <dt className="text-sm font-medium text-sage">Year</dt>
                    <dd className="text-sm text-forest-700">{artwork.year}</dd>
                  </>
                )}
                {artwork.category && (
                  <>
                    <dt className="text-sm font-medium text-sage">Category</dt>
                    <dd className="text-sm text-forest-700">{artwork.category}</dd>
                  </>
                )}
              </dl>
            </div>

            {/* Price and Actions */}
            <div className="border-t border-gold-200/50 pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-sage mb-1">Price</p>
                  <p className="text-2xl font-medium text-forest-900">
                    {priceInfo.display}
                  </p>
                </div>
                {artwork.status && artwork.status !== 'available' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gold-100 text-gold-800">
                    {artwork.status}
                  </span>
                )}
              </div>

              {isAvailable && (
                <div className="space-y-4">
                  {priceInfo.isPurchasable ? (
                    <AddToCartButton 
                      productId={artwork.id}
                      productName={artwork.name}
                    />
                  ) : (
                    <EnquireButton 
                      artwork={{
                        id: artwork.id,
                        name: artwork.name,
                        artist: artwork.artist
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="mt-8 p-4 bg-cream-100 rounded-lg">
              <p className="text-sm text-sage">
                {priceInfo.isPurchasable 
                  ? "Free shipping on all orders. Secure packaging guaranteed." 
                  : "Contact us for pricing and availability information."}
              </p>
            </div>
          </div>
        </div>

        {/* Related Works */}
        {relatedArtworks.length > 0 && (
          <div className="mt-16 pt-16 border-t border-cream-200">
            <h2 className="heading-featured mb-8 text-center">
              More by {artwork.artist}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedArtworks.map((relatedArtwork) => (
                <ProductCard key={relatedArtwork.id} product={relatedArtwork} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}