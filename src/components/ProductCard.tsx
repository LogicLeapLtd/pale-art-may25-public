'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { parsePrice } from '@/lib/pricing'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { ShoppingBag, Mail, Check } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: string
    artist?: string | null
    localImagePath?: string | null
    originalImageUrl: string
    status?: string | null
    slug?: string | null
    stock?: number | null
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const priceInfo = parsePrice(product.price)
  const isAvailable = product.status === 'available'
  const hasStock = (product.stock ?? 1) > 0
  const isInStock = isAvailable && hasStock
  const { addToCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push('/auth/login?redirect=/collection')
      return
    }

    setIsAdding(true)
    try {
      await addToCart(product.id)
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }
  
  return (
    <div className="group block">
      <div className="card-luxury p-0 overflow-hidden">
        <Link href={`/collection/${product.slug || product.id}`}>
          <div className="aspect-square relative overflow-hidden bg-cream-100">
            {/* Loading skeleton */}
            {imageLoading && (
              <div className="absolute inset-0 animate-pulse">
                <div className="w-full h-full bg-gradient-to-br from-cream-100 to-cream-200" />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            )}
            
            <Image
              src={product.localImagePath || product.originalImageUrl}
              alt={product.name}
              fill
              className={`object-contain transition-all duration-700 ${hasStock ? 'group-hover:scale-105' : 'opacity-60'} ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              quality={75}
              loading="lazy"
              onLoad={() => setImageLoading(false)}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
            {!hasStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white/90 text-forest-900 px-6 py-3 rounded-lg font-medium text-lg">
                  Out of Stock
                </div>
              </div>
            )}
            {!isAvailable && hasStock && (
              <div className="absolute top-4 right-4 bg-gold-600 text-cream-50 px-3 py-1 rounded-full text-sm font-medium capitalize">
                {product.status}
              </div>
            )}
          </div>
        </Link>
        
        <div className="p-6">
          <Link href={`/collection/${product.slug || product.id}`}>
            <h3 className="text-base md:text-lg lg:text-xl font-display text-forest-900 mb-2 group-hover:text-gold-700 transition-colors duration-300">
              {product.name}
            </h3>
            
            <p className="font-body text-gold-600 italic mb-3">
              {product.artist || 'Palé Hall Collection'}
            </p>
          </Link>
          
          <div className="flex items-center justify-between">
            <span className="font-elegant font-medium text-forest-900 text-sm">
              {priceInfo.display}
            </span>
            
            {isInStock && (
              <div className="flex items-center space-x-2">
                {priceInfo.isPurchasable ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding || justAdded}
                    className={`p-2 rounded-lg transition-all ${
                      justAdded 
                        ? 'bg-green-100 text-green-600' 
                        : 'text-forest hover:bg-gold-50'
                    } disabled:opacity-50`}
                    title={justAdded ? "Added to cart" : "Add to Cart"}
                  >
                    {justAdded ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <ShoppingBag className="w-5 h-5" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={`/artwork/${product.slug || product.id}?enquire=true`}
                    className="p-2 text-forest hover:bg-gold-50 rounded-lg transition-colors"
                    title="Enquire"
                  >
                    <Mail className="w-5 h-5" />
                  </Link>
                )}
              </div>
            )}
            {!hasStock && priceInfo.isPurchasable && (
              <span className="text-sm text-gray-500">Out of Stock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}