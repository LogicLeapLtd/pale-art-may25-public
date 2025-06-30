'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import QRCode from 'qrcode'

interface Artwork {
  id: string
  name: string
  artist: string
  price: string
  localImagePath?: string
  originalImageUrl?: string
  slug: string
}

type PrintFormat = 'a6-pro' | 'a5-cut'

export default function QRPrintProPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [selectedArtworks, setSelectedArtworks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [printFormat, setPrintFormat] = useState<PrintFormat>('a6-pro')
  const [includeCropMarks, setIncludeCropMarks] = useState(false)

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
    if (selectedArtworks.size === artworks.length) {
      setSelectedArtworks(new Set())
    } else {
      setSelectedArtworks(new Set(artworks.map(a => a.id)))
    }
  }

  const handlePrint = async () => {
    if (selectedArtworks.size === 0) {
      alert('Please select at least one artwork')
      return
    }

    // Get selected artworks
    const selectedArtworksList = artworks.filter(a => selectedArtworks.has(a.id))
    
    // Create print window
    const printWindow = window.open('', 'print-window', 'width=800,height=600')
    if (!printWindow) return

    if (printFormat === 'a6-pro') {
      // A6 Professional printing - no page breaks, let browser handle it
      let html = `<!DOCTYPE html>
<html>
<head>
  <title>Print Labels</title>
  <style>
    @page { 
      size: 105mm 148mm; 
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
    }
    .page {
      width: 105mm;
      height: 147mm;  /* Slightly smaller than A6 to prevent overflow */
      margin: 0;
      padding: 0;
      display: table;
      box-sizing: border-box;
    }
    @media print {
      .page { 
        page-break-before: always; 
      }
      .page:first-child { 
        page-break-before: auto; 
      }
    }
    .center-cell {
      display: table-cell;
      text-align: center;
      vertical-align: middle;
      width: 105mm;
      height: 147mm;  /* Match the page height */
    }
    .qr-frame {
      display: inline-block;
      padding: 6mm;
      border: 0.5mm solid #B8860B;
      background: white;
      position: relative;
    }
    .qr-frame::before {
      content: '';
      position: absolute;
      top: -1.5mm;
      left: -1.5mm;
      right: -1.5mm;
      bottom: -1.5mm;
      border: 0.3mm solid #D4AF37;
    }
    .qr-frame::after {
      content: '⚜';
      position: absolute;
      top: -3mm;
      left: 50%;
      transform: translateX(-50%);
      font-size: 4mm;
      color: #B8860B;
      background: white;
      padding: 0 2mm;
    }
    .qr-code {
      width: 60mm;
      height: 60mm;
      display: block;
    }
    .artwork-image {
      max-width: 60mm;
      max-height: 80mm;
    }
  </style>
</head>
<body>`

      // Generate pages - ensure every QR has an image (use placeholder if needed)
      for (let i = 0; i < selectedArtworksList.length; i++) {
        const artwork = selectedArtworksList[i]
        const url = `https://palehallfineartandantiques.co.uk/qr/${artwork.slug || artwork.id}`
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 1
        })
        
        // QR page
        html += `<div class="page"><div class="center-cell"><div class="qr-frame"><img src="${qrDataUrl}" class="qr-code" /></div></div></div>`
        
        // Image page - always add one for consistency
        const imageUrl = artwork.localImagePath || artwork.originalImageUrl
        if (imageUrl) {
          html += `<div class="page"><div class="center-cell"><img src="${imageUrl}" alt="${artwork.name}" class="artwork-image" /></div></div>`
        } else {
          // Add placeholder page with artwork details
          html += `<div class="page"><div class="center-cell"><div style="text-align: center;"><h2 style="font-size: 20pt; margin-bottom: 10mm;">${artwork.name}</h2><p style="font-size: 14pt; color: #666;">${artwork.artist}</p><p style="font-size: 12pt; color: #888; margin-top: 5mm;">No image available</p></div></div></div>`
        }
      }

      html += `</body></html>`

      // Write to window and print
      printWindow.document.write(html)
      printWindow.document.close()
      
      // Wait for images to load then print
      setTimeout(() => {
        printWindow.print()
        setTimeout(() => {
          printWindow.close()
        }, 1000)
      }, 2000)

    } else {
      // A5 Cut Sheet - 4 labels per page
      let html = `<!DOCTYPE html>
<html>
<head>
  <title>Print Cut Sheet</title>
  <style>
    @page { 
      size: A5 landscape; 
      margin: 10mm;
    }
    body { 
      margin: 0; 
      padding: 0;
      font-family: Arial, sans-serif;
    }
    .sheet {
      width: 190mm;
      height: 128mm;
      page-break-after: always;
      page-break-inside: avoid;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 0;
    }
    .label {
      width: 95mm;
      height: 64mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      border: 0.5mm dashed #ccc;
    }
    .qr-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5mm;
    }
    .qr-code {
      width: 40mm;
      height: 40mm;
    }
    .label-text {
      text-align: center;
      font-size: 10pt;
    }
    .label-text h3 {
      margin: 0 0 2mm 0;
      font-size: 12pt;
      font-weight: bold;
    }
    .label-text p {
      margin: 0;
      line-height: 1.3;
    }
  </style>
</head>
<body>`

      // Create sheets with 4 labels each
      for (let i = 0; i < selectedArtworksList.length; i += 4) {
        html += '<div class="sheet">'
        
        // Add up to 4 labels per sheet
        for (let j = 0; j < 4; j++) {
          const artwork = selectedArtworksList[i + j]
          if (artwork) {
            const url = `https://palehallfineartandantiques.co.uk/qr/${artwork.slug || artwork.id}`
            const qrDataUrl = await QRCode.toDataURL(url, {
              width: 200,
              margin: 1
            })
            
            html += `
<div class="label">
  <div class="qr-container">
    <img src="${qrDataUrl}" class="qr-code" />
    <div class="label-text">
      <h3>${artwork.name}</h3>
      <p>${artwork.artist}</p>
      <p>${artwork.price}</p>
    </div>
  </div>
</div>`
          } else {
            // Empty label for incomplete sheets
            html += '<div class="label"></div>'
          }
        }
        
        html += '</div>'
      }

      html += `
</body>
</html>`

      // Write to window and print
      printWindow.document.write(html)
      printWindow.document.close()
      
      // Wait a bit for images to load then print
      setTimeout(() => {
        printWindow.print()
        setTimeout(() => {
          printWindow.close()
        }, 1000)
      }, 500)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">QR Code Printing</h1>
          <Link href="/admin" className="text-blue-600 hover:underline">
            Back to Admin
          </Link>
        </div>

        {/* Print Format Selection */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Select Print Format</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPrintFormat('a6-pro')}
              className={`p-4 border-2 rounded-lg transition-all ${
                printFormat === 'a6-pro' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <h3 className="font-semibold mb-1">A6 Professional Printing</h3>
              <p className="text-sm text-gray-600">Individual A6 pages for each QR code and artwork image</p>
            </button>
            <button
              onClick={() => setPrintFormat('a5-cut')}
              className={`p-4 border-2 rounded-lg transition-all ${
                printFormat === 'a5-cut' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <h3 className="font-semibold mb-1">A5 Cut Sheet</h3>
              <p className="text-sm text-gray-600">4 QR labels per A5 page with cut lines</p>
            </button>
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectedArtworks.size === artworks.length ? 'Deselect All' : 'Select All'}
            </button>
            <p>{selectedArtworks.size} selected</p>
            {printFormat === 'a6-pro' && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeCropMarks}
                  onChange={(e) => setIncludeCropMarks(e.target.checked)}
                  className="rounded"
                />
                Include crop marks
              </label>
            )}
          </div>
          <button
            onClick={handlePrint}
            disabled={selectedArtworks.size === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            Print {printFormat === 'a6-pro' ? 'A6 Labels' : 'A5 Cut Sheet'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              onClick={() => toggleSelection(artwork.id)}
              className={`border-2 rounded p-2 cursor-pointer ${
                selectedArtworks.has(artwork.id) 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300'
              }`}
            >
              <div className="aspect-square bg-gray-100 mb-2 relative">
                {artwork.localImagePath && (
                  <Image
                    src={artwork.localImagePath}
                    alt={artwork.name}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
              <p className="text-sm font-medium truncate">{artwork.name}</p>
              <p className="text-xs text-gray-600 truncate">{artwork.artist}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}