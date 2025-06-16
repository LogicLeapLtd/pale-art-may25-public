export interface Artist {
  id: string
  name: string
  bio: string
  shortBio: string
  portrait: string
  website?: string
  featured: boolean
  inResidence: boolean
  mediums: string[]
  awards?: string[]
  exhibitions?: string[]
  videoIntro?: string
}

export interface Artwork {
  id: string
  title: string
  artistId: string
  artist: Artist
  medium: string
  size: string
  price?: number
  enquireForPrice: boolean
  status: 'available' | 'sold' | 'reserved'
  images: string[]
  story: string
  inRoomImage?: string
  qrCode?: string
  createdAt: Date
  featured: boolean
}

export interface Event {
  id: string
  title: string
  description: string
  date: Date
  type: 'private-view' | 'exhibition' | 'artist-talk'
  featured: boolean
  image?: string
}

export interface Enquiry {
  id: string
  name: string
  email: string
  phone?: string
  artworkId?: string
  message: string
  status: 'new' | 'responded' | 'closed'
  source: 'website' | 'qr-code' | 'in-person'
  createdAt: Date
}