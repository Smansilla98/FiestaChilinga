import { db } from '../../lib/supabase'
import { generateMultipleQRCodes } from '../../utils/qr-generator'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { count = 600 } = req.body
    
    // Generar códigos únicos
    const codes = await generateMultipleQRCodes(count)
    
    // Insertar en la base de datos
    const results = []
    for (const code of codes) {
      const { data, error } = await db.createEntry(code)
      if (error) {
        console.error(`Error creating entry for code ${code}:`, error)
      } else {
        results.push(data[0])
      }
    }

    res.status(200).json({ 
      message: `${results.length} códigos QR generados exitosamente`,
      count: results.length 
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}