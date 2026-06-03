import QRCode from 'qrcode'

export interface QRStyle {
  theme: 'knight' | 'tech' | 'pharma' | 'luxury' | 'cannabis' | 'minimal'
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
}

export async function generateArtisticQR(
  data: string,
  industryId: string
): Promise<string> {
  // Map industry to QR theme
  const themeMap: Record<string, QRStyle> = {
    cannabis: {
      theme: 'cannabis',
      primaryColor: '#10b981', // Green
      secondaryColor: '#065f46',
    },
    luxury: {
      theme: 'luxury',
      primaryColor: '#fbbf24', // Gold
      secondaryColor: '#92400e',
    },
    electronics: {
      theme: 'tech',
      primaryColor: '#3b82f6', // Blue
      secondaryColor: '#1e3a8a',
    },
    pharmaceuticals: {
      theme: 'pharma',
      primaryColor: '#ef4444', // Medical red
      secondaryColor: '#991b1b',
    },
  }

  const style = themeMap[industryId] || {
    theme: 'minimal',
    primaryColor: '#000000',
    secondaryColor: '#666666',
  }

  // Generate QR code with custom styling
  const qrDataUrl = await QRCode.toDataURL(data, {
    errorCorrectionLevel: 'H', // High - allows for artistic overlays
    margin: 1,
    width: 512,
    color: {
      dark: style.primaryColor,
      light: '#FFFFFF',
    },
  })

  return qrDataUrl
}

export async function generateVerificationURL(
  productId: string,
  truemarkId: string
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://authi-chain.vercel.app'
  return `${baseUrl}/verify/${truemarkId}`
}
