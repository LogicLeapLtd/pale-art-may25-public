import Hero from '@/components/Hero'
import FeaturedArtistSpotlight from '@/components/FeaturedArtistSpotlight'
import ProductGallery from '@/components/ProductGallery'
import CallToAction from '@/components/CallToAction'
import NewsletterSignup from '@/components/NewsletterSignup'

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedArtistSpotlight />
      <ProductGallery />
      <CallToAction />
      <NewsletterSignup />
    </main>
  )
}