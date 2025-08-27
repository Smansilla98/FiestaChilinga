import { db } from '../../lib/supabase'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await db.getEntries()
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
      break

    case 'POST':
      try {
        const { codigo, nombre_asociado, apellido_asociado } = req.body
        const { data, error } = await db.createEntry(codigo, nombre_asociado, apellido_asociado)
        if (error) throw error
        res.status(201).json(data[0])
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
      break

    case 'PUT':
      try {
        const { id, estado } = req.body
        const { data, error } = await db.updateEntryStatus(id, estado)
        if (error) throw error
        res.status(200).json(data[0])
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}