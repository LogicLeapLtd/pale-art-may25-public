'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import CustomDropdown from './CustomDropdown'

interface CollectionFiltersProps {
  artists: string[]
  mediums: string[]
  currentArtist?: string
  currentMedium?: string
  currentStatus?: string
  currentSort?: string
  currentPriceRange?: string
}

export default function CollectionFilters({ 
  artists, 
  mediums, 
  currentArtist, 
  currentMedium, 
  currentStatus, 
  currentSort,
  currentPriceRange
}: CollectionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/collection?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push('/collection')
  }

  const hasActiveFilters = currentArtist || currentMedium || currentStatus || currentSort || currentPriceRange

  // Prepare dropdown options
  const artistOptions = [
    { value: '', label: 'All Artists' },
    ...artists.map(artist => ({ value: artist, label: artist }))
  ]

  const mediumOptions = [
    { value: '', label: 'All Mediums' },
    ...mediums.map(medium => ({ 
      value: medium, 
      label: medium.charAt(0).toUpperCase() + medium.slice(1) 
    }))
  ]

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'sold', label: 'Sold' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'on-loan', label: 'On Loan' }
  ]

  const sortOptions = [
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' }
  ]

  const priceRangeOptions = [
    { value: '', label: 'All Prices' },
    { value: 'under-1000', label: 'Under £1,000' },
    { value: '1000-5000', label: '£1,000 - £5,000' },
    { value: '5000-10000', label: '£5,000 - £10,000' },
    { value: 'over-10000', label: 'Over £10,000' }
  ]

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="font-display text-lg font-medium text-forest-900">
            Filter Collection
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gold-600 hover:text-gold-700 transition-colors duration-200 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Clear All</span>
            </button>
          )}
        </div>
        
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-cream-300 rounded-md bg-cream-50 hover:bg-cream-100 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="bg-gold-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {[currentArtist, currentMedium, currentStatus, currentSort, currentPriceRange].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Controls */}
      <div className={`grid gap-4 ${showMobileFilters ? 'grid-cols-1' : 'hidden lg:grid'} lg:grid-cols-2 xl:grid-cols-5`}>
        <CustomDropdown
          options={artistOptions}
          value={currentArtist || ''}
          onChange={(value) => updateFilter('artist', value)}
          placeholder="All Artists"
          className="min-w-0"
        />
        
        <CustomDropdown
          options={mediumOptions}
          value={currentMedium || ''}
          onChange={(value) => updateFilter('medium', value)}
          placeholder="All Mediums"
          className="min-w-0"
        />
        
        <CustomDropdown
          options={statusOptions}
          value={currentStatus || ''}
          onChange={(value) => updateFilter('status', value)}
          placeholder="All Status"
          className="min-w-0"
        />

        <CustomDropdown
          options={priceRangeOptions}
          value={currentPriceRange || ''}
          onChange={(value) => updateFilter('priceRange', value)}
          placeholder="All Prices"
          className="min-w-0"
        />
        
        <CustomDropdown
          options={sortOptions}
          value={currentSort || 'price-high'}
          onChange={(value) => updateFilter('sort', value)}
          placeholder="Sort By"
          className="min-w-0"
        />
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-forest-700">Active filters:</span>
          {currentArtist && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gold-100 text-gold-800 rounded-full text-sm">
              <span>Artist: {currentArtist}</span>
              <button
                onClick={() => updateFilter('artist', '')}
                className="text-gold-600 hover:text-gold-800"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {currentMedium && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gold-100 text-gold-800 rounded-full text-sm">
              <span>Medium: {currentMedium.charAt(0).toUpperCase() + currentMedium.slice(1)}</span>
              <button
                onClick={() => updateFilter('medium', '')}
                className="text-gold-600 hover:text-gold-800"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {currentStatus && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gold-100 text-gold-800 rounded-full text-sm">
              <span>Status: {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}</span>
              <button
                onClick={() => updateFilter('status', '')}
                className="text-gold-600 hover:text-gold-800"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {currentPriceRange && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gold-100 text-gold-800 rounded-full text-sm">
              <span>Price: {priceRangeOptions.find(opt => opt.value === currentPriceRange)?.label}</span>
              <button
                onClick={() => updateFilter('priceRange', '')}
                className="text-gold-600 hover:text-gold-800"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {currentSort && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gold-100 text-gold-800 rounded-full text-sm">
              <span>Sort: {sortOptions.find(opt => opt.value === currentSort)?.label}</span>
              <button
                onClick={() => updateFilter('sort', '')}
                className="text-gold-600 hover:text-gold-800"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}