import QRCode from 'qrcode'

export function generateUniqueCode() {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `QR-${timestamp}-${random}`.toUpperCase()
}

export async function generateQRCodeDataURL(text) {
  try {
    const qrDataURL = await QRCode.toDataURL(text, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    return qrDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    return null
  }
}

export async function generateMultipleQRCodes(count = 600) {
  const codes = []
  
  for (let i = 0; i < count; i++) {
    const code = generateUniqueCode()
    codes.push(code)
  }
  
  return codes
}