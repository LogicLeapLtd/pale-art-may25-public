'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Artwork {
  id: string
  name: string
  artist: string | null
  price: string
  slug: string | null
  medium: string | null
  qrCodeUrl?: string
  [key: string]: any
}

interface QRCodeLabelProps {
  artwork: Artwork
  onClose: () => void
  theme?: 'default' | 'minimal' | 'dark'
}

export default function QRCodeLabel({ artwork, onClose, theme = 'default' }: QRCodeLabelProps) {
  const [qrUrl, setQrUrl] = useState<string>('')
  const [selectedTheme, setSelectedTheme] = useState<'default' | 'minimal' | 'dark'>(theme)
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium')
  
  useEffect(() => {
    // Generate QR code URL
    const baseUrl = `${window.location.origin}/qr/${artwork.slug || artwork.id}`
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(baseUrl)}`
    setQrUrl(qrCodeUrl)
  }, [artwork])

  const handlePrint = () => {
    // Ensure QR code is loaded before printing
    if (!qrUrl) {
      alert('Please wait for QR code to load before printing')
      return
    }
    
    // Create the printable HTML content with responsive sizing
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Label - ${artwork.name}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              width: 100%;
              height: 100%;
              font-family: 'Crimson Text', 'Georgia', serif;
              background: white;
            }
            
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 1cm;
            }
            
            .print-container {
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            
            .qr-label {
              /* Base dimensions that will scale */
              width: ${selectedSize === 'small' ? '70mm' : selectedSize === 'large' ? '150mm' : '100mm'};
              height: ${selectedSize === 'small' ? '100mm' : selectedSize === 'large' ? '200mm' : '150mm'};
              max-width: calc(100vw - 2cm);
              max-height: calc(100vh - 2cm);
              
              /* Maintain aspect ratio */
              aspect-ratio: ${selectedSize === 'small' ? '7/10' : selectedSize === 'large' ? '15/20' : '10/15'};
              
              padding: ${selectedSize === 'small' ? '8mm' : selectedSize === 'large' ? '15mm' : '12mm'};
              border: 1mm solid ${selectedTheme === 'dark' ? '#374151' : '#cccccc'};
              border-radius: 4mm;
              background: ${selectedTheme === 'dark' ? '#1f2937' : 'white'};
              color: ${selectedTheme === 'dark' ? 'white' : 'black'};
              
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: center;
              
              /* Ensure it scales properly */
              position: relative;
            }
            
            .header {
              flex-shrink: 0;
            }
            
            .header h1 {
              font-size: ${selectedSize === 'small' ? '4.5mm' : selectedSize === 'large' ? '7mm' : '5.5mm'};
              font-weight: normal;
              margin-bottom: 1mm;
              letter-spacing: 0.5mm;
              line-height: 1.2;
            }
            
            .header p {
              font-size: ${selectedSize === 'small' ? '2.5mm' : selectedSize === 'large' ? '3.5mm' : '3mm'};
              color: ${selectedTheme === 'dark' ? '#fbbf24' : '#b45309'};
              font-style: italic;
              text-transform: uppercase;
              letter-spacing: 1mm;
              line-height: 1.2;
            }
            
            .qr-code {
              flex: 1;
              display: flex;
              justify-content: center;
              align-items: center;
              margin: ${selectedSize === 'small' ? '3mm' : selectedSize === 'large' ? '6mm' : '4mm'} 0;
            }
            
            .qr-code img {
              width: ${selectedSize === 'small' ? '30mm' : selectedSize === 'large' ? '50mm' : '40mm'};
              height: ${selectedSize === 'small' ? '30mm' : selectedSize === 'large' ? '50mm' : '40mm'};
              border: 0.5mm solid #ddd;
              max-width: 60%;
              max-height: 60%;
            }
            
            .artwork-info {
              flex-shrink: 0;
              border-top: 0.5mm solid ${selectedTheme === 'dark' ? '#374151' : '#e5e5e5'};
              padding-top: ${selectedSize === 'small' ? '2mm' : selectedSize === 'large' ? '4mm' : '3mm'};
            }
            
            .artwork-info h2 {
              font-size: ${selectedSize === 'small' ? '3.5mm' : selectedSize === 'large' ? '5mm' : '4mm'};
              margin-bottom: 1mm;
              font-weight: 500;
              line-height: 1.2;
              word-wrap: break-word;
            }
            
            .artwork-info .artist {
              font-size: ${selectedSize === 'small' ? '2.5mm' : selectedSize === 'large' ? '3.5mm' : '3mm'};
              color: ${selectedTheme === 'dark' ? '#fbbf24' : '#b45309'};
              font-style: italic;
              margin-bottom: 1mm;
              line-height: 1.2;
            }
            
            .artwork-info .slug {
              font-size: ${selectedSize === 'small' ? '2mm' : selectedSize === 'large' ? '3mm' : '2.5mm'};
              color: ${selectedTheme === 'dark' ? '#d1d5db' : '#6b7280'};
              margin-bottom: 1mm;
              line-height: 1.2;
            }
            
            .artwork-info .price {
              font-size: ${selectedSize === 'small' ? '3mm' : selectedSize === 'large' ? '4mm' : '3.5mm'};
              font-weight: 600;
              margin-bottom: 2mm;
              line-height: 1.2;
            }
            
            .footer {
              flex-shrink: 0;
              border-top: 0.5mm solid ${selectedTheme === 'dark' ? '#374151' : '#e5e5e5'};
              padding-top: 2mm;
              font-size: ${selectedSize === 'small' ? '2mm' : selectedSize === 'large' ? '3mm' : '2.5mm'};
              color: ${selectedTheme === 'dark' ? '#d1d5db' : '#6b7280'};
              line-height: 1.2;
            }
            
            /* Print-specific styling */
            @media print {
              html, body {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
                background: white !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              
              .print-container {
                width: 100vw;
                height: 100vh;
                padding: 5mm;
              }
              
              .qr-label {
                /* Scale to fit available space while maintaining aspect ratio */
                max-width: calc(100vw - 10mm);
                max-height: calc(100vh - 10mm);
                
                /* Remove border radius for print */
                border-radius: 0;
                
                /* Ensure borders print */
                border: 1pt solid ${selectedTheme === 'dark' ? '#374151' : '#666666'} !important;
                
                /* Force background colors to print */
                background: ${selectedTheme === 'dark' ? '#1f2937' : 'white'} !important;
                color: ${selectedTheme === 'dark' ? 'white' : 'black'} !important;
              }
              
              .qr-code img {
                /* Ensure QR code prints clearly */
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
              }
            }
            
            /* Auto-scale for very small or large screens */
            @media screen and (max-width: 400px) {
              .qr-label {
                transform: scale(0.8);
              }
            }
            
            @media screen and (min-width: 1200px) {
              .qr-label {
                transform: scale(1.2);
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="qr-label">
              <div class="header">
                <h1>Palé Hall</h1>
                <p>Art Collection</p>
              </div>
              
              <div class="qr-code">
                <img src="${qrUrl}" alt="QR Code" />
              </div>
              
              <div class="artwork-info">
                <h2>${artwork.name}</h2>
                ${artwork.artist && artwork.artist.toLowerCase() !== 'artist unknown' && artwork.artist.trim() !== '' 
                  ? `<div class="artist">by ${artwork.artist}</div>` 
                  : ''
                }
                <div class="slug">${artwork.slug || artwork.id}</div>
                ${artwork.price 
                  ? `<div class="price">${artwork.price.includes('on request') || artwork.price.includes('POA')
                      ? artwork.price
                      : artwork.price.startsWith('£') ? artwork.price : `£${artwork.price}`
                    }</div>` 
                  : ''
                }
              </div>
              
              <div class="footer">
                Scan for artwork details & purchase enquiries
              </div>
            </div>
          </div>
        </body>
      </html>
    `
    
    // Open new window with print content
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=no,resizable=yes')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus()
          printWindow.print()
          printWindow.close()
        }, 1000) // Increased delay to ensure proper rendering
      }
    } else {
      alert('Please allow popups to print the label')
    }
  }

  const getLabelClasses = () => {
    let baseClasses = 'qr-label rounded-lg shadow-luxe';
    
    // Size classes
    if (selectedSize === 'small') {
      baseClasses += ' p-4 max-w-xs';
    } else if (selectedSize === 'large') {
      baseClasses += ' p-8 max-w-lg';
    } else { // medium
      baseClasses += ' p-6 max-w-sm';
    }
    
    baseClasses += ' mx-auto';
    
    // Theme classes
    if (selectedTheme === 'dark') {
      baseClasses += ' bg-forest-900 border-2 border-forest-700';
    } else if (selectedTheme === 'minimal') {
      baseClasses += ' bg-white border border-gray-300';
    } else { // default
      baseClasses += ' bg-white border-2 border-forest-200';
    }
    
    return baseClasses;
  };

  const getTextColor = (baseColor: string, darkThemeColor: string) => {
    return selectedTheme === 'dark' ? darkThemeColor : baseColor;
  };

  const getBorderColor = (baseColor: string, darkThemeColor: string) => {
    return selectedTheme === 'dark' ? darkThemeColor : baseColor;
  };
  
  const getQRSize = () => {
    if (selectedSize === 'small') return 'w-32 h-32';
    if (selectedSize === 'large') return 'w-56 h-56';
    return 'w-48 h-48'; // medium
  };

  const handleDownloadLabel = async () => {
    if (!qrUrl) {
      alert('Please wait for QR code to load before downloading')
      return
    }

    try {
      // Create a canvas to generate the label image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Set canvas dimensions based on selected size (in pixels, assuming 96 DPI)
      const dimensions = {
        small: { width: 264, height: 378 }, // 7x10cm at 96 DPI
        medium: { width: 378, height: 567 }, // 10x15cm at 96 DPI  
        large: { width: 567, height: 756 } // 15x20cm at 96 DPI
      }
      
      const { width, height } = dimensions[selectedSize]
      canvas.width = width
      canvas.height = height
      
      if (!ctx) return
      
      // Background
      ctx.fillStyle = selectedTheme === 'dark' ? '#1f2937' : 'white'
      ctx.fillRect(0, 0, width, height)
      
      // Border
      ctx.strokeStyle = selectedTheme === 'dark' ? '#374151' : '#e5e5e5'
      ctx.lineWidth = 2
      ctx.strokeRect(1, 1, width - 2, height - 2)
      
      // Text color
      ctx.fillStyle = selectedTheme === 'dark' ? 'white' : 'black'
      ctx.textAlign = 'center'
      
      // Header - Palé Hall
      const headerFontSize = selectedSize === 'small' ? 20 : selectedSize === 'large' ? 32 : 26
      ctx.font = `${headerFontSize}px 'Francie Serif', Georgia, serif`
      ctx.fillText('Palé Hall', width / 2, 40 + (selectedSize === 'large' ? 10 : 0))
      
      // Subtitle - Art Collection
      const subtitleFontSize = selectedSize === 'small' ? 11 : selectedSize === 'large' ? 16 : 13
      ctx.font = `italic ${subtitleFontSize}px 'Crimson Text', Georgia, serif`
      ctx.fillStyle = selectedTheme === 'dark' ? '#fbbf24' : '#b45309'
      ctx.fillText('ART COLLECTION', width / 2, 65 + (selectedSize === 'large' ? 15 : 0))
      
      // Load and draw QR code
      const qrImage = new window.Image()
      qrImage.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve
        qrImage.onerror = reject
        qrImage.src = qrUrl
      })
      
      // QR code positioning
      const qrSize = selectedSize === 'small' ? 120 : selectedSize === 'large' ? 200 : 160
      const qrX = (width - qrSize) / 2
      const qrY = 90 + (selectedSize === 'large' ? 20 : 0)
      
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)
      
      // Artwork info section
      const infoStartY = qrY + qrSize + 30
      
      // Artwork name
      ctx.fillStyle = selectedTheme === 'dark' ? 'white' : 'black'
      const nameFontSize = selectedSize === 'small' ? 16 : selectedSize === 'large' ? 22 : 18
      ctx.font = `${nameFontSize}px 'Francie Serif', Georgia, serif`
      ctx.fillText(artwork.name, width / 2, infoStartY)
      
      let currentY = infoStartY + 25
      
      // Artist (if available)
      if (artwork.artist && artwork.artist.toLowerCase() !== 'artist unknown' && artwork.artist.trim() !== '') {
        const artistFontSize = selectedSize === 'small' ? 12 : selectedSize === 'large' ? 16 : 14
        ctx.font = `italic ${artistFontSize}px 'Crimson Text', Georgia, serif`
        ctx.fillStyle = selectedTheme === 'dark' ? '#fbbf24' : '#b45309'
        ctx.fillText(`by ${artwork.artist}`, width / 2, currentY)
        currentY += 20
      }
      
      // Slug
      const slugFontSize = selectedSize === 'small' ? 10 : selectedSize === 'large' ? 14 : 12
      ctx.font = `${slugFontSize}px 'Crimson Text', Georgia, serif`
      ctx.fillStyle = selectedTheme === 'dark' ? '#d1d5db' : '#6b7280'
      ctx.fillText(artwork.slug || artwork.id, width / 2, currentY)
      currentY += 25
      
      // Price (if available)
      if (artwork.price) {
        const priceFontSize = selectedSize === 'small' ? 14 : selectedSize === 'large' ? 18 : 16
        ctx.font = `bold ${priceFontSize}px 'Francie Serif', Georgia, serif`
        ctx.fillStyle = selectedTheme === 'dark' ? 'white' : 'black'
        const priceText = artwork.price.includes('on request') || artwork.price.includes('POA')
          ? artwork.price
          : artwork.price.startsWith('£') ? artwork.price : `£${artwork.price}`
        ctx.fillText(priceText, width / 2, currentY)
        currentY += 30
      }
      
      // Footer
      const footerFontSize = selectedSize === 'small' ? 9 : selectedSize === 'large' ? 13 : 11
      ctx.font = `${footerFontSize}px 'Crimson Text', Georgia, serif`
      ctx.fillStyle = selectedTheme === 'dark' ? '#d1d5db' : '#6b7280'
      ctx.fillText('Scan for artwork details & purchase enquiries', width / 2, height - 20)
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `pale-hall-label-${artwork.slug || artwork.id}-${selectedTheme}-${selectedSize}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }, 'image/png')
      
    } catch (error) {
      console.error('Error generating label:', error)
      alert('Error generating label. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-forest-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-luxe max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
          <h2 className={getTextColor('text-forest-900', 'text-cream-50') + ' text-xl font-elegant font-semibold'}>QR Code Label</h2>
          <button
            onClick={onClose}
            className={getTextColor('text-forest-500', 'text-cream-400') + ' hover:' + getTextColor('text-forest-700', 'text-cream-200') + ' transition-colors no-print'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Controls - hide on print */}
          <div className="mb-6 space-y-4 no-print">
            {/* Theme Selection */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-forest-700">Theme:</label>
              <div className="flex gap-2">
                {(['default', 'minimal', 'dark'] as const).map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => setSelectedTheme(themeOption)}
                    className={`px-3 py-1 text-sm rounded ${
                      selectedTheme === themeOption
                        ? 'bg-forest-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Size Selection */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-forest-700">Size:</label>
              <div className="flex gap-2">
                {(['small', 'medium', 'large'] as const).map((sizeOption) => (
                  <button
                    key={sizeOption}
                    onClick={() => setSelectedSize(sizeOption)}
                    className={`px-3 py-1 text-sm rounded ${
                      selectedSize === sizeOption
                        ? 'bg-forest-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {sizeOption.charAt(0).toUpperCase() + sizeOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handlePrint}
                disabled={!qrUrl}
                className="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {qrUrl ? 'Print Label' : 'Loading...'}
              </button>
              <button
                onClick={handleDownloadLabel}
                disabled={!qrUrl}
                className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {qrUrl ? 'Download Label' : 'Loading...'}
              </button>
            </div>
          </div>

          {/* Printable Label */}
          <div className="qr-label-container">
            <div className={getLabelClasses().replace(' shadow-luxe', '').replace(' bg-white', '')}>
              {/* Palé Hall Header */}
              <div className="text-center mb-4">
                <h3 className={`font-display text-2xl tracking-tight leading-none ${getTextColor('text-forest-900', 'text-cream-50')}`}>
                  Palé Hall
                </h3>
                <p className={`font-accent text-sm italic tracking-widest uppercase ${getTextColor('text-gold-700', 'text-gold-300')}`}>
                  Art Collection
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                {qrUrl && (
                  <Image 
                    src={qrUrl} 
                    alt="QR Code"
                    width={selectedSize === 'large' ? 120 : selectedSize === 'medium' ? 96 : 80}
                    height={selectedSize === 'large' ? 120 : selectedSize === 'medium' ? 96 : 80}
                    className={getQRSize()}
                    unoptimized
                  />
                )}
              </div>

              {/* Artwork Info */}
              <div className={`text-center space-y-2 border-t ${getBorderColor('border-cream-200', 'border-forest-700')} pt-4`}>
                <h4 className={`font-display text-lg ${getTextColor('text-forest-900', 'text-cream-50')}`}>
                  {artwork.name}
                </h4>
                {artwork.artist && artwork.artist.toLowerCase() !== 'artist unknown' && artwork.artist.trim() !== '' && (
                  <p className={`font-body text-sm italic ${getTextColor('text-gold-600', 'text-gold-300')}`}>
                    by {artwork.artist}
                  </p>
                )}
                <p className={`text-sm ${getTextColor('text-forest-600', 'text-cream-200')}`}>
                  {artwork.slug || artwork.id}
                </p>
                {artwork.price && (
                  <p className={`font-medium mt-2 ${getTextColor('text-forest-800', 'text-gold-100')}`}>
                    {artwork.price.includes('on request') || artwork.price.includes('POA')
                      ? artwork.price
                      : artwork.price.startsWith('£') ? artwork.price : `£${artwork.price}`
                    }
                  </p>
                )}
              </div>

              {/* Footer Text */}
              <div className={`mt-4 pt-4 border-t ${getBorderColor('border-cream-200', 'border-forest-700')}`}>
                <p className={`text-xs text-center ${getTextColor('text-forest-600', 'text-cream-200')}`}>
                  Scan for artwork details & purchase enquiries
                </p>
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className="mt-8 no-print">
            <h4 className="text-lg font-semibold text-forest-800 mb-2">Current Settings</h4>
            <div className="text-sm text-forest-600 space-y-1">
              <p><strong>Theme:</strong> {selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}</p>
              <p><strong>Size:</strong> {selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1)}</p>
              <p><strong>Print Dimensions:</strong> 
                {selectedSize === 'small' ? ' 7x10cm' : 
                 selectedSize === 'large' ? ' 15x20cm' : ' 10x15cm'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .qr-label-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            page-break-after: always;
          }
          
          .qr-label {
            width: 10cm;
            height: 15cm;
            padding: 1.5cm;
            margin: 0;
            box-shadow: none !important;
          }
          
          /* For small labels */
          @page small {
            size: 7cm 10cm;
            margin: 0;
          }
          
          .qr-label-small {
            width: 7cm;
            height: 10cm;
            padding: 1cm;
          }
        }
      `}</style>
    </div>
  )
}