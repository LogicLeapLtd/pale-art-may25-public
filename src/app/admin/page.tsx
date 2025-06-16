'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import CustomDropdown from '@/components/CustomDropdown'
import QRCodeLabel from '@/components/QRCodeLabel'

type Artwork = {
  id: string
  name: string
  artist: string | null
  status: string | null
  price: string
  slug: string | null
  createdAt: Date
  updatedAt: Date
  originalImageUrl: string
  originalProductUrl: string
  localImagePath: string | null
  description: string | null
  dimensions: string | null
  medium: string | null
  year: string | null
  featured: boolean
  category: string | null
  qrCodeUrl?: string
}

type Artist = {
  id: string
  name: string
  slug: string
  title: string
  biography: string
  portfolioUrl?: string | null
  imageUrl?: string | null
  featured?: boolean
}

type Event = {
  id: string
  title: string
  date: string
  description: string
  featured?: boolean
}

type TabType = 'overview' | 'artworks' | 'artists' | 'enquiries' | 'media' | 'qr-codes' | 'duplicates' | 'settings'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [currentDate, setCurrentDate] = useState('')
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [showQRGenerator, setShowQRGenerator] = useState(false)
  const [showQRLabel, setShowQRLabel] = useState<Artwork | null>(null)
  const [selectedArtworks, setSelectedArtworks] = useState<Set<string>>(new Set())
  const [showBatchEdit, setShowBatchEdit] = useState(false)
  const [batchEditData, setBatchEditData] = useState({ status: '', featured: '', medium: '' })
  const [editFormData, setEditFormData] = useState<Partial<Artwork> & { imageFile?: File }>({})
  const [showOtherArtist, setShowOtherArtist] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [qrLabelTheme, setQrLabelTheme] = useState<'default' | 'minimal' | 'dark'>('default')
  
  // Artist management state
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [showArtistForm, setShowArtistForm] = useState(false)
  const [artistFormData, setArtistFormData] = useState<Partial<Artist> & { imageFile?: File }>({})
  const [showArtistDeleteConfirm, setShowArtistDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    setCurrentDate(new Date().toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }))
    
    // Load data from database
    const loadData = async () => {
      try {
        const [artworksResponse, artistsResponse, activitiesResponse, enquiriesResponse] = await Promise.all([
          fetch('/api/artworks/all-admin'),
          fetch('/api/artists'),
          fetch('/api/activities?limit=10'),
          fetch('/api/enquiries')
        ])
        
        if (artworksResponse.ok && artistsResponse.ok) {
          const artworksData = await artworksResponse.json()
          const artistsData = await artistsResponse.json()
          setArtworks(artworksData)
          setArtists(artistsData)
        }
        
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          setActivities(activitiesData)
        }
        
        if (enquiriesResponse.ok) {
          const enquiriesData = await enquiriesResponse.json()
          setEnquiries(enquiriesData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredArtworks = artworks.filter(artwork =>
    (artwork.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (artwork.artist || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (artwork.medium || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const generateQRCode = async (artwork: Artwork) => {
    try {
      const response = await fetch(`/api/artworks/${artwork.id}/generate-qr`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Update the artwork in local state
        setArtworks(artworks.map(a => 
          a.id === artwork.id 
            ? { ...a, qrCodeUrl: result.qrCodeUrl }
            : a
        ))
        
        // Open the QR code in a new window
        window.open(result.qrCodeUrl, '_blank')
        
        // Refresh activities
        const activitiesResponse = await fetch('/api/activities?limit=10')
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          setActivities(activitiesData)
        }
      } else {
        alert('Failed to generate QR code')
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Error generating QR code')
    }
  }

  const showQRCode = (artwork: Artwork) => {
    setShowQRLabel(artwork)
  }

  const toggleArtworkSelection = (artworkId: string) => {
    const newSelection = new Set(selectedArtworks)
    if (newSelection.has(artworkId)) {
      newSelection.delete(artworkId)
    } else {
      newSelection.add(artworkId)
    }
    setSelectedArtworks(newSelection)
  }

  const selectAllArtworks = () => {
    if (selectedArtworks.size === filteredArtworks.length) {
      setSelectedArtworks(new Set())
    } else {
      setSelectedArtworks(new Set(filteredArtworks.map(a => a.id)))
    }
  }

  const handleBatchEdit = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/artworks/batch-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedArtworks),
          updates: batchEditData
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        // Reload artworks to show updated data
        const artworksResponse = await fetch('/api/artworks/all-admin')
        if (artworksResponse.ok) {
          const artworksData = await artworksResponse.json()
          setArtworks(artworksData)
        }
        setSelectedArtworks(new Set())
        setShowBatchEdit(false)
        setBatchEditData({ status: '', featured: '', medium: '' })
      } else {
        alert('Failed to update artworks')
      }
    } catch (error) {
      console.error('Error batch updating:', error)
      alert('Error updating artworks')
    } finally {
      setSaving(false)
    }
  }
  
  const handleSaveArtwork = async () => {
    if (!selectedArtwork) return
    
    try {
      setSaving(true)
      
      // Create a copy of form data without the imageFile
      const { imageFile, ...dataToSave } = editFormData
      
      // If there's a new image to upload
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json()
          dataToSave.localImagePath = url
        } else {
          alert('Failed to upload image')
          return
        }
      }
      
      const response = await fetch(`/api/artworks/${selectedArtwork.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      })
      
      if (response.ok) {
        const updatedArtwork = await response.json()
        // Update the artwork in the local state
        setArtworks(artworks.map(a => a.id === updatedArtwork.id ? updatedArtwork : a))
        setSelectedArtwork(null)
        setShowOtherArtist(false)
        setEditFormData({})
        alert('Artwork updated successfully')
        
        // Refresh activities
        const activitiesResponse = await fetch('/api/activities?limit=10')
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          setActivities(activitiesData)
        }
      } else {
        alert('Failed to update artwork')
      }
    } catch (error) {
      console.error('Error saving artwork:', error)
      alert('Error saving artwork')
    } finally {
      setSaving(false)
    }
  }
  
  const handleDeleteArtwork = async (artworkId: string) => {
    try {
      const response = await fetch(`/api/artworks/${artworkId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setArtworks(artworks.filter(a => a.id !== artworkId))
        setShowDeleteConfirm(null)
        alert('Artwork deleted successfully')
        
        // Refresh activities
        const activitiesResponse = await fetch('/api/activities?limit=10')
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          setActivities(activitiesData)
        }
      } else {
        alert('Failed to delete artwork')
      }
    } catch (error) {
      console.error('Error deleting artwork:', error)
      alert('Error deleting artwork')
    }
  }

  // Artist CRUD operations
  const handleSaveArtist = async () => {
    try {
      setSaving(true)
      
      let imageUrl = artistFormData.imageUrl
      
      // Upload image if a new file was selected
      if (artistFormData.imageFile) {
        const formData = new FormData()
        formData.append('file', artistFormData.imageFile)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          imageUrl = uploadResult.url
        } else {
          alert('Failed to upload image')
          return
        }
      }
      
      const method = selectedArtist ? 'PUT' : 'POST'
      const url = selectedArtist ? `/api/artists/admin/${selectedArtist.id}` : '/api/artists'
      
      const { imageFile, ...dataToSend } = artistFormData
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dataToSend, imageUrl })
      })
      
      if (response.ok) {
        const artistData = await response.json()
        
        if (selectedArtist) {
          // Update existing artist
          setArtists(artists.map(a => a.id === artistData.id ? artistData : a))
          alert('Artist updated successfully')
        } else {
          // Add new artist
          setArtists([...artists, artistData])
          alert('Artist created successfully')
        }
        
        setSelectedArtist(null)
        setShowArtistForm(false)
        setArtistFormData({})
      } else {
        alert('Failed to save artist')
      }
    } catch (error) {
      console.error('Error saving artist:', error)
      alert('Error saving artist')
    } finally {
      setSaving(false)
    }
  }
  
  const handleDeleteArtist = async (artistId: string) => {
    try {
      const response = await fetch(`/api/artists/admin/${artistId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setArtists(artists.filter(a => a.id !== artistId))
        setShowArtistDeleteConfirm(null)
        alert('Artist deleted successfully')
      } else {
        alert('Failed to delete artist')
      }
    } catch (error) {
      console.error('Error deleting artist:', error)
      alert('Error deleting artist')
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      {/* Admin Header - Account for main site header */}
      <div className="bg-forest-900 text-cream-50 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-display font-bold">Admin Dashboard</h1>
            <p className="text-gold-300 text-sm">Palé Hall Art Collection Management</p>
          </div>
          <div className="text-right">
            <p className="text-cream-200 text-sm">{currentDate}</p>
            <p className="text-gold-400 text-xs">Welcome, Joanna</p>
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Tab Navigation */}
      <div className="bg-white border-b border-cream-200 overflow-x-auto">
        <div className="flex min-w-max px-4">
          {[
            { 
              id: 'overview', 
              label: 'Overview', 
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            },
            { 
              id: 'artworks', 
              label: 'Artworks', 
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            },
            { 
              id: 'artists', 
              label: 'Artists', 
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            },
            { 
              id: 'enquiries', 
              label: 'Enquiries', 
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            },
            { 
              id: 'media', 
              label: 'Media Library', 
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            },
            { 
              id: 'qr-codes', 
              label: 'QR Codes', 
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            },
            { 
              id: 'duplicates', 
              label: 'Duplicates', 
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            },
            { 
              id: 'settings', 
              label: 'Settings', 
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-gold-500 text-gold-600 bg-gold-50'
                  : 'border-transparent text-forest-600 hover:text-gold-600 hover:bg-cream-50'
              }`}
            >
{tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 md:p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-elegant font-semibold text-forest-900">Dashboard Overview</h2>
              <p className="text-sm text-forest-600">Last updated: {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            
            {/* Stats Cards - Mobile Stacked */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-cream-200 hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => setActiveTab('artworks')}>
                <div className="flex items-center">
                  <div className="p-2 bg-forest-100 rounded-lg">
                    <svg className="w-6 h-6 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-forest-600">Total Artworks</p>
                    <p className="text-2xl font-bold text-forest-900">{artworks.length}</p>
                    <p className="text-xs text-forest-500">Click to manage</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-cream-200">
                <div className="flex items-center">
                  <div className="p-2 bg-gold-100 rounded-lg">
                    <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-forest-600">Artists</p>
                    <p className="text-2xl font-bold text-forest-900">{artists.length}</p>
                    <p className="text-xs text-forest-500">Featured: Mfikela Jean Samuel</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-cream-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-forest-600">Available</p>
                    <p className="text-2xl font-bold text-forest-900">
                      {artworks.filter(a => a.status === 'available').length}
                    </p>
                    <p className="text-xs text-forest-500">Ready for sale</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-cream-200">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-forest-600">Sold</p>
                    <p className="text-2xl font-bold text-forest-900">
                      {artworks.filter(a => a.status === 'sold').length}
                    </p>
                    <p className="text-xs text-forest-500">Collection value realized</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-cream-200 p-6">
              <h3 className="font-semibold text-forest-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <button
                  onClick={() => setActiveTab('artworks')}
                  className="flex flex-col items-center p-4 bg-forest-50 rounded-lg hover:bg-forest-100 transition-colors"
                >
                  <svg className="w-8 h-8 text-forest-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-forest-700">Manage Artworks</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('qr-codes')}
                  className="flex flex-col items-center p-4 bg-gold-50 rounded-lg hover:bg-gold-100 transition-colors"
                >
                  <svg className="w-8 h-8 text-gold-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-forest-700">Generate QR Codes</span>
                </button>
                
                <a
                  href="/admin/qr-print-pro"
                  className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span className="text-sm font-medium text-forest-700">QR Printing Pro</span>
                </a>
                
                <button
                  onClick={() => setActiveTab('media')}
                  className="flex flex-col items-center p-4 bg-cream-100 rounded-lg hover:bg-cream-200 transition-colors"
                >
                  <svg className="w-8 h-8 text-forest-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-sm font-medium text-forest-700">Media Library</span>
                </button>
                
                <a
                  href="/admin/leaflet-generator"
                  className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-forest-700">Leaflet Generator</span>
                </a>
              </div>
            </div>

            {/* Recent Activity & Site Links */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Enquiries */}
              <div className="bg-white rounded-lg border border-cream-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-forest-900">Recent Activity</h3>
                  <button
                    onClick={async () => {
                      const response = await fetch('/api/activities?limit=10')
                      if (response.ok) {
                        const data = await response.json()
                        setActivities(data)
                      }
                    }}
                    className="text-xs text-forest-500 hover:text-forest-700"
                  >
                    Refresh
                  </button>
                </div>
                <div className="space-y-3">
                  {activities.length > 0 ? (
                    activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-cream-50 rounded-lg">
                        <svg className={`w-5 h-5 mt-0.5 ${
                          activity.type === 'enquiry' ? 'text-blue-600' :
                          activity.type === 'artwork_update' ? 'text-forest-600' :
                          activity.type === 'artwork_delete' ? 'text-red-600' :
                          activity.type === 'qr_scan' ? 'text-gold-600' :
                          'text-gray-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {activity.type === 'enquiry' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          ) : activity.type === 'artwork_update' || activity.type === 'view' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          ) : activity.type === 'artwork_delete' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          )}
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-forest-900">{activity.title}</p>
                          <p className="text-xs text-forest-600">
                            {activity.description} - {new Date(activity.createdAt).toLocaleString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-forest-600">
                      <svg className="w-8 h-8 mx-auto mb-2 text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm">No recent activity</p>
                      <p className="text-xs text-forest-500 mt-1">Activities will appear here as you manage the collection</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Site Management */}
              <div className="bg-white rounded-lg border border-cream-200 p-6">
                <h3 className="font-semibold text-forest-900 mb-4">Site Management</h3>
                <div className="space-y-3">
                  <a
                    href="/"
                    target="_blank"
                    className="flex items-center justify-between p-3 bg-forest-50 rounded-lg hover:bg-forest-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-sm font-medium text-forest-700">View Homepage</span>
                    </div>
                    <svg className="w-4 h-4 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  
                  <a
                    href="/collection"
                    target="_blank"
                    className="flex items-center justify-between p-3 bg-forest-50 rounded-lg hover:bg-forest-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-forest-700">Public Collection</span>
                    </div>
                    <svg className="w-4 h-4 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  
                  <a
                    href="/artists"
                    target="_blank"
                    className="flex items-center justify-between p-3 bg-forest-50 rounded-lg hover:bg-forest-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm font-medium text-forest-700">Artists Gallery</span>
                    </div>
                    <svg className="w-4 h-4 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  
                  <a
                    href="/artists/mfikela-jean-samuel"
                    target="_blank"
                    className="flex items-center justify-between p-3 bg-gold-50 rounded-lg hover:bg-gold-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span className="text-sm font-medium text-forest-700">Mfikela Jean Samuel</span>
                    </div>
                    <svg className="w-4 h-4 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  
                  <a
                    href="/contact"
                    target="_blank"
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm font-medium text-forest-700">Contact Page</span>
                    </div>
                    <svg className="w-4 h-4 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Collection Value Summary */}
            <div className="bg-gradient-to-r from-gold-50 to-cream-100 rounded-lg border border-gold-200 p-6">
              <h3 className="font-semibold text-forest-900 mb-4">Collection Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gold-600">£{artworks.filter(a => a.price.includes('£')).reduce((sum, a) => sum + parseFloat(a.price.replace(/[^0-9.-]+/g, '') || '0'), 0).toLocaleString()}</p>
                  <p className="text-sm text-forest-600">Total Collection Value</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-forest-600">{Math.round(artworks.filter(a => a.status === 'available').length / artworks.length * 100)}%</p>
                  <p className="text-sm text-forest-600">Availability Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-forest-600">{new Set(artworks.map(a => a.medium).filter(Boolean)).size}</p>
                  <p className="text-sm text-forest-600">Art Mediums</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'artworks' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center flex-wrap gap-3">
                <h2 className="text-xl font-elegant font-semibold text-forest-900">Manage Artworks</h2>
                <Link 
                  href="/admin/batch-upload" 
                  className="px-4 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-700 transition-colors text-sm"
                >
                  Add New Artwork
                </Link>
                <Link 
                  href="/admin/artwork-manager" 
                  className="px-4 py-2 bg-forest-600 text-white rounded-md hover:bg-forest-700 transition-colors text-sm"
                >
                  Edit All
                </Link>
                {selectedArtworks.size > 0 && (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-forest-600 bg-cream-100 px-3 py-1 rounded-full">
                      {selectedArtworks.size} selected
                    </span>
                    <button
                      onClick={() => setShowBatchEdit(true)}
                      className="px-3 py-1 bg-gold-600 text-white text-sm rounded-md hover:bg-gold-700 transition-colors"
                    >
                      Batch Edit
                    </button>
                    <button
                      onClick={() => setSelectedArtworks(new Set())}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
              
              {/* Mobile-Friendly Search */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={selectAllArtworks}
                  className="text-sm text-forest-600 hover:text-forest-800 underline whitespace-nowrap"
                >
                  {selectedArtworks.size === filteredArtworks.length ? 'Deselect All' : 'Select All'}
                </button>
                <input
                  type="text"
                  placeholder="Search artworks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Mobile-Optimized Artwork Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArtworks.map((artwork) => (
                <div key={artwork.id} className="bg-white rounded-lg border border-cream-200 overflow-hidden shadow-sm relative">
                  {/* Image */}
                  <div className="aspect-square relative bg-gray-100">
                    {/* Checkbox */}
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedArtworks.has(artwork.id)}
                        onChange={() => toggleArtworkSelection(artwork.id)}
                        className="w-4 h-4 text-gold-600 bg-white border-gray-300 rounded focus:ring-gold-500 focus:ring-2"
                      />
                    </div>
                    {artwork.localImagePath ? (
                      <Image
                        src={artwork.localImagePath}
                        alt={artwork.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-forest-300 to-forest-500 flex items-center justify-center">
                        <svg className="w-16 h-16 text-cream-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        artwork.status === 'sold' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-green-500 text-white'
                      }`}>
                        {artwork.status || 'Available'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-forest-900 text-sm mb-1 line-clamp-2">
                      {artwork.name}
                    </h3>
                    <p className="text-forest-600 text-xs mb-2">
                      {artwork.artist || 'Unknown Artist'}
                    </p>
                    <p className="text-gold-600 font-medium text-sm mb-3">
                      {artwork.price}
                    </p>
                    
                    {/* Mobile Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedArtwork(artwork)
                          setEditFormData(artwork)
                          // Check if artist is not in the list
                          const artistNames = artists.map(a => a.name)
                          if (artwork.artist && 
                              artwork.artist !== 'Unknown Artist' && 
                              !artistNames.includes(artwork.artist)) {
                            setShowOtherArtist(true)
                          } else {
                            setShowOtherArtist(false)
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-forest-600 text-white text-xs rounded-md hover:bg-forest-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => showQRCode(artwork)}
                        className="px-3 py-2 bg-gold-500 hover:bg-gold-600 text-white text-xs rounded-md transition-colors"
                      >
                        QR Label
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(artwork.id)}
                        className="px-3 py-2 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'artists' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-xl font-elegant font-semibold text-forest-900">Manage Artists</h2>
              <button
                onClick={() => {
                  setSelectedArtist(null)
                  setArtistFormData({})
                  setShowArtistForm(true)
                }}
                className="px-4 py-2 bg-gold-600 text-white text-sm rounded-md hover:bg-gold-700 transition-colors"
              >
                Add New Artist
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artists.map((artist) => (
                <div key={artist.id} className="bg-white rounded-lg border border-cream-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {artist.imageUrl && (
                          <Image
                            src={artist.imageUrl}
                            alt={artist.name}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-lg border border-cream-200"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-forest-900 text-lg mb-1">
                            {artist.name}
                          </h3>
                          <p className="text-forest-600 text-sm mb-2">
                            {artist.title || 'Artist'}
                          </p>
                          {artist.featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-forest-600 line-clamp-3">
                      {artist.biography || 'No biography available'}
                    </p>
                  </div>
                  
                  {artist.portfolioUrl && (
                    <div className="mb-4">
                      <a
                        href={artist.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold-600 hover:text-gold-700 text-sm underline"
                      >
                        View Portfolio ↗
                      </a>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedArtist(artist)
                        setArtistFormData(artist)
                        setShowArtistForm(true)
                      }}
                      className="flex-1 px-3 py-2 bg-forest-600 text-white text-sm rounded-md hover:bg-forest-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setShowArtistDeleteConfirm(artist.id)}
                      className="px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {artists.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-forest-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-forest-600">No artists found.</p>
                <p className="text-forest-500 text-sm mt-1">Add your first artist to get started.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-4">
            <h2 className="text-xl font-elegant font-semibold text-forest-900">Media Library</h2>
            
            {/* Media Grid - showing actual artworks from database */}
            <div className="space-y-6">
              {/* Group artworks by artist */}
              {Object.entries(
                artworks.reduce((acc, artwork) => {
                  const artist = artwork.artist || 'Unknown Artist'
                  if (!acc[artist]) acc[artist] = []
                  acc[artist].push(artwork)
                  return acc
                }, {} as Record<string, Artwork[]>)
              ).map(([artist, artistArtworks]) => (
                <div key={artist}>
                  <h3 className="text-sm font-medium text-forest-700 mb-2">{artist}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                    {artistArtworks.map((artwork) => (
                      <div key={artwork.id} className="relative group">
                        <div className="aspect-square bg-white rounded-lg border border-cream-200 overflow-hidden shadow-sm">
                          {artwork.localImagePath ? (
                            <Image
                              src={artwork.localImagePath}
                              alt={artwork.name}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => window.open(artwork.localImagePath!, '_blank')}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-forest-300 to-forest-500">
                              <div className="text-center text-white p-2">
                                <p className="text-xs font-medium">{artwork.name}</p>
                                <p className="text-xs opacity-75">No image</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs font-medium truncate">{artwork.name}</p>
                          <p className="text-white/80 text-xs">{artwork.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'qr-codes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-elegant font-semibold text-forest-900">QR Code Management</h2>
              <div className="flex gap-3">
                <Link
                  href="/admin/qr-print-pro"
                  className="px-4 py-2 bg-forest-600 text-white text-sm rounded-md hover:bg-forest-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Professional QR Printing
                </Link>
                <button
                  onClick={() => {
                    filteredArtworks.forEach(artwork => generateQRCode(artwork))
                  }}
                  className="px-4 py-2 bg-gold-600 text-white text-sm rounded-md hover:bg-gold-700 transition-colors"
                >
                  Generate All QR Codes
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-cream-200 p-6">
              <h3 className="font-medium text-forest-800 mb-4">Generate QR Codes for Artworks</h3>
              <p className="text-sm text-forest-600 mb-6">
                Click on any artwork to generate a QR code that visitors can scan to view details. QR codes link to: <code className="bg-cream-100 px-2 py-1 rounded text-xs">/qr/[artwork-slug]</code>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArtworks.map((artwork) => (
                  <div key={artwork.id} className="bg-cream-50 rounded-lg overflow-hidden hover:bg-cream-100 transition-colors">
                    <div className="aspect-square bg-forest-100 relative">
                      {artwork.localImagePath ? (
                        <Image 
                          src={artwork.localImagePath} 
                          alt={artwork.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          artwork.status === 'available' ? 'bg-green-100 text-green-800' :
                          artwork.status === 'sold' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {artwork.status || 'available'}
                        </span>
                      </div>
                      {artwork.qrCodeUrl && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-gold-500 text-white px-2 py-1 text-xs rounded-full">
                            QR ✓
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-forest-900 mb-1 line-clamp-2">{artwork.name}</h4>
                      <p className="text-sm text-forest-600 mb-2">{artwork.artist}</p>
                      <p className="text-xs text-forest-500 mb-3">{artwork.medium} • {artwork.price}</p>
                      <button
                        onClick={() => showQRCode(artwork)}
                        className="w-full px-3 py-2 bg-gold-500 hover:bg-gold-600 text-white text-sm rounded-md transition-colors flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span>View QR Label</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredArtworks.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-forest-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-forest-600">No artworks found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-elegant font-semibold text-forest-900">Customer Enquiries</h2>
              <span className="text-sm text-forest-600">{enquiries.length} total enquiries</span>
            </div>
            
            <div className="bg-white rounded-lg border border-cream-200 overflow-hidden">
              {enquiries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-cream-50 border-b border-cream-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-forest-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-forest-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-forest-500 uppercase tracking-wider">
                          Artwork
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-forest-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-forest-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-forest-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-cream-200">
                      {enquiries.map((enquiry) => (
                        <tr key={enquiry.id} className="hover:bg-cream-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-forest-900">{enquiry.name}</div>
                              <div className="text-sm text-forest-500">{enquiry.email}</div>
                              {enquiry.phone && (
                                <div className="text-sm text-forest-500">{enquiry.phone}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-forest-900">{enquiry.subject}</div>
                            <div className="text-sm text-forest-500 mt-1 max-w-xs truncate">
                              {enquiry.message}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {enquiry.artworkName ? (
                              <div className="text-sm text-forest-900">{enquiry.artworkName}</div>
                            ) : (
                              <span className="text-sm text-forest-500">General enquiry</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              enquiry.status === 'new' 
                                ? 'bg-blue-100 text-blue-800'
                                : enquiry.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : enquiry.status === 'replied'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {enquiry.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-forest-500">
                            {new Date(enquiry.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                // TODO: Implement enquiry details modal
                                alert(`Enquiry details:\n\nFrom: ${enquiry.name}\nEmail: ${enquiry.email}\nSubject: ${enquiry.subject}\nMessage: ${enquiry.message}`)
                              }}
                              className="text-gold-600 hover:text-gold-900 mr-3"
                            >
                              View
                            </button>
                            <button
                              onClick={() => {
                                // TODO: Implement status update
                                alert('Status update feature coming soon')
                              }}
                              className="text-forest-600 hover:text-forest-900"
                            >
                              Update
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-forest-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-forest-600">No enquiries yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'duplicates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-elegant font-semibold text-forest-900">Manage Duplicates</h2>
              <Link 
                href="/admin/duplicates" 
                className="px-4 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-700 transition-colors text-sm"
              >
                Open Duplicate Manager
              </Link>
            </div>
            
            <div className="bg-white rounded-lg border border-cream-200 p-6">
              <h3 className="font-medium text-forest-800 mb-4">Duplicate Artwork Management</h3>
              <p className="text-forest-600 mb-4">
                Use the Duplicate Manager to identify and remove duplicate artwork entries from your database. 
                This tool groups artworks by name and allows you to select which duplicates to delete while keeping the original.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Important</h4>
                    <p className="text-yellow-700 text-sm">
                      Always review duplicates carefully before deletion. Deleted artworks cannot be recovered.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-cream-50 rounded-lg">
                  <svg className="w-8 h-8 text-forest-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <h4 className="font-medium text-forest-800 mb-1">Identify</h4>
                  <p className="text-sm text-forest-600">Groups artworks with identical names</p>
                </div>
                <div className="text-center p-4 bg-cream-50 rounded-lg">
                  <svg className="w-8 h-8 text-forest-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-medium text-forest-800 mb-1">Select</h4>
                  <p className="text-sm text-forest-600">Choose which duplicates to keep or remove</p>
                </div>
                <div className="text-center p-4 bg-cream-50 rounded-lg">
                  <svg className="w-8 h-8 text-forest-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <h4 className="font-medium text-forest-800 mb-1">Clean</h4>
                  <p className="text-sm text-forest-600">Remove selected duplicates safely</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h2 className="text-xl font-elegant font-semibold text-forest-900">Settings</h2>
            
            <div className="bg-white rounded-lg border border-cream-200 p-6">
              <h3 className="font-medium text-forest-800 mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Name</label>
                  <input 
                    type="text" 
                    value="Joanna" 
                    className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Role</label>
                  <input 
                    type="text" 
                    value="Curator & Art Director" 
                    className="w-full px-3 py-2 border border-cream-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Access Level</label>
                  <input 
                    type="text" 
                    value="Full Admin Access" 
                    className="w-full px-3 py-2 border border-cream-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <label htmlFor="qrTheme" className="text-forest-800 font-medium">Label Theme:</label>
              <CustomDropdown
                options={[
                  { value: 'default', label: '1 (Default)' },
                  { value: 'minimal', label: '2 (Minimal)' },
                  { value: 'dark', label: '3 (Dark)' },
                ]}
                value={qrLabelTheme}
                onChange={(value) => setQrLabelTheme(value as 'default' | 'minimal' | 'dark')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Edit Artwork Modal */}
      {selectedArtwork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-forest-900">Edit Artwork</h3>
              <button
                onClick={() => setSelectedArtwork(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Artist</label>
                  {!showOtherArtist ? (
                    <select
                      value={editFormData.artist || ''}
                      onChange={(e) => {
                        if (e.target.value === '__other__') {
                          setShowOtherArtist(true)
                          setEditFormData({...editFormData, artist: ''})
                        } else {
                          setEditFormData({...editFormData, artist: e.target.value})
                        }
                      }}
                      className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="">Select an artist...</option>
                      {artists
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((artist) => (
                          <option key={artist.id} value={artist.name}>
                            {artist.name}
                          </option>
                        ))}
                      <option value="Unknown Artist">Unknown Artist</option>
                      <option value="__other__">Other (specify)...</option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editFormData.artist || ''}
                        onChange={(e) => setEditFormData({...editFormData, artist: e.target.value})}
                        placeholder="Enter artist name"
                        className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowOtherArtist(false)
                          setEditFormData({...editFormData, artist: ''})
                        }}
                        className="text-sm text-forest-600 hover:text-forest-800"
                      >
                        ← Back to artist list
                      </button>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Price</label>
                  <input
                    type="text"
                    value={editFormData.price || ''}
                    onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Status</label>
                  <select
                    value={editFormData.status || 'available'}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                    <option value="on-display">On Display</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Medium</label>
                  <input
                    type="text"
                    value={editFormData.medium || ''}
                    onChange={(e) => setEditFormData({...editFormData, medium: e.target.value})}
                    placeholder="e.g., Oil on Canvas"
                    className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={editFormData.year || ''}
                    onChange={(e) => setEditFormData({...editFormData, year: e.target.value})}
                    placeholder="e.g., 2023"
                    className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={editFormData.dimensions || ''}
                    onChange={(e) => setEditFormData({...editFormData, dimensions: e.target.value})}
                    placeholder="e.g., 30 x 40 cm"
                    className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Featured</label>
                  <select
                    value={editFormData.featured ? 'true' : 'false'}
                    onChange={(e) => setEditFormData({...editFormData, featured: e.target.value === 'true'})}
                    className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">Description</label>
                <textarea
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  placeholder="Enter artwork description..."
                />
              </div>
              
              <div className="col-span-full">
                <label className="block text-sm font-medium text-forest-700 mb-1">Artwork Image</label>
                
                {/* Current Image Preview */}
                {(editFormData.localImagePath || selectedArtwork.localImagePath) && (
                  <div className="mb-4">
                    <p className="text-xs text-forest-600 mb-2">Current Image:</p>
                    <div className="aspect-square w-48 relative bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={editFormData.localImagePath || selectedArtwork.localImagePath || ''}
                        alt={selectedArtwork.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                
                {/* Image Upload */}
                <div className="mt-2">
                  <label className="block">
                    <span className="sr-only">Choose artwork image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          // Preview the image
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setEditFormData({
                              ...editFormData,
                              localImagePath: reader.result as string,
                              imageFile: file
                            })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="block w-full text-sm text-forest-600
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-gold-50 file:text-gold-700
                        hover:file:bg-gold-100
                        file:cursor-pointer"
                    />
                  </label>
                  <p className="text-xs text-forest-500 mt-1">
                    Upload a new image (JPG, PNG, WebP - Max 5MB)
                  </p>
                </div>
              </div>
            </form>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedArtwork(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveArtwork}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Edit Modal */}
      {showBatchEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-forest-900 mb-4">
              Batch Edit {selectedArtworks.size} Artworks
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">Status</label>
                <select
                  value={batchEditData.status}
                  onChange={(e) => setBatchEditData({...batchEditData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">No change</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="reserved">Reserved</option>
                  <option value="on-display">On Display</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">Featured</label>
                <select
                  value={batchEditData.featured}
                  onChange={(e) => setBatchEditData({...batchEditData, featured: e.target.value})}
                  className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">No change</option>
                  <option value="true">Featured</option>
                  <option value="false">Not Featured</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">Medium</label>
                <select
                  value={batchEditData.medium}
                  onChange={(e) => setBatchEditData({...batchEditData, medium: e.target.value})}
                  className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">No change</option>
                  <option value="ceramics">Ceramics</option>
                  <option value="sculpture">Sculpture</option>
                  <option value="painting">Painting</option>
                  <option value="mixed-media">Mixed Media</option>
                  <option value="photography">Photography</option>
                  <option value="drawing">Drawing</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBatchEdit(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchEdit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Applying...' : 'Apply Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-forest-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-forest-600 mb-6">
              Are you sure you want to delete this artwork? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteArtwork(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Artwork
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Artist Form Modal */}
      {showArtistForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-forest-900">
                {selectedArtist ? 'Edit Artist' : 'Add New Artist'}
              </h3>
              <button
                onClick={() => setShowArtistForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={artistFormData.name || ''}
                    onChange={(e) => setArtistFormData({...artistFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                    placeholder="e.g., Mfikela Jean Samuel"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={artistFormData.title || ''}
                    onChange={(e) => setArtistFormData({...artistFormData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                    placeholder="e.g., Contemporary Artist"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">Portfolio URL</label>
                <input
                  type="url"
                  value={artistFormData.portfolioUrl || ''}
                  onChange={(e) => setArtistFormData({...artistFormData, portfolioUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  placeholder="https://artist-website.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">Artist Image</label>
                {artistFormData.imageUrl && !artistFormData.imageFile && (
                  <div className="mb-2">
                    <Image
                      src={artistFormData.imageUrl}
                      alt={artistFormData.name || 'Artist'}
                      width={200}
                      height={200}
                      className="w-32 h-32 object-cover rounded-lg border border-cream-200"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setArtistFormData({...artistFormData, imageFile: file})
                    }
                  }}
                  className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                />
                {artistFormData.imageFile && (
                  <p className="text-sm text-forest-600 mt-1">
                    New image selected: {artistFormData.imageFile.name}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">Biography</label>
                <textarea
                  value={artistFormData.biography || ''}
                  onChange={(e) => setArtistFormData({...artistFormData, biography: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  placeholder="Tell us about the artist's background, style, and achievements..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">Featured Artist</label>
                <select
                  value={artistFormData.featured ? 'true' : 'false'}
                  onChange={(e) => setArtistFormData({...artistFormData, featured: e.target.value === 'true'})}
                  className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </form>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowArtistForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveArtist}
                disabled={saving || !artistFormData.name}
                className="flex-1 px-4 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : selectedArtist ? 'Update Artist' : 'Create Artist'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Artist Delete Confirmation Modal */}
      {showArtistDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-forest-900 mb-4">
              Confirm Delete Artist
            </h3>
            <p className="text-forest-600 mb-6">
              Are you sure you want to delete this artist? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowArtistDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteArtist(showArtistDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Artist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Label Modal */}
      {showQRLabel && (
        <QRCodeLabel
          artwork={showQRLabel}
          onClose={() => setShowQRLabel(null)}
          theme={qrLabelTheme}
        />
      )}
    </div>
  )
}