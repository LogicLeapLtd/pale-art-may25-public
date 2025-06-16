'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BatchArtwork {
  id: string
  file: File
  preview: string
  name: string
  artist: string
  price: string
  year: string
  dimensions: string
  medium: string
  description: string
  status: 'available' | 'sold' | 'reserved'
  featured: boolean
}

interface Artist {
  id: string
  name: string
}

export default function BatchUpload() {
  const router = useRouter()
  const [artworks, setArtworks] = useState<BatchArtwork[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [uploading, setUploading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'upload' | 'details' | 'review'>('upload')
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [successCount, setSuccessCount] = useState(0)

  // Load artists
  useEffect(() => {
    fetch('/api/artists')
      .then(res => res.json())
      .then(data => setArtists(data))
      .catch(err => console.error('Failed to load artists:', err))
  }, [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files: FileList) => {
    const newArtworks: BatchArtwork[] = []
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const artwork: BatchArtwork = {
            id: `batch-${Date.now()}-${Math.random()}`,
            file,
            preview: e.target?.result as string,
            name: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
            artist: '',
            price: '',
            year: new Date().getFullYear().toString(),
            dimensions: '',
            medium: '',
            description: '',
            status: 'available',
            featured: false
          }
          newArtworks.push(artwork)
          
          if (newArtworks.length === files.length || newArtworks.length === Array.from(files).filter(f => f.type.startsWith('image/')).length) {
            setArtworks(prev => [...prev, ...newArtworks])
            setCurrentStep('details')
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const updateArtwork = (id: string, field: keyof BatchArtwork, value: any) => {
    setArtworks(prev => prev.map(artwork => 
      artwork.id === id ? { ...artwork, [field]: value } : artwork
    ))
  }

  const removeArtwork = (id: string) => {
    setArtworks(prev => prev.filter(artwork => artwork.id !== id))
  }

  const applyToAll = (field: keyof BatchArtwork, value: any) => {
    setArtworks(prev => prev.map(artwork => ({ ...artwork, [field]: value })))
  }

  const handleSubmit = async () => {
    setUploading(true)
    setUploadProgress(0)
    setSuccessCount(0)

    for (let i = 0; i < artworks.length; i++) {
      const artwork = artworks[i]
      const formData = new FormData()
      
      formData.append('image', artwork.file)
      formData.append('name', artwork.name)
      formData.append('artist', artwork.artist)
      formData.append('price', artwork.price)
      formData.append('year', artwork.year)
      formData.append('dimensions', artwork.dimensions)
      formData.append('medium', artwork.medium)
      formData.append('description', artwork.description)
      formData.append('status', artwork.status)
      formData.append('featured', artwork.featured.toString())

      try {
        const response = await fetch('/api/artworks/create', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          setSuccessCount(prev => prev + 1)
        }
      } catch (error) {
        console.error('Failed to upload artwork:', error)
      }

      setUploadProgress(((i + 1) / artworks.length) * 100)
    }

    setUploading(false)
    
    // Show success message and redirect
    setTimeout(() => {
      router.push('/admin?tab=artworks')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-cream-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin?tab=artworks" className="text-gold-600 hover:text-gold-700 flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin
          </Link>
          <h1 className="text-3xl font-display text-forest-900 mb-2">Batch Upload Artworks</h1>
          <p className="text-forest-600">Upload multiple artworks at once and set their details</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep === 'upload' ? 'text-gold-600' : 'text-forest-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'upload' ? 'bg-gold-600 text-white' : 'bg-forest-200'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Upload Images</span>
            </div>
            <div className="w-12 h-0.5 bg-forest-200"></div>
            <div className={`flex items-center ${currentStep === 'details' ? 'text-gold-600' : 'text-forest-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'details' ? 'bg-gold-600 text-white' : 'bg-forest-200'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Add Details</span>
            </div>
            <div className="w-12 h-0.5 bg-forest-200"></div>
            <div className={`flex items-center ${currentStep === 'review' ? 'text-gold-600' : 'text-forest-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'review' ? 'bg-gold-600 text-white' : 'bg-forest-200'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Review & Upload</span>
            </div>
          </div>
        </div>

        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center ${
                dragActive ? 'border-gold-500 bg-gold-50' : 'border-forest-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <svg className="w-16 h-16 text-forest-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              
              <p className="text-xl font-medium text-forest-900 mb-2">
                Drop images here or click to browse
              </p>
              <p className="text-forest-600 mb-4">
                Support for JPG, PNG, WebP (max 10MB each)
              </p>
              
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="btn-primary cursor-pointer inline-block"
              >
                Select Images
              </label>
            </div>

            {artworks.length > 0 && (
              <div className="mt-6">
                <p className="text-forest-700 mb-4">{artworks.length} images selected</p>
                <button
                  onClick={() => setCurrentStep('details')}
                  className="btn-primary"
                >
                  Continue to Details
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 'details' && (
          <div className="space-y-6">
            {/* Bulk Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-forest-900 mb-4">Apply to All</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Artist</label>
                  <select
                    onChange={(e) => applyToAll('artist', e.target.value)}
                    className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="">Select artist...</option>
                    {artists.map(artist => (
                      <option key={artist.id} value={artist.name}>{artist.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Status</label>
                  <select
                    onChange={(e) => applyToAll('status', e.target.value)}
                    className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Year</label>
                  <input
                    type="text"
                    placeholder="e.g., 2024"
                    onChange={(e) => applyToAll('year', e.target.value)}
                    className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
            </div>

            {/* Individual Artwork Details */}
            <div className="space-y-4">
              {artworks.map((artwork, index) => (
                <div key={artwork.id} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-6">
                    {/* Image Preview */}
                    <div className="flex-shrink-0">
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                        <Image
                          src={artwork.preview}
                          alt={artwork.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-forest-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={artwork.name}
                          onChange={(e) => updateArtwork(artwork.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-forest-700 mb-1">Artist</label>
                        <select
                          value={artwork.artist}
                          onChange={(e) => updateArtwork(artwork.id, 'artist', e.target.value)}
                          className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                        >
                          <option value="">Select artist...</option>
                          {artists.map(artist => (
                            <option key={artist.id} value={artist.name}>{artist.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-forest-700 mb-1">Price</label>
                        <input
                          type="text"
                          value={artwork.price}
                          onChange={(e) => updateArtwork(artwork.id, 'price', e.target.value)}
                          placeholder="e.g., £1,500"
                          className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-forest-700 mb-1">Dimensions</label>
                        <input
                          type="text"
                          value={artwork.dimensions}
                          onChange={(e) => updateArtwork(artwork.id, 'dimensions', e.target.value)}
                          placeholder="e.g., 30 x 40 cm"
                          className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-forest-700 mb-1">Medium</label>
                        <input
                          type="text"
                          value={artwork.medium}
                          onChange={(e) => updateArtwork(artwork.id, 'medium', e.target.value)}
                          placeholder="e.g., Oil on Canvas"
                          className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-forest-700 mb-1">Year</label>
                        <input
                          type="text"
                          value={artwork.year}
                          onChange={(e) => updateArtwork(artwork.id, 'year', e.target.value)}
                          className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-forest-700 mb-1">Description</label>
                        <textarea
                          value={artwork.description}
                          onChange={(e) => updateArtwork(artwork.id, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={artwork.featured}
                            onChange={(e) => updateArtwork(artwork.id, 'featured', e.target.checked)}
                            className="mr-2 h-4 w-4 text-gold-600 rounded"
                          />
                          <span className="text-sm text-forest-700">Featured</span>
                        </label>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeArtwork(artwork.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('upload')}
                className="px-6 py-3 border border-forest-300 text-forest-700 rounded hover:bg-cream-100"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('review')}
                className="btn-primary"
              >
                Review & Upload
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 'review' && !uploading && successCount === 0 && (
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-forest-900 mb-6">Review Your Upload</h3>
            
            <div className="mb-6">
              <p className="text-forest-700">You are about to upload {artworks.length} artworks:</p>
              
              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                {artworks.map((artwork, index) => (
                  <div key={artwork.id} className="flex items-center gap-4 p-3 bg-cream-50 rounded">
                    <Image
                      src={artwork.preview}
                      alt={artwork.name}
                      width={48}
                      height={48}
                      className="rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-forest-900">{artwork.name}</p>
                      <p className="text-sm text-forest-600">
                        {artwork.artist || 'No artist'} • {artwork.price || 'No price'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('details')}
                className="px-6 py-3 border border-forest-300 text-forest-700 rounded hover:bg-cream-100"
              >
                Back to Details
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
              >
                Upload All Artworks
              </button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-forest-900 mb-6">Uploading Artworks...</h3>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-forest-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-cream-200 rounded-full h-3">
                <div 
                  className="bg-gold-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>

            <p className="text-center text-forest-700">
              Uploaded {successCount} of {artworks.length} artworks
            </p>
          </div>
        )}

        {/* Success Message */}
        {!uploading && successCount > 0 && (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-forest-900 mb-2">Upload Complete!</h3>
            <p className="text-forest-700 mb-4">
              Successfully uploaded {successCount} of {artworks.length} artworks
            </p>
            <p className="text-forest-600">Redirecting to admin dashboard...</p>
          </div>
        )}
      </div>
    </div>
  )
}