import QRCode from 'qrcode'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

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

export async function generatePDFWithQRCodes(codes) {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  for (const code of codes) {
    const page = pdfDoc.addPage([400, 600])
    const { height } = page.getSize()

    // Generar QR en base64 y convertirlo a imagen
    const qrDataURL = await generateQRCodeDataURL(code)
    const qrImageBytes = Buffer.from(qrDataURL.split(',')[1], 'base64')
    const qrImage = await pdfDoc.embedPng(qrImageBytes)

    // Dibujar QR
    const qrDim = 200
    page.drawImage(qrImage, {
      x: 100,
      y: height - 300,
      width: qrDim,
      height: qrDim,
    })

    // Texto del evento
    page.drawText('Fiesta Chilinga 30 años', {
      x: 80,
      y: height - 350,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    })

    page.drawText('Ruiz Huidobro 4228', {
      x: 110,
      y: height - 370,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    })

    page.drawText('Sábado 13 de septiembre 22hs', {
      x: 60,
      y: height - 390,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    })

    // Código único debajo
    page.drawText(`Código: ${code}`, {
      x: 80,
      y: height - 420,
      size: 10,
      font,
      color: rgb(0.2, 0.2, 0.2),
    })
  }

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
