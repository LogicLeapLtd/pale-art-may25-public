'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useReactToPrint } from 'react-to-print'
import Link from 'next/link'
import QRCode from 'qrcode'

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

type PrintMode = 'professional' | 'cut-lines'
type LabelSize = 'a5' | 'a4' | 'a3' | 'custom'

const LABEL_SIZES = {
  a5: { width: 148, height: 210, name: 'A5 (148x210mm)' },
  a4: { width: 210, height: 297, name: 'A4 (210x297mm)' },
  a3: { width: 297, height: 420, name: 'A3 (297x420mm)' },
  custom: { width: 100, height: 100, name: 'Custom' }
}

export default function QRPrintProPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [selectedArtworks, setSelectedArtworks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [printMode, setPrintMode] = useState<PrintMode>('professional')
  const [labelSize, setLabelSize] = useState<LabelSize>('a5')
  const [customWidth, setCustomWidth] = useState(100)
  const [customHeight, setCustomHeight] = useState(100)
  const [showArtworkInfo, setShowArtworkInfo] = useState(true)
  const [includeBackImage, setIncludeBackImage] = useState(true)
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState<Record<string, string>>({})
  const [imageDataUrls, setImageDataUrls] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  
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

  // Filter artworks
  const filteredArtworks = artworks.filter(artwork =>
    (artwork.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (artwork.artist || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Generate QR codes using the same method as leaflet generator
  const generateQRCodes = async () => {
    const selectedArtworkDetails = artworks.filter(a => selectedArtworks.has(a.id))
    const newDataUrls: Record<string, string> = {}
    
    setProgress({ current: 0, total: selectedArtworkDetails.length })
    
    for (let i = 0; i < selectedArtworkDetails.length; i++) {
      const artwork = selectedArtworkDetails[i]
      setProgress({ current: i + 1, total: selectedArtworkDetails.length })
      
      if (!qrCodeDataUrls[artwork.id]) {
        try {
          const url = `${window.location.origin}/collection/${artwork.slug || artwork.id}`
          const qrCode = await QRCode.toDataURL(url, {
            width: 300,
            margin: 1,
            color: {
              dark: '#516951', // Forest green - same as leaflet generator
              light: '#FFFFFF'
            }
          })
          newDataUrls[artwork.id] = qrCode
        } catch (error) {
          console.error(`Failed to generate QR code for ${artwork.name}:`, error)
        }
      }
    }
    
    setQrCodeDataUrls(prev => ({ ...prev, ...newDataUrls }))
    console.log('Generated QR codes:', Object.keys(newDataUrls).length)
  }

  // Convert artwork images to base64
  const convertImagesToBase64 = async () => {
    if (!includeBackImage) return
    
    const selectedArtworkDetails = artworks.filter(a => selectedArtworks.has(a.id))
    const newDataUrls: Record<string, string> = {}
    
    for (const artwork of selectedArtworkDetails) {
      const imageUrl = artwork.localImagePath || artwork.originalImageUrl
      if (imageUrl && !imageDataUrls[artwork.id]) {
        try {
          const response = await fetch(imageUrl)
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
          console.error(`Failed to convert image for ${artwork.name}:`, error)
        }
      }
    }
    
    setImageDataUrls(prev => ({ ...prev, ...newDataUrls }))
  }


  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `QR Labels - ${printMode === 'professional' ? 'Professional' : 'Cut Sheet'}`,
    onBeforePrint: async () => {
      console.log('Starting print process...')
      console.log('Selected artworks:', selectedArtworkDetails.length)
      
      setGenerating(true)
      
      console.log('Generating QR codes...')
      await generateQRCodes()
      
      console.log('Converting images to base64...')
      await convertImagesToBase64()
      
      console.log('Waiting for images to load...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setGenerating(false)
      
      console.log('Print preparation complete')
    },
    pageStyle: `
      @page {
        size: ${labelSize === 'a5' ? 'A4' : labelSize === 'a4' ? 'A3' : 'A3 landscape'};
        margin: 0;
      }
      @media print {
        html, body {
          height: 100%;
          width: 100%;
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
          width: 100% !important;
        }
        
        .no-print {
          display: none !important;
        }
        
        .page-break {
          page-break-after: always;
          break-after: always;
        }
        
        .cut-line {
          border-color: #333 !important;
          border-style: dashed !important;
        }
        
        .no-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      }
    `
  })

  // Get label dimensions
  const getLabelDimensions = () => {
    if (labelSize === 'custom') {
      return { width: customWidth, height: customHeight }
    }
    return LABEL_SIZES[labelSize]
  }

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

  const selectedArtworkDetails = artworks.filter(a => selectedArtworks.has(a.id))

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
              <h1 className="text-3xl font-display text-forest-900">Professional QR Label Printing</h1>
              <p className="text-forest-600 mt-1">Generate print-ready QR labels for professional printing or in-house cutting</p>
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

          {/* Print Mode Selection */}
          <div className="bg-forest-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-forest-900 mb-3">Print Mode</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPrintMode('professional')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  printMode === 'professional'
                    ? 'border-gold-500 bg-white shadow-md'
                    : 'border-cream-300 bg-white hover:border-forest-300'
                }`}
              >
                <h4 className="font-medium text-forest-900 mb-1">Professional Printing</h4>
                <p className="text-sm text-forest-600">Clean format for printing companies. One label per page.</p>
              </button>
              
              <button
                onClick={() => setPrintMode('cut-lines')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  printMode === 'cut-lines'
                    ? 'border-gold-500 bg-white shadow-md'
                    : 'border-cream-300 bg-white hover:border-forest-300'
                }`}
              >
                <h4 className="font-medium text-forest-900 mb-1">Cut Sheet Format</h4>
                <p className="text-sm text-forest-600">Multiple labels per page with cut lines for in-house printing.</p>
              </button>
            </div>
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
              <label className="block text-sm font-medium text-forest-700 mb-1">Label Size</label>
              <select
                value={labelSize}
                onChange={(e) => setLabelSize(e.target.value as LabelSize)}
                className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
              >
                <option value="a5">A5 (148x210mm)</option>
                <option value="a4">A4 (210x297mm)</option>
                <option value="a3">A3 (297x420mm)</option>
                <option value="custom">Custom Size</option>
              </select>
            </div>
            
            {labelSize === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Width (mm)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">Height (mm)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </>
            )}
            
            <div className="flex items-end space-x-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showArtworkInfo}
                  onChange={(e) => setShowArtworkInfo(e.target.checked)}
                  className="rounded text-gold-600 focus:ring-gold-500"
                />
                <span className="text-sm text-forest-700">Include artwork details</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeBackImage}
                  onChange={(e) => setIncludeBackImage(e.target.checked)}
                  className="rounded text-gold-600 focus:ring-gold-500"
                />
                <span className="text-sm text-forest-700">Include artwork image on back</span>
              </label>
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
            
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  setGenerating(true)
                  await generateQRCodes()
                  setGenerating(false)
                }}
                disabled={selectedArtworks.size === 0 || generating}
                className="px-4 py-2 bg-forest-600 text-white rounded-md hover:bg-forest-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
              <button
                onClick={handlePrint}
                disabled={selectedArtworks.size === 0 || generating}
                className="px-6 py-2 bg-gold-600 text-white rounded-md hover:bg-gold-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Labels
              </button>
            </div>
          </div>

          {/* Progress */}
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
          
          {/* Preview Section */}
          {selectedArtworkDetails.length > 0 && Object.keys(qrCodeDataUrls).length > 0 && (
            <div className="mb-6 bg-white rounded-lg border border-cream-200 p-6">
              <h3 className="text-lg font-medium text-forest-900 mb-4">Preview</h3>
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <p className="text-sm text-forest-600 mb-2">
                    Mode: <span className="font-medium">{printMode === 'professional' ? 'Professional (one per page)' : 'Cut Sheet (multiple per page)'}</span>
                  </p>
                  <p className="text-sm text-forest-600 mb-2">
                    Label Size: <span className="font-medium">{LABEL_SIZES[labelSize].name}</span>
                  </p>
                  <p className="text-sm text-forest-600">
                    Options: {showArtworkInfo ? '✓ Artwork details' : '✗ Artwork details'}, {includeBackImage ? '✓ Back image' : '✗ Back image'}
                  </p>
                </div>
                
                {/* Sample QR Preview */}
                {selectedArtworkDetails[0] && qrCodeDataUrls[selectedArtworkDetails[0].id] && (
                  <div className="bg-cream-50 p-4 rounded-lg border border-cream-200">
                    <p className="text-xs text-forest-600 mb-2 text-center">Sample QR Code</p>
                    <div className="bg-white p-2 border-2 border-forest-600 rounded">
                      <img 
                        src={qrCodeDataUrls[selectedArtworkDetails[0].id]} 
                        alt="Sample QR"
                        className="w-24 h-24"
                        style={{ imageRendering: 'crisp-edges' }}
                      />
                    </div>
                    <p className="text-xs text-forest-500 mt-2 text-center">Forest Green (#516951)</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Artwork Grid */}
      <div className="no-print p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
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
                <div className="aspect-square bg-cream-100 relative p-2">
                  {artwork.localImagePath ? (
                    <Image
                      src={artwork.localImagePath}
                      alt={artwork.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="absolute top-1 right-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      selectedArtworks.has(artwork.id)
                        ? 'bg-gold-500 text-white'
                        : 'bg-white border-2 border-forest-300'
                    }`}>
                      {selectedArtworks.has(artwork.id) && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>

                </div>
                
                <div className="p-2">
                  <h3 className="font-medium text-forest-900 text-xs mb-0.5 line-clamp-1">{artwork.name}</h3>
                  <p className="text-xs text-forest-600 line-clamp-1">{artwork.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Print Content - Hidden on screen, visible when printing */}
      {selectedArtworkDetails.length > 0 && (
        <div 
          ref={printRef}
          id="print-content"
          className="print-content-wrapper"
          style={{ 
            position: 'fixed',
            left: '-9999px',
            top: 0,
            width: labelSize === 'a5' ? '210mm' : labelSize === 'a4' ? '297mm' : '420mm'
          }}
        >
          {printMode === 'professional' ? (
          <ProfessionalPrintLabels
            artworks={selectedArtworkDetails}
            dimensions={getLabelDimensions()}
            showInfo={showArtworkInfo}
            includeBackImage={includeBackImage}
            qrCodeDataUrls={qrCodeDataUrls}
            imageDataUrls={imageDataUrls}
            labelSize={labelSize}
          />
        ) : (
          <CutSheetLabels
            artworks={selectedArtworkDetails}
            dimensions={getLabelDimensions()}
            showInfo={showArtworkInfo}
            includeBackImage={includeBackImage}
            qrCodeDataUrls={qrCodeDataUrls}
            imageDataUrls={imageDataUrls}
            labelSize={labelSize}
          />
        )}
        </div>
      )}
      
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
            opacity: 1 !important;
            z-index: 9999 !important;
          }
          
          .page-break {
            page-break-after: always;
            break-after: always;
          }
          
          .no-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}

// Professional print format - one label per page
function ProfessionalPrintLabels({ 
  artworks, 
  dimensions, 
  showInfo,
  includeBackImage,
  qrCodeDataUrls,
  imageDataUrls,
  labelSize
}: { 
  artworks: Artwork[]
  dimensions: { width: number; height: number }
  showInfo: boolean
  includeBackImage: boolean
  qrCodeDataUrls: Record<string, string>
  imageDataUrls: Record<string, string>
  labelSize: 'a4' | 'a5' | 'a3' | 'custom'
}) {
  return (
    <>
      {artworks.map((artwork, index) => (
        <React.Fragment key={artwork.id}>
          {/* Front side - QR Code */}
          <div 
            className={includeBackImage ? '' : (index < artworks.length - 1 ? 'page-break' : '')}
            style={{
              width: labelSize === 'a5' ? '210mm' : labelSize === 'a4' ? '297mm' : '420mm',
              height: labelSize === 'a5' ? '297mm' : labelSize === 'a4' ? '420mm' : '594mm',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white'
            }}
          >
            <div
              style={{
                width: `${dimensions.width}mm`,
                height: `${dimensions.height}mm`,
                border: '1px solid #ddd',
                padding: '10mm',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white'
              }}
            >
              {/* QR Code */}
              {qrCodeDataUrls[artwork.id] ? (
                <div style={{
                  width: `${Math.min(dimensions.width - 20, 80)}mm`,
                  height: `${Math.min(dimensions.width - 20, 80)}mm`,
                  marginBottom: showInfo ? '5mm' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  padding: '2mm',
                  border: '2px solid #516951'
                }}>
                  <img
                    src={qrCodeDataUrls[artwork.id]}
                    alt="QR Code"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      imageRendering: 'crisp-edges',
                      display: 'block'
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  width: `${Math.min(dimensions.width - 20, 80)}mm`,
                  height: `${Math.min(dimensions.width - 20, 80)}mm`,
                  marginBottom: showInfo ? '5mm' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #ccc',
                  backgroundColor: '#f9f9f9'
                }}>
                  <span style={{ fontSize: '10pt', color: '#999' }}>Generating QR...</span>
                </div>
              )}
              
              {/* Artwork Info */}
              {showInfo && (
                <div style={{ textAlign: 'center', marginTop: '5mm' }}>
                  <div style={{ 
                    fontSize: '14pt', 
                    fontWeight: 'bold', 
                    marginBottom: '2mm',
                    fontFamily: 'Francie Serif, Georgia, serif',
                    color: '#1f2937'
                  }}>
                    {artwork.name}
                  </div>
                  <div style={{ 
                    fontSize: '11pt', 
                    color: '#516951',
                    fontStyle: 'italic',
                    fontFamily: 'Crimson Text, Georgia, serif'
                  }}>
                    {artwork.artist}
                  </div>
                  <div style={{ 
                    fontSize: '12pt', 
                    marginTop: '3mm',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {artwork.price.startsWith('£') || artwork.price === 'POA' ? artwork.price : `£${artwork.price}`}
                  </div>
                  <div style={{ 
                    fontSize: '9pt', 
                    color: '#6b7280', 
                    marginTop: '3mm',
                    fontFamily: 'Crimson Text, Georgia, serif'
                  }}>
                    {artwork.slug || artwork.id}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Back side - Artwork Image */}
          {includeBackImage && (
            <div 
              className={index < artworks.length - 1 ? 'page-break' : ''}
              style={{
                width: labelSize === 'a5' ? '210mm' : labelSize === 'a4' ? '297mm' : '420mm',
                height: labelSize === 'a5' ? '297mm' : labelSize === 'a4' ? '420mm' : '594mm',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white'
              }}
            >
              <div
                style={{
                  width: `${dimensions.width}mm`,
                  height: `${dimensions.height}mm`,
                  border: '1px solid #ddd',
                  padding: '10mm',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white'
                }}
              >
                {(artwork.localImagePath || artwork.originalImageUrl || imageDataUrls[artwork.id]) && (
                  <img
                    src={imageDataUrls[artwork.id] || artwork.localImagePath || artwork.originalImageUrl}
                    alt={artwork.name}
                    style={{
                      width: `${dimensions.width - 20}mm`,
                      height: `${dimensions.height - 20}mm`,
                      objectFit: 'contain'
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </React.Fragment>
      ))}
    </>
  )
}

// Cut sheet format - multiple labels per page with cut lines
function CutSheetLabels({ 
  artworks, 
  dimensions, 
  showInfo,
  includeBackImage,
  qrCodeDataUrls,
  imageDataUrls,
  labelSize 
}: { 
  artworks: Artwork[]
  dimensions: { width: number; height: number }
  showInfo: boolean
  includeBackImage: boolean
  qrCodeDataUrls: Record<string, string>
  imageDataUrls: Record<string, string>
  labelSize?: LabelSize
}) {
  // Calculate page dimensions based on label size
  const getPageDimensions = () => {
    switch (labelSize) {
      case 'a5':
        return { width: 210, height: 297 } // A4 portrait
      case 'a4':
        return { width: 297, height: 420 } // A3 portrait
      case 'a3':
        return { width: 420, height: 594 } // A3 landscape
      default:
        return { width: 210, height: 297 } // Default to A4
    }
  }
  
  const pageDimensions = getPageDimensions()
  const pageWidth = pageDimensions.width
  const pageHeight = pageDimensions.height
  const margin = 5 // Small margin to prevent cutoff
  const gap = 0 // NO GAP - CELLS TOUCH EACH OTHER
  
  // Force 2x2 grid for cut sheet format
  const labelsPerRow = 2
  const labelsPerColumn = 2
  const labelsPerPage = 4
  
  // Split artworks into pages
  const pages = []
  for (let i = 0; i < artworks.length; i += labelsPerPage) {
    pages.push(artworks.slice(i, i + labelsPerPage))
  }
  
  return (
    <>
      {/* Pages with QR codes on front, images on back */}
      {pages.map((pageArtworks, pageIndex) => (
        <React.Fragment key={`page-${pageIndex}`}>
          {/* Front side - QR codes */}
          <div 
            className={includeBackImage ? '' : (pageIndex < pages.length - 1 ? 'page-break' : '')}
          style={{
            width: `${pageWidth}mm`,
            height: `${pageHeight}mm`,
            padding: `${margin}mm`,
            margin: '0',
            backgroundColor: 'white',
            position: 'relative',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: '0',
              width: `${pageWidth - 2 * margin}mm`,
              height: `${pageHeight - 2 * margin}mm`,
              position: 'relative',
              margin: '0',
              padding: '0'
            }}
          >
            {pageArtworks.map((artwork, index) => (
              <div
                key={artwork.id}
                className="cut-line"
                style={{
                  width: '100%',
                  height: '100%',
                  border: '1px dashed #333',
                  padding: '5mm',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  position: 'relative',
                  boxSizing: 'border-box'
                }}
              >
                {/* Cut marks at corners */}
                <div style={{ position: 'absolute', top: '-5mm', left: '-5mm', width: '5mm', height: '0.5mm', backgroundColor: '#000' }}></div>
                <div style={{ position: 'absolute', top: '-5mm', left: '-5mm', width: '0.5mm', height: '5mm', backgroundColor: '#000' }}></div>
                <div style={{ position: 'absolute', top: '-5mm', right: '-5mm', width: '5mm', height: '0.5mm', backgroundColor: '#000' }}></div>
                <div style={{ position: 'absolute', top: '-5mm', right: '-5mm', width: '0.5mm', height: '5mm', backgroundColor: '#000' }}></div>
                <div style={{ position: 'absolute', bottom: '-5mm', left: '-5mm', width: '5mm', height: '0.5mm', backgroundColor: '#000' }}></div>
                <div style={{ position: 'absolute', bottom: '-5mm', left: '-5mm', width: '0.5mm', height: '5mm', backgroundColor: '#000' }}></div>
                <div style={{ position: 'absolute', bottom: '-5mm', right: '-5mm', width: '5mm', height: '0.5mm', backgroundColor: '#000' }}></div>
                <div style={{ position: 'absolute', bottom: '-5mm', right: '-5mm', width: '0.5mm', height: '5mm', backgroundColor: '#000' }}></div>
                
                {/* QR Code */}
                {qrCodeDataUrls[artwork.id] && (
                  <div style={{
                    width: `${Math.min(dimensions.width - 15, 60)}mm`,
                    height: `${Math.min(dimensions.width - 15, 60)}mm`,
                    marginBottom: showInfo ? '3mm' : '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    padding: '1mm',
                    border: '1px solid #516951'
                  }}>
                    <img
                      src={qrCodeDataUrls[artwork.id]}
                      alt="QR Code"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        imageRendering: 'crisp-edges',
                        display: 'block'
                      }}
                    />
                  </div>
                )}
                
                {/* Artwork Info */}
                {showInfo && (
                  <div style={{ textAlign: 'center', marginTop: '2mm' }}>
                    <div style={{ 
                      fontSize: '10pt', 
                      fontWeight: 'bold', 
                      marginBottom: '1mm', 
                      lineHeight: '1.2',
                      fontFamily: 'Francie Serif, Georgia, serif',
                      color: '#1f2937'
                    }}>
                      {artwork.name}
                    </div>
                    <div style={{ 
                      fontSize: '8pt', 
                      color: '#516951', 
                      lineHeight: '1.2',
                      fontStyle: 'italic',
                      fontFamily: 'Crimson Text, Georgia, serif'
                    }}>
                      {artwork.artist}
                    </div>
                    <div style={{ 
                      fontSize: '9pt', 
                      marginTop: '1mm', 
                      lineHeight: '1.2',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {artwork.price.startsWith('£') || artwork.price === 'POA' ? artwork.price : `£${artwork.price}`}
                    </div>
                    <div style={{ 
                      fontSize: '7pt', 
                      color: '#6b7280', 
                      marginTop: '2mm',
                      fontFamily: 'Crimson Text, Georgia, serif'
                    }}>
                      {artwork.slug || artwork.id}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Page info */}
          <div style={{
            position: 'absolute',
            bottom: '5mm',
            right: '10mm',
            fontSize: '8pt',
            color: '#999'
          }}>
            Page {pageIndex + 1} of {pages.length}
          </div>
          </div>
          
          {/* Back side - Images (immediately after front for double-sided printing) */}
          {includeBackImage && (
        <div 
          className="page-break"
          style={{
            width: `${pageWidth}mm`,
            height: `${pageHeight}mm`,
            padding: `${margin}mm`,
            margin: '0',
            backgroundColor: 'white',
            position: 'relative',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: '0',
              width: `${pageWidth - 2 * margin}mm`,
              height: `${pageHeight - 2 * margin}mm`,
              position: 'relative',
              margin: '0',
              padding: '0'
            }}
          >
            {pageArtworks.map((artwork) => (
              <div
                key={`back-${artwork.id}`}
                className="cut-line"
                style={{
                  width: '100%',
                  height: '100%',
                  border: '1px dashed #333',
                  padding: '5mm',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  position: 'relative',
                  boxSizing: 'border-box'
                }}
              >
                {/* Cut marks at corners */}
                <div style={{ position: 'absolute', top: '-5mm', left: '-5mm', width: '5mm', height: '0.5mm', backgroundColor: '#000' }}></div>
                <div style={{ position: 'absolute', top: '-5mm', left: '-5mm', width: '0.5mm', height: '5mm', backgroundColor: '#000' }}></div>
                <div style={{ position: 'absolute', top: '-5mm', right: '-5mm', width: '5mm', height: '0.5mm', backgroundColor: '#000' }}></div>
                <div style={{ position: 'absolute', top: '-5mm', right: '-5mm', width: '0.5mm', height: '5mm', backgroundColor: '#000' }}></div>
                <div style={{ position: 'absolute', bottom: '-5mm', left: '-5mm', width: '5mm', height: '0.5mm', backgroundColor: '#000' }}></div>
                <div style={{ position: 'absolute', bottom: '-5mm', left: '-5mm', width: '0.5mm', height: '5mm', backgroundColor: '#000' }}></div>
                <div style={{ position: 'absolute', bottom: '-5mm', right: '-5mm', width: '5mm', height: '0.5mm', backgroundColor: '#000' }}></div>
                <div style={{ position: 'absolute', bottom: '-5mm', right: '-5mm', width: '0.5mm', height: '5mm', backgroundColor: '#000' }}></div>
                
                {/* Artwork Image */}
                {(artwork.localImagePath || artwork.originalImageUrl || imageDataUrls[artwork.id]) && (
                  <img
                    src={imageDataUrls[artwork.id] || artwork.localImagePath || artwork.originalImageUrl}
                    alt={artwork.name}
                    style={{
                      maxWidth: '80%',
                      maxHeight: '80%',
                      objectFit: 'contain'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Page info */}
          <div style={{
            position: 'absolute',
            bottom: '5mm',
            right: '10mm',
            fontSize: '8pt',
            color: '#999'
          }}>
            Back - Page {pageIndex + 1} of {pages.length}
          </div>
        </div>
          )}
        </React.Fragment>
      ))}
    </>
  )
}