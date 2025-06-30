export interface PriceInfo {
  type: 'price' | 'poa' | 'zero'
  value: number | null
  display: string
  isPurchasable: boolean
}

export function parsePrice(priceString: string): PriceInfo {
  // Clean the string
  const cleaned = priceString.trim()
  
  // Check for POA (Price on Application)
  if (cleaned.toUpperCase() === 'POA' || cleaned.toUpperCase() === 'P.O.A.') {
    return {
      type: 'poa',
      value: null,
      display: 'POA',
      isPurchasable: false
    }
  }
  
  // Remove currency symbols and commas
  const numericString = cleaned.replace(/[£$€,]/g, '').trim()
  
  // Try to parse as number
  const numericValue = parseFloat(numericString)
  
  if (isNaN(numericValue)) {
    // Not a valid number, treat as POA
    return {
      type: 'poa',
      value: null,
      display: cleaned,
      isPurchasable: false
    }
  }
  
  if (numericValue <= 0) {
    // Zero or negative price
    return {
      type: 'zero',
      value: 0,
      display: '£0',
      isPurchasable: false
    }
  }
  
  // Valid price - store as pence (multiply by 100)
  const priceInPence = Math.round(numericValue * 100)
  return {
    type: 'price',
    value: priceInPence,
    display: formatPrice(priceInPence),
    isPurchasable: true
  }
}

export function formatPrice(pence: number, currency: string = 'GBP'): string {
  const pounds = pence / 100
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(pounds)
}

export function isProductPurchasable(product: { price: string, status?: string | null }): boolean {
  // Check if product is available
  if (product.status !== 'available') {
    return false
  }
  
  // Check if price is valid
  const priceInfo = parsePrice(product.price)
  return priceInfo.isPurchasable
}