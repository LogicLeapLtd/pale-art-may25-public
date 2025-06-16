'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode';

interface Artist {
  id: string;
  name: string;
  title: string;
  biography: string;
  imageUrl?: string;
}

interface Artwork {
  id: string;
  name: string;
  artist: string;
  medium: string;
  dimensions: string;
  year: string;
  price: string;
  description: string;
  localImagePath?: string;
  originalImageUrl?: string;
  slug: string;
}

export default function LeafletGenerator() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<'1' | '2'>('1');
  
  const printRef = useRef<HTMLDivElement>(null);

  // Load artists
  useEffect(() => {
    fetch('/api/artists')
      .then(res => res.json())
      .then(data => setArtists(data))
      .catch(err => console.error('Failed to load artists:', err));
  }, []);

  // Load artworks when artist is selected
  useEffect(() => {
    if (selectedArtist) {
      setLoading(true);
      fetch(`/api/artworks/by-artist/${encodeURIComponent(selectedArtist)}`)
        .then(res => res.json())
        .then(data => {
          setArtworks(data);
          // Auto-select all artworks
          setSelectedArtworks(data.map((a: Artwork) => a.id));
        })
        .catch(err => console.error('Failed to load artworks:', err))
        .finally(() => setLoading(false));
    } else {
      setArtworks([]);
      setSelectedArtworks([]);
    }
  }, [selectedArtist]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${selectedArtist} Exhibition Leaflet`,
    onBeforePrint: async () => {
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        html, body {
          height: 100%;
          width: 100%;
          margin: 0 !important;
          padding: 0 !important;
        }
        .no-print {
          display: none !important;
        }
      }
    `
  });

  const generateLeaflet = () => {
    if (!selectedArtist || selectedArtworks.length === 0) return;
    
    setGenerating(true);
    handlePrint();
    setTimeout(() => {
      setGenerating(false);
    }, 500);
  };

  const selectedArtworkDetails = artworks
    .filter(a => selectedArtworks.includes(a.id))
    .sort((a, b) => {
      // Extract dimensions and check if square
      const isSquare = (dimensions: string) => {
        if (!dimensions) return false;
        const match = dimensions.match(/(\d+)\s*x\s*(\d+)/i);
        if (match) {
          const [_, width, height] = match;
          return width === height;
        }
        return false;
      };
      
      const aIsSquare = isSquare(a.dimensions);
      const bIsSquare = isSquare(b.dimensions);
      
      // Square artworks come first
      if (aIsSquare && !bIsSquare) return -1;
      if (!aIsSquare && bIsSquare) return 1;
      return 0;
    });
  const artist = artists.find(a => a.name === selectedArtist);

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Control Panel */}
      <div className="no-print p-8 bg-white border-b border-cream-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-display text-forest-900 mb-8">Exhibition Leaflet Generator</h1>
          
          <div className="space-y-6">
            {/* Artist Selection */}
            <div>
              <label className="block text-sm font-elegant text-forest-700 mb-2">
                Select Artist
              </label>
              <select
                value={selectedArtist}
                onChange={(e) => setSelectedArtist(e.target.value)}
                className="w-full px-4 py-2 border border-cream-300 rounded-md focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white text-forest-900"
              >
                <option value="">Choose an artist...</option>
                {artists.map(artist => (
                  <option key={artist.id} value={artist.name}>
                    {artist.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Variant Selection */}
            <div>
              <label className="block text-sm font-elegant text-forest-700 mb-2">
                Select Layout Variant
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="variant"
                    value="1"
                    checked={selectedVariant === '1'}
                    onChange={(e) => setSelectedVariant(e.target.value as '1' | '2')}
                    className="mr-2 h-4 w-4 text-gold-600 focus:ring-gold-500"
                  />
                  <span className="text-forest-900">Variant 1 (Image on side)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="variant"
                    value="2"
                    checked={selectedVariant === '2'}
                    onChange={(e) => setSelectedVariant(e.target.value as '1' | '2')}
                    className="mr-2 h-4 w-4 text-gold-600 focus:ring-gold-500"
                  />
                  <span className="text-forest-900">Variant 2 (Image on top)</span>
                </label>
              </div>
            </div>

            {/* Artwork Selection */}
            {loading ? (
              <div className="text-center py-4">
                <p className="text-forest-600">Loading artworks...</p>
              </div>
            ) : artworks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-elegant text-forest-700">
                    Select Artworks ({selectedArtworks.length} of {artworks.length} selected)
                  </label>
                  <button
                    onClick={() => {
                      if (selectedArtworks.length === artworks.length) {
                        setSelectedArtworks([]);
                      } else {
                        setSelectedArtworks(artworks.map(a => a.id));
                      }
                    }}
                    className="text-sm text-gold-600 hover:text-gold-700 font-elegant"
                  >
                    {selectedArtworks.length === artworks.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <div className="border border-cream-300 rounded-lg p-4 max-h-64 overflow-y-auto bg-cream-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {artworks.map(artwork => (
                      <label key={artwork.id} className="flex items-center p-2 hover:bg-white rounded cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedArtworks.includes(artwork.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedArtworks([...selectedArtworks, artwork.id]);
                            } else {
                              setSelectedArtworks(selectedArtworks.filter(id => id !== artwork.id));
                            }
                          }}
                          className="mr-3 h-4 w-4 text-gold-600 rounded focus:ring-gold-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-forest-900">{artwork.name}</p>
                          <p className="text-xs text-forest-600">{artwork.price}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={generateLeaflet}
                disabled={!selectedArtist || selectedArtworks.length === 0 || generating}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? 'Generating...' : 'Generate & Print Leaflet'}
              </button>
              <button
                onClick={() => setShowFullPreview(true)}
                disabled={!selectedArtist || selectedArtworks.length === 0}
                className="px-6 py-3 border border-forest-300 text-forest-700 rounded hover:bg-cream-100 font-elegant transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Full Screen Preview
              </button>
              <button
                onClick={() => {
                  setSelectedArtist('');
                  setSelectedArtworks([]);
                }}
                className="px-6 py-3 border border-cream-300 text-forest-600 rounded hover:bg-cream-100 font-elegant transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Content - Hidden on screen, visible when printing */}
      {selectedArtist && artist && selectedArtworkDetails.length > 0 && (
        <div 
          ref={printRef}
          id="print-content"
          className="print-content-wrapper"
          style={{ 
            position: 'fixed',
            left: '-9999px',
            top: 0,
            width: '210mm'
          }}
        >
          <PrintableLeaflet
            artist={artist}
            artworks={selectedArtworkDetails}
            variant={selectedVariant}
          />
        </div>
      )}

      {/* Mini Preview */}
      {selectedArtist && selectedArtworkDetails.length > 0 && !showFullPreview && (
        <div className="no-print p-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-elegant text-forest-900 mb-4">Preview</h2>
            <div className="overflow-auto">
              <div 
                className="bg-white shadow-xl mx-auto" 
                style={{ 
                  width: '420px', 
                  height: '594px',
                  transform: 'scale(0.6)',
                  transformOrigin: 'top left'
                }}
              >
                {artist && (
                  <PrintableLeaflet
                    artist={artist}
                    artworks={selectedArtworkDetails}
                    isPreview={true}
                    variant={selectedVariant}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Preview Modal */}
      {showFullPreview && selectedArtist && selectedArtworkDetails.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 no-print">
          <div className="h-full w-full flex items-center justify-center p-4">
            <div className="relative max-w-[90vh] max-h-[90vh]">
              <button
                onClick={() => setShowFullPreview(false)}
                className="absolute -top-12 right-0 text-white hover:text-cream-200 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div 
                className="bg-white shadow-2xl overflow-auto"
                style={{
                  width: '210mm',
                  height: '90vh',
                  maxHeight: '297mm'
                }}
              >
                {artist && (
                  <PrintableLeaflet
                    artist={artist}
                    artworks={selectedArtworkDetails}
                    isPreview={true}
                    variant={selectedVariant}
                  />
                )}
              </div>
            </div>
          </div>
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
            width: 210mm !important;
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
  );
}

// Separate component for the printable content
function PrintableLeaflet({ artist, artworks, isPreview = false, variant = '1' }: { artist: Artist; artworks: Artwork[]; isPreview?: boolean; variant?: '1' | '2' }) {
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  
  // Generate QR codes
  useEffect(() => {
    const generateQRCodes = async () => {
      const codes: { [key: string]: string } = {};
      
      for (const artwork of artworks) {
        try {
          const url = `${window.location.origin}/collection/${artwork.slug}`;
          const qrCode = await QRCode.toDataURL(url, {
            width: 80,
            margin: 1,
            color: {
              dark: '#516951',
              light: '#FFFFFF'
            }
          });
          codes[artwork.id] = qrCode;
        } catch (err) {
          console.error('QR generation failed:', err);
        }
      }
      
      setQrCodes(codes);
    };

    generateQRCodes();
  }, [artworks]);

  // Split artworks into pages based on variant
  // Variant 1: 3 rows x 2 columns = 6 per page (to accommodate QR codes)
  // Variant 2: 3 rows x 1 column = 3 per page  
  const artworksPerPage = variant === '2' ? 3 : 6;
  const pages = [];
  for (let i = 0; i < artworks.length; i += artworksPerPage) {
    pages.push(artworks.slice(i, i + artworksPerPage));
  }

  return (<div>
      {/* Cover Page */}
      <div className={`flex flex-col justify-between bg-cream-50 ${!isPreview ? 'page-break' : ''}`} style={{ width: '210mm', height: '297mm', padding: '40mm 25mm 25mm 25mm' }}>
        <div>
          <div className="text-center mb-16">
            <div className="w-32 h-px bg-gold-500 mx-auto mb-8"></div>
            <h1 className="text-5xl font-display text-forest-900 mb-4">
              {artist.name}
            </h1>
            <p className="text-2xl font-elegant text-forest-700">
              Exhibition at Palé Hall
            </p>
            <div className="w-32 h-px bg-gold-500 mx-auto mt-8"></div>
          </div>
          
          {artworks[0] && (
            <div className="h-[500px] mb-8 flex items-center justify-center">
              <img
                src={artworks[0].localImagePath || artworks[0].originalImageUrl || '/placeholder-artwork.svg'}
                alt={artworks[0].name}
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: '500px' }}
              />
            </div>
          )}
        </div>
        
        <div className="text-center">
          <p className="font-display text-lg text-forest-900 mb-2">Palé Hall Gallery</p>
          <p className="text-forest-600 font-body">Llandderfel, Bala, Gwynedd LL23 7PS</p>
          <p className="text-gold-600 font-elegant">palehall.co.uk</p>
        </div>
      </div>

      {/* Artist Biography Page */}
      <div className={`bg-white flex flex-col justify-center ${!isPreview ? 'page-break' : ''}`} style={{ width: '210mm', height: '297mm', marginTop: isPreview ? '2px' : '0', padding: '35mm 25mm 25mm 25mm' }}>
        <div>
          <h2 className="text-3xl font-display text-forest-900 mb-8 text-center">About the Artist</h2>
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-forest-800 leading-relaxed text-lg font-body text-center">
              {artist.biography}
            </p>
          </div>
          
          <div className="bg-cream-100 border border-cream-300 p-8 rounded max-w-2xl mx-auto">
            <h3 className="text-xl font-display text-forest-900 mb-4 text-center">Visit the Exhibition</h3>
            <p className="text-forest-700 mb-2 font-body text-center">
              <strong className="font-elegant">Private viewings available by appointment</strong>
            </p>
            <p className="text-forest-700 font-body text-center">
              Contact: <span className="text-gold-600">art@palehall.co.uk</span> | <span className="text-gold-600">01678 530 285</span>
            </p>
          </div>
        </div>
      </div>

      {/* Artwork Pages */}
      {pages.map((pageArtworks, pageIndex) => (
        <React.Fragment key={pageIndex}>
          <div className={`bg-white flex flex-col ${!isPreview ? 'page-break' : ''}`} style={{ width: '210mm', height: '297mm', marginTop: isPreview ? '2px' : '0', padding: variant === '2' ? '30mm 25mm' : '20mm 15mm' }}>
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-3xl font-display text-forest-900 mb-8 text-center">
                Featured Works
              </h2>
              
              <div className={variant === '2' ? 'flex flex-col gap-y-12 max-w-md mx-auto w-full' : 'grid grid-cols-2 gap-x-10 gap-y-6'}>
              {pageArtworks.map((artwork) => (
                <div key={artwork.id} className="no-break" style={{ minHeight: variant === '2' ? '200px' : '160px' }}>
                  {variant === '1' ? (
                    // Variant 1: Compact layout with integrated QR
                    <div className="bg-white p-3 border border-cream-300 rounded-lg shadow-sm">
                      <div className="flex gap-3 items-center">
                        <div className="flex-shrink-0">
                          <div className="bg-white p-1.5 border-2 border-gold-500 inline-block" style={{ width: '100px' }}>
                            <div className="border border-gold-400 bg-white">
                              <img
                                src={artwork.localImagePath || artwork.originalImageUrl || '/placeholder-artwork.svg'}
                                alt={artwork.name}
                                className="block w-full h-auto"
                                style={{ maxHeight: '120px', objectFit: 'contain' }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-display text-base font-bold text-forest-900 leading-tight mb-1">{artwork.name}</h3>
                            {artwork.dimensions && (
                              <p className="text-forest-600 text-xs mb-1 font-body">{artwork.dimensions}</p>
                            )}
                            <p className="text-sm font-body">
                              {artwork.year && (
                                <>
                                  <span className="text-forest-700 text-xs">{artwork.year}</span>
                                  <span className="mx-1">•</span>
                                </>
                              )}
                              <span className="text-gold-700 font-bold">{artwork.price.startsWith('£') || artwork.price === 'POA' ? artwork.price : `£${artwork.price}`}</span>
                            </p>
                          </div>
                          
                          {qrCodes[artwork.id] && (
                            <div className="flex items-center gap-2 mt-2">
                              <img 
                                src={qrCodes[artwork.id]} 
                                alt="QR Code"
                                className="w-12 h-12"
                              />
                              <p className="text-xs text-forest-600 font-body">
                                Scan for<br/>details
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Variant 2: Image on top (single column)
                    <div className="flex gap-6 items-center">
                      <div className="flex-shrink-0">
                        <div className="bg-white p-3 border-2 border-gold-500 shadow-lg" style={{ width: '200px' }}>
                          <div className="border border-gold-400 bg-white">
                            <img
                              src={artwork.localImagePath || artwork.originalImageUrl || '/placeholder-artwork.svg'}
                              alt={artwork.name}
                              className="block w-full h-auto"
                              style={{ maxHeight: '200px', objectFit: 'contain' }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-bold text-forest-900 mb-2">{artwork.name}</h3>
                        {artwork.dimensions && (
                          <p className="text-forest-600 text-base mb-2 font-body">{artwork.dimensions}</p>
                        )}
                        <p className="text-base font-body mb-3">
                          {artwork.year && (
                            <>
                              <span className="text-forest-700">{artwork.year}</span>
                              <span className="mx-2">•</span>
                            </>
                          )}
                          <span className="text-gold-700 font-bold text-lg">{artwork.price.startsWith('£') || artwork.price === 'POA' ? artwork.price : `£${artwork.price}`}</span>
                        </p>
                        
                        {qrCodes[artwork.id] && (
                          <div className="flex items-center gap-3">
                            <img 
                              src={qrCodes[artwork.id]} 
                              alt="QR Code"
                              className="w-20 h-20"
                            />
                            <p className="text-sm text-forest-600 font-body">
                              Scan for full details
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            </div>
          </div>
        </React.Fragment>
      ))}

      {/* Back Cover */}
      <div className="flex flex-col justify-center items-center bg-forest-900 text-cream-50" style={{ width: '210mm', height: '297mm', marginTop: isPreview ? '2px' : '0', padding: '25mm' }}>
        <div className="text-center">
          <div className="w-32 h-px bg-gold-400 mx-auto mb-8"></div>
          <h2 className="text-4xl font-display mb-8">Thank You for Visiting</h2>
          <div className="mb-12">
            <p className="text-xl mb-2 font-elegant">For purchases and enquiries:</p>
            <p className="text-2xl font-display text-gold-400">art@palehall.co.uk</p>
            <p className="text-xl font-body text-gold-300">01678 530 285</p>
          </div>
          
          <div className="pt-8 border-t border-forest-700">
            <p className="text-2xl font-display mb-2">Palé Hall</p>
            <p className="text-lg text-cream-200 font-elegant italic">
              Wales' Finest Country House Hotel & Art Gallery
            </p>
          </div>
          <div className="w-32 h-px bg-gold-400 mx-auto mt-8"></div>
        </div>
      </div>
    </div>);
}

