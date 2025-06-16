'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Artwork {
  id: string
  name: string
  artist: string | null
  price: string
  year: string | null
  dimensions: string | null
  medium: string | null
  description: string | null
  status: string | null
  featured: boolean
  localImagePath: string | null
  originalImageUrl: string
  createdAt: string
  updatedAt: string
  slug: string | null
}

interface DuplicateGroup {
  name: string
  artworks: Artwork[]
}

export default function DuplicatesManager() {
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string[]>([])
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadDuplicates()
  }, [])

  const loadDuplicates = async () => {
    try {
      const response = await fetch('/api/artworks/all-unfiltered')
      if (!response.ok) throw new Error('Failed to fetch artworks')
      
      const artworks: Artwork[] = await response.json()
      
      // Group artworks by name (case insensitive)
      const groupedByName: { [key: string]: Artwork[] } = {}
      
      artworks.forEach(artwork => {
        const normalizedName = artwork.name.toLowerCase().trim()
        if (!groupedByName[normalizedName]) {
          groupedByName[normalizedName] = []
        }
        groupedByName[normalizedName].push(artwork)
      })
      
      // Filter to only groups with duplicates (more than 1 artwork)
      const duplicates: DuplicateGroup[] = Object.entries(groupedByName)
        .filter(([_, artworks]) => artworks.length > 1)
        .map(([name, artworks]) => ({
          name: artworks[0].name, // Use original casing from first artwork
          artworks: artworks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        }))
        .sort((a, b) => b.artworks.length - a.artworks.length) // Sort by number of duplicates
      
      setDuplicateGroups(duplicates)
    } catch (error) {
      console.error('Error loading duplicates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedForDeletion.size === 0) return
    
    const idsToDelete = Array.from(selectedForDeletion)
    setDeleting(idsToDelete)
    
    try {
      const deletePromises = idsToDelete.map(id =>
        fetch(`/api/artworks/${id}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      
      // Reload duplicates after deletion
      await loadDuplicates()
      setSelectedForDeletion(new Set())
    } catch (error) {
      console.error('Error deleting artworks:', error)
      alert('Error deleting some artworks. Please try again.')
    } finally {
      setDeleting([])
    }
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedForDeletion)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedForDeletion(newSelected)
  }

  const selectAllInGroup = (artworks: Artwork[]) => {
    const newSelected = new Set(selectedForDeletion)
    // Select all but keep the first one (oldest)
    artworks.slice(1).forEach(artwork => {
      newSelected.add(artwork.id)
    })
    setSelectedForDeletion(newSelected)
  }

  const selectAllDuplicates = () => {
    const newSelected = new Set<string>()
    duplicateGroups.forEach(group => {
      // Select all but keep the first one (oldest) in each group
      group.artworks.slice(1).forEach(artwork => {
        newSelected.add(artwork.id)
      })
    })
    setSelectedForDeletion(newSelected)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-xl text-forest-600">Loading duplicates...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin?tab=artworks" className="text-gold-600 hover:text-gold-700 flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin
          </Link>
          <h1 className="text-3xl font-display text-forest-900 mb-2">Duplicate Artworks Manager</h1>
          <p className="text-forest-600">Review and remove duplicate artwork entries</p>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-forest-900">{duplicateGroups.length}</p>
              <p className="text-sm text-forest-600">Artwork Names with Duplicates</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-forest-900">
                {duplicateGroups.reduce((sum, group) => sum + group.artworks.length, 0)}
              </p>
              <p className="text-sm text-forest-600">Total Duplicate Artworks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {duplicateGroups.reduce((sum, group) => sum + (group.artworks.length - 1), 0)}
              </p>
              <p className="text-sm text-forest-600">Excess Copies</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gold-600">{selectedForDeletion.size}</p>
              <p className="text-sm text-forest-600">Selected for Deletion</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {duplicateGroups.length > 0 && (
          <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={selectAllDuplicates}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              >
                Select All Duplicates (Keep Oldest)
              </button>
              <button
                onClick={() => setSelectedForDeletion(new Set())}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedForDeletion.size === 0 || deleting.length > 0}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting.length > 0 ? `Deleting ${deleting.length}...` : `Delete Selected (${selectedForDeletion.size})`}
              </button>
            </div>
          </div>
        )}

        {/* Duplicate Groups */}
        {duplicateGroups.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-forest-900 mb-2">No Duplicates Found!</h3>
            <p className="text-forest-600">All artworks have unique names.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {duplicateGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-forest-900">
                    "{group.name}" ({group.artworks.length} copies)
                  </h3>
                  <button
                    onClick={() => selectAllInGroup(group.artworks)}
                    className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                  >
                    Select Duplicates (Keep Oldest)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.artworks.map((artwork, index) => (
                    <div 
                      key={artwork.id} 
                      className={`border-2 rounded-lg p-4 transition-all ${
                        selectedForDeletion.has(artwork.id) 
                          ? 'border-red-500 bg-red-50' 
                          : index === 0 
                            ? 'border-green-500 bg-green-50'
                            : 'border-cream-300 bg-white'
                      }`}
                    >
                      {/* Selection checkbox */}
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedForDeletion.has(artwork.id)}
                            onChange={() => toggleSelection(artwork.id)}
                            disabled={deleting.includes(artwork.id)}
                            className="mr-2 h-4 w-4 text-red-600 rounded"
                          />
                          <span className="text-sm text-forest-700">
                            {index === 0 ? 'Original (Oldest)' : `Duplicate ${index}`}
                          </span>
                        </label>
                        {deleting.includes(artwork.id) && (
                          <span className="text-xs text-red-600">Deleting...</span>
                        )}
                      </div>

                      {/* Image */}
                      <div className="aspect-square relative bg-gray-100 rounded mb-3">
                        {artwork.localImagePath || artwork.originalImageUrl ? (
                          <Image
                            src={artwork.localImagePath || artwork.originalImageUrl}
                            alt={artwork.name}
                            fill
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1 text-sm">
                        <p><strong>ID:</strong> <code className="text-xs bg-gray-100 px-1 rounded">{artwork.id}</code></p>
                        <p><strong>Artist:</strong> {artwork.artist || 'Unknown'}</p>
                        <p><strong>Price:</strong> {artwork.price}</p>
                        <p><strong>Status:</strong> {artwork.status || 'N/A'}</p>
                        <p><strong>Featured:</strong> {artwork.featured ? 'Yes' : 'No'}</p>
                        <p><strong>Created:</strong> {new Date(artwork.createdAt).toLocaleString()}</p>
                        <p><strong>Updated:</strong> {new Date(artwork.updatedAt).toLocaleString()}</p>
                        {artwork.dimensions && <p><strong>Dimensions:</strong> {artwork.dimensions}</p>}
                        {artwork.year && <p><strong>Year:</strong> {artwork.year}</p>}
                        {artwork.medium && <p><strong>Medium:</strong> {artwork.medium}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}