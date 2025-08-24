// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Tomamos las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Falta la URL o la ANON KEY de Supabase en las variables de entorno')
}

// Creamos el cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funciones helper para la base de datos
export const database = {
  // ENTRADAS (QR Codes)
  async createTickets(tickets) {
    const { data, error } = await supabase
      .from('entradas')
      .insert(tickets)
    if (error) console.error('Error creando tickets:', error)
    return { data, error }
  },

  async getAllTickets() {
    const { data, error } = await supabase
      .from('entradas')
      .select(`
        *,
        usuario:usuario_asociado(email, full_name)
      `)
      .order('created_at', { ascending: false })
    if (error) console.error('Error obteniendo tickets:', error)
    return { data, error }
  },

  async getTicketByCode(codigo) {
    const { data, error } = await supabase
      .from('entradas')
      .select(`
        *,
        usuario:usuario_asociado(email, full_name)
      `)
      .eq('codigo', codigo)
      .single()
    if (error) console.error('Error obteniendo ticket por código:', error)
    return { data, error }
  },

  async updateTicketStatus(id, estado, adminId = null) {
    const updateData = { 
      estado,
      updated_at: new Date().toISOString()
    }
    
    if (adminId) updateData.validado_por = adminId

    const { data, error } = await supabase
      .from('entradas')
      .update(updateData)
      .eq('id', id)
    if (error) console.error('Error actualizando ticket:', error)
    return { data, error }
  },

  async getTicketsByUser(userId) {
    const { data, error } = await supabase
      .from('entradas')
      .select('*')
      .eq('usuario_asociado', userId)
    if (error) console.error('Error obteniendo tickets por usuario:', error)
    return { data, error }
  },

  // ESTADÍSTICAS
  async getTicketStats() {
    const count = async (filter = {}) => {
      const { data, error } = await supabase
        .from('entradas')
        .select('id', { count: 'exact', head: true })
        .match(filter)
      if (error) console.error('Error contando entradas:', error)
      return data?.length || 0
    }

    const total = await count()
    const validadas = await count({ estado: 'validado' })
    const pendientes = await count({ estado: 'pendiente' })
    const denegadas = await count({ estado: 'denegado' })

    return { total, validadas, pendientes, denegadas }
  },

  // USUARIOS
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error('Error obteniendo usuarios:', error)
    return { data, error }
  },

  async updateUserRole(userId, role) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
    if (error) console.error('Error actualizando rol de usuario:', error)
    return { data, error }
  },

  async createProfile(user) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email,
        role: 'cliente'
      })
    if (error) console.error('Error creando perfil:', error)
    return { data, error }
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) console.error('Error obteniendo perfil:', error)
    return { data, error }
  }
}
