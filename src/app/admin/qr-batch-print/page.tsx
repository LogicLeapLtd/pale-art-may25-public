'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useReactToPrint } from 'react-to-print'
import Link from 'next/link'

interface Artwork {
  id: string
  name: string
  artist: string
  medium: string
  dimensions: string
  year: string
  price: string
  description: string
  localImagePath?: string
  originalImageUrl?: string
  qrCodeUrl?: string
  slug: string
  status?: string
}

type LabelTheme = 'default' | 'minimal' | 'dark'
type LabelSize = 'small' | 'medium' | 'large'

export default function QRBatchPrintPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [selectedArtworks, setSelectedArtworks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [labelTheme, setLabelTheme] = useState<LabelTheme>('default')
  const [labelSize, setLabelSize] = useState<LabelSize>('medium')
  const [labelsPerPage, setLabelsPerPage] = useState(6)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState<Record<string, string>>({})
  
  const printRef = useRef<HTMLDivElement>(null)

  // Load artworks
  useEffect(() => {
    const loadArtworks = async () => {
      try {
        const response = await fetch('/api/artworks/all-admin')
        if (response.ok) {
          const data = await response.json()
          setArtworks(data)
        }
      } catch (error) {
        console.error('Error loading artworks:', error)
      } finally {
        setLoading(false)
      }
    }
    loadArtworks()
  }, [])

  // Filter artworks based on search
  const filteredArtworks = artworks.filter(artwork =>
    (artwork.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (artwork.artist || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Convert QR code URLs to base64 data URLs
  const convertQRCodesToBase64 = async () => {
    const selectedArtworkDetails = artworks.filter(a => selectedArtworks.has(a.id))
    const newDataUrls: Record<string, string> = {}
    
    for (const artwork of selectedArtworkDetails) {
      if (artwork.qrCodeUrl && !qrCodeDataUrls[artwork.id]) {
        try {
          const response = await fetch(artwork.qrCodeUrl)
          const blob = await response.blob()
          const reader = new FileReader()
          
          await new Promise<void>((resolve) => {
            reader.onloadend = () => {
              newDataUrls[artwork.id] = reader.result as string
              resolve()
            }
            reader.readAsDataURL(blob)
          })
        } catch (error) {
          console.error(`Failed to convert QR code for ${artwork.name}:`, error)
        }
      }
    }
    
    setQrCodeDataUrls(prev => ({ ...prev, ...newDataUrls }))
  }

  // Generate QR codes for selected artworks that don't have them
  const generateMissingQRCodes = async () => {
    const artworksNeedingQR = Array.from(selectedArtworks)
      .map(id => artworks.find(a => a.id === id))
      .filter(artwork => artwork && !artwork.qrCodeUrl) as Artwork[]

    if (artworksNeedingQR.length === 0) {
      return true
    }

    setGenerating(true)
    setProgress({ current: 0, total: artworksNeedingQR.length })

    try {
      for (let i = 0; i < artworksNeedingQR.length; i++) {
        const artwork = artworksNeedingQR[i]
        setProgress({ current: i + 1, total: artworksNeedingQR.length })
        
        const response = await fetch(`/api/artworks/${artwork.id}/generate-qr`, {
          method: 'POST'
        })
        
        if (response.ok) {
          const result = await response.json()
          // Update the artwork in local state
          setArtworks(prev => prev.map(a => 
            a.id === artwork.id 
              ? { ...a, qrCodeUrl: result.qrCodeUrl }
              : a
          ))
        } else {
          console.error(`Failed to generate QR code for ${artwork.name}`)
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      return true
    } catch (error) {
      console.error('Error generating QR codes:', error)
      return false
    } finally {
      setGenerating(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `QR Code Labels - Batch Print`,
    onBeforePrint: async () => {
      // Generate any missing QR codes before printing
      const success = await generateMissingQRCodes()
      if (!success) {
        alert('Some QR codes could not be generated. Please try again.')
        throw new Error('QR code generation failed')
      }
      
      // Convert QR codes to base64 for printing
      await convertQRCodesToBase64()
      
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 2000))
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        html, body {
          height: 100%;
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        .no-print {
          display: none !important;
        }
        .page-break {
          page-break-after: always;
          break-after: always;
        }
        img {
          max-width: 100% !important;
          display: block !important;
          visibility: visible !important;
        }
      }
    `
  })

  // Selection handlers
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedArtworks)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedArtworks(newSelection)
  }

  const selectAll = () => {
    if (selectedArtworks.size === filteredArtworks.length) {
      setSelectedArtworks(new Set())
    } else {
      setSelectedArtworks(new Set(filteredArtworks.map(a => a.id)))
    }
  }

  // Get selected artwork details
  const selectedArtworkDetails = artworks.filter(a => selectedArtworks.has(a.id))

  // Calculate label dimensions based on size
  const getLabelDimensions = (size: LabelSize) => {
    switch (size) {
      case 'small':
        return { width: '70mm', height: '100mm' }
      case 'medium':
        return { width: '100mm', height: '150mm' }
      case 'large':
        return { width: '150mm', height: '200mm' }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600 mx-auto mb-4"></div>
          <p className="text-forest-600">Loading artworks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="no-print bg-white border-b border-cream-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-display text-forest-900">Batch QR Code Printing</h1>
              <p className="text-forest-600 mt-1">Select artworks and print QR code labels in bulk</p>
            </div>
            <Link
              href="/admin"
              className="text-forest-600 hover:text-forest-800 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Admin
            </Link>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1">Search Artworks</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or artist..."
                className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1">Label Theme</label>
              <select
                value={labelTheme}
                onChange={(e) => setLabelTheme(e.target.value as LabelTheme)}
                className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
              >
                <option value="default">Default</option>
                <option value="minimal">Minimal</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1">Label Size</label>
              <select
                value={labelSize}
                onChange={(e) => setLabelSize(e.target.value as LabelSize)}
                className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
              >
                <option value="small">Small (7x10cm)</option>
                <option value="medium">Medium (10x15cm)</option>
                <option value="large">Large (15x20cm)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1">Labels per Page</label>
              <select
                value={labelsPerPage}
                onChange={(e) => setLabelsPerPage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
              >
                <option value={6}>6 per page</option>
                <option value={4}>4 per page</option>
                <option value={2}>2 per page</option>
                <option value={1}>1 per page</option>
              </select>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between bg-forest-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={selectAll}
                className="text-sm text-forest-700 hover:text-forest-900 font-medium"
              >
                {selectedArtworks.size === filteredArtworks.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-sm text-forest-600">
                {selectedArtworks.size} of {filteredArtworks.length} artworks selected
              </span>
            </div>
            
            <button
              onClick={handlePrint}
              disabled={selectedArtworks.size === 0 || generating}
              className="px-6 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Selected Labels
            </button>
          </div>

          {/* Progress Bar */}
          {generating && (
            <div className="mb-6 bg-white rounded-lg border border-cream-200 p-4">
              <p className="text-sm text-forest-700 mb-2">
                Generating QR codes... ({progress.current}/{progress.total})
              </p>
              <div className="w-full bg-cream-200 rounded-full h-2">
                <div 
                  className="bg-gold-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Artwork Selection Grid */}
      <div className="no-print p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredArtworks.map((artwork) => (
              <div
                key={artwork.id}
                className={`bg-white rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                  selectedArtworks.has(artwork.id)
                    ? 'border-gold-500 shadow-lg'
                    : 'border-cream-200 hover:border-forest-300'
                }`}
                onClick={() => toggleSelection(artwork.id)}
              >
                <div className="aspect-square bg-cream-100 relative">
                  {artwork.localImagePath ? (
                    <Image
                      src={artwork.localImagePath}
                      alt={artwork.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Selection Indicator */}
                  <div className="absolute top-2 right-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      selectedArtworks.has(artwork.id)
                        ? 'bg-gold-500 text-white'
                        : 'bg-white border-2 border-forest-300'
                    }`}>
                      {selectedArtworks.has(artwork.id) && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* QR Status */}
                  {artwork.qrCodeUrl && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-500 text-white px-2 py-1 text-xs rounded-full">
                        QR ✓
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <h3 className="font-medium text-forest-900 text-sm mb-1 line-clamp-1">{artwork.name}</h3>
                  <p className="text-xs text-forest-600">{artwork.artist}</p>
                  <p className="text-xs text-forest-500">{artwork.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Print Content - Hidden on screen */}
      <div 
        ref={printRef}
        id="print-content"
        style={{ 
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '210mm'
        }}
      >
        <BatchPrintLabels
          artworks={selectedArtworkDetails}
          theme={labelTheme}
          size={labelSize}
          labelsPerPage={labelsPerPage}
          qrCodeDataUrls={qrCodeDataUrls}
        />
      </div>

      {/* Global print styles */}
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body * {
            visibility: hidden;
          }
          
          #print-content, #print-content * {
            visibility: visible !important;
          }
          
          #print-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}

// Component for rendering labels for printing
function BatchPrintLabels({ 
  artworks, 
  theme, 
  size, 
  labelsPerPage,
  qrCodeDataUrls 
}: { 
  artworks: Artwork[]
  theme: LabelTheme
  size: LabelSize
  labelsPerPage: number
  qrCodeDataUrls: Record<string, string>
}) {
  const dimensions = getLabelDimensions(size)
  
  // Split artworks into pages
  const pages = []
  for (let i = 0; i < artworks.length; i += labelsPerPage) {
    pages.push(artworks.slice(i, i + labelsPerPage))
  }

  const getThemeStyles = () => {
    switch (theme) {
      case 'minimal':
        return {
          bg: 'bg-white',
          text: 'text-gray-900',
          border: 'border-gray-300',
          accent: 'text-gray-600'
        }
      case 'dark':
        return {
          bg: 'bg-gray-900',
          text: 'text-white',
          border: 'border-gray-700',
          accent: 'text-gray-300'
        }
      default:
        return {
          bg: 'bg-cream-50',
          text: 'text-forest-900',
          border: 'border-gold-400',
          accent: 'text-gold-600'
        }
    }
  }

  const styles = getThemeStyles()

  return (
    <>
      {pages.map((pageArtworks, pageIndex) => (
        <div 
          key={pageIndex} 
          className={pageIndex < pages.length - 1 ? 'page-break' : ''}
          style={{ 
            display: 'grid',
            gridTemplateColumns: labelsPerPage === 1 ? '1fr' : labelsPerPage <= 2 ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)',
            gap: '10mm',
            padding: '10mm'
          }}
        >
          {pageArtworks.map((artwork) => (
            <div
              key={artwork.id}
              className={`${styles.bg} ${styles.border} border-2 rounded-lg p-4 flex flex-col items-center justify-center`}
              style={{ 
                width: dimensions.width, 
                height: dimensions.height,
                margin: 'auto'
              }}
            >
              {/* Header */}
              <div className="text-center mb-4">
                <h1 className={`text-2xl font-display ${styles.text}`}>Palé Hall</h1>
                <p className={`text-sm ${styles.accent}`}>Art Gallery</p>
              </div>

              {/* QR Code */}
              {(artwork.qrCodeUrl || qrCodeDataUrls[artwork.id]) && (
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '8px', 
                  borderRadius: '8px', 
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <img
                    src={qrCodeDataUrls[artwork.id] || artwork.qrCodeUrl}
                    alt="QR Code"
                    style={{ 
                      width: '128px', 
                      height: '128px',
                      imageRendering: 'pixelated',
                      display: 'block'
                    }}
                  />
                </div>
              )}

              {/* Artwork Info */}
              <div className="text-center">
                <h3 className={`font-display text-lg ${styles.text} mb-1`}>{artwork.name}</h3>
                <p className={`text-sm ${styles.accent}`}>{artwork.artist}</p>
                <p className={`text-sm ${styles.accent} mt-2`}>{artwork.price}</p>
                <p className={`text-xs ${styles.accent} mt-1`}>ID: {artwork.slug || artwork.id}</p>
              </div>

              {/* Footer */}
              <div className={`text-center mt-auto pt-4 text-xs ${styles.accent}`}>
                <p>Scan for details • palehallfineartandantiques.co.uk</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  )
}

function getLabelDimensions(size: LabelSize) {
  switch (size) {
    case 'small':
      return { width: '70mm', height: '100mm' }
    case 'medium':
      return { width: '100mm', height: '150mm' }
    case 'large':
      return { width: '150mm', height: '200mm' }
  }
}