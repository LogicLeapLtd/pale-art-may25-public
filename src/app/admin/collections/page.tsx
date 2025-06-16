'use client'

import { useState, useEffect } from 'react'
import { getAllArtworks, updateArtwork, deleteArtwork } from '@/lib/database'
import Image from 'next/image'
import type { Product } from '@prisma/client'

export default function AdminCollectionsPage() {
  const [artworks, setArtworks] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedArtwork, setEditedArtwork] = useState<Partial<Product>>({})

  useEffect(() => {
    loadArtworks()
  }, [])

  async function loadArtworks() {
    try {
      const response = await fetch('/api/artworks/all')
      const data = await response.json()
      setArtworks(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load artworks:', error)
      setLoading(false)
    }
  }

  const handleEdit = (artwork: Product) => {
    setEditingId(artwork.id)
    setEditedArtwork({ ...artwork })
  }

  const handleSave = async () => {
    if (!editingId || !editedArtwork) return

    try {
      const response = await fetch(`/api/artworks/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedArtwork)
      })

      if (response.ok) {
        await loadArtworks()
        setEditingId(null)
        setEditedArtwork({})
      }
    } catch (error) {
      console.error('Failed to save:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return

    try {
      const response = await fetch(`/api/artworks/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadArtworks()
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Artwork Collection Manager</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artworks.map((artwork) => (
            <div key={artwork.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square relative overflow-hidden">
                {artwork.localImagePath || artwork.originalImageUrl ? (
                  (artwork.localImagePath && artwork.localImagePath.startsWith('http')) || 
                  (artwork.originalImageUrl && artwork.originalImageUrl.startsWith('http')) ? (
                    <Image
                      src={artwork.localImagePath || artwork.originalImageUrl}
                      alt={artwork.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <Image
                      src={artwork.localImagePath || artwork.originalImageUrl || '/placeholder-artwork.svg'}
                      alt={artwork.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                {editingId === artwork.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editedArtwork.name || ''}
                      onChange={(e) => setEditedArtwork({ ...editedArtwork, name: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={editedArtwork.artist || ''}
                      onChange={(e) => setEditedArtwork({ ...editedArtwork, artist: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                      placeholder="Artist"
                    />
                    <input
                      type="text"
                      value={editedArtwork.price || ''}
                      onChange={(e) => setEditedArtwork({ ...editedArtwork, price: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                      placeholder="Price"
                    />
                    <textarea
                      value={editedArtwork.description || ''}
                      onChange={(e) => setEditedArtwork({ ...editedArtwork, description: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                      rows={3}
                      placeholder="Description"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditedArtwork({})
                        }}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-1">{artwork.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{artwork.artist || 'Unknown Artist'}</p>
                    <p className="text-sm font-medium mb-2">{artwork.price === '0' || artwork.price === '' || !artwork.price ? 'Enquire for Price' : artwork.price}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(artwork)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(artwork.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}