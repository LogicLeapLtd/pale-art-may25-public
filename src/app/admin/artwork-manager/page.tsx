'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Artwork {
  id: string;
  name: string;
  title: string;
  artist: string;
  category: string;
  confidence: string;
  imagePath: string;
  localImagePath?: string;
  originalImageUrl?: string;
  price: string;
  description: string;
  status: 'available' | 'sold' | 'hidden';
  lastModified: string;
}

export default function ArtworkManager() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Load artworks from API
  const loadArtworks = useCallback(async () => {
    try {
      const response = await fetch('/api/artworks/all');
      const data = await response.json();
      console.log('Loaded artworks:', data.slice(0, 2)); // Debug first 2 artworks
      setArtworks(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load artworks:', error);
      setLoading(false);
    }
  }, []);

  // Auto-save functionality
  const autoSave = useCallback(async (artwork: Artwork) => {
    setAutoSaveStatus('Saving...');
    try {
      const response = await fetch(`/api/artworks/${artwork.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...artwork,
          lastModified: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        setAutoSaveStatus('✅ Saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      } else {
        setAutoSaveStatus('❌ Save failed');
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('❌ Save failed');
    }
  }, []);

  // Update artwork with debounced auto-save
  const updateArtwork = useCallback((id: string, updates: Partial<Artwork>) => {
    setArtworks(prev => {
      const updated = prev.map(artwork => 
        artwork.id === id 
          ? { ...artwork, ...updates, lastModified: new Date().toISOString() }
          : artwork
      );
      
      // Auto-save after 1 second of no changes
      const updatedArtwork = updated.find(a => a.id === id);
      if (updatedArtwork) {
        setTimeout(() => autoSave(updatedArtwork), 1000);
      }
      
      return updated;
    });
  }, [autoSave]);

  // Delete artwork
  const deleteArtwork = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/artworks/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setArtworks(prev => prev.filter(artwork => artwork.id !== id));
        setAutoSaveStatus('🗑️ Artwork deleted');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setAutoSaveStatus('❌ Delete failed');
    }
  }, []);

  // Image upload
  const handleImageUpload = useCallback(async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('artworkId', id);

    try {
      setAutoSaveStatus('Uploading image...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const { imagePath } = await response.json();
        updateArtwork(id, { imagePath });
        setAutoSaveStatus('✅ Image uploaded');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      setAutoSaveStatus('❌ Upload failed');
    }
  }, [updateArtwork]);

  // Filtered artworks
  const filteredArtworks = artworks.filter(artwork => {
    const matchesSearch = (artwork.name || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
                         (artwork.artist || '').toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || artwork.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    loadArtworks();
  }, [loadArtworks]);

  if (loading) {
    return <div className="p-8 text-center">Loading artwork collection...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Artwork Manager</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{filteredArtworks.length} artworks</span>
              {autoSaveStatus && (
                <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {autoSaveStatus}
                </span>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search artworks..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="identified">Identified Artists</option>
              <option value="unidentified">Unidentified Artists</option>
            </select>
          </div>
        </div>

        {/* Artwork Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtworks.map((artwork) => (
            <div key={artwork.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Image Section */}
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={artwork.localImagePath || artwork.originalImageUrl || '/placeholder-artwork.svg'}
                  alt={artwork.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  priority={false}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Kk="
                  quality={85}
                  loading="lazy"
                />
                
                {/* Image Upload */}
                <label className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full cursor-pointer transition-all">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(artwork.id, file);
                    }}
                  />
                </label>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <input
                  type="text"
                  value={artwork.name || ''}
                  onChange={(e) => updateArtwork(artwork.id, { name: e.target.value })}
                  className="w-full text-lg font-semibold bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none"
                  placeholder="Artwork title"
                />

                {/* Artist */}
                <input
                  type="text"
                  value={artwork.artist || ''}
                  onChange={(e) => updateArtwork(artwork.id, { artist: e.target.value })}
                  className="w-full text-sm text-gray-600 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none"
                  placeholder="Artist name"
                />

                {/* Category Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    artwork.category === 'identified' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {artwork.category === 'identified' ? 'Identified' : 'Unidentified'}
                  </span>
                  
                  {/* Status */}
                  <select
                    value={artwork.status}
                    onChange={(e) => updateArtwork(artwork.id, { status: e.target.value as any })}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>

                {/* Price */}
                <input
                  type="text"
                  value={artwork.price || ''}
                  onChange={(e) => updateArtwork(artwork.id, { price: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Price (e.g., £250)"
                />

                {/* Description */}
                <textarea
                  value={artwork.description || ''}
                  onChange={(e) => updateArtwork(artwork.id, { description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Description, dimensions, medium, year..."
                />

                {/* Actions */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-gray-400">
                    ID: {artwork.id}
                  </span>
                  
                  <button
                    onClick={() => deleteArtwork(artwork.id)}
                    className="px-3 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArtworks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No artworks found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}