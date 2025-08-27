import { db } from '../../lib/supabase'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const { data, error } = await db.getUsers()
        if (error) throw error
        res.status(200).json(data)
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
      break

    case 'POST':
      try {
        const { nombre, apellido, rol = 'cliente' } = req.body
        const { data, error } = await db.createUser(nombre, apellido, rol)
        if (error) throw error
        res.status(201).json(data[0])
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}