import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funciones helper para la base de datos
export const database = {
  // ENTRADAS (QR Codes)
  async createTickets(tickets) {
    const { data, error } = await supabase
      .from('entradas')
      .insert(tickets)
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
    return { data, error }
  },

  async updateTicketStatus(id, estado, adminId = null) {
    const updateData = { 
      estado,
      updated_at: new Date().toISOString()
    }
    
    if (adminId) {
      updateData.validado_por = adminId
    }

    const { data, error } = await supabase
      .from('entradas')
      .update(updateData)
      .eq('id', id)
    return { data, error }
  },

  async getTicketsByUser(userId) {
    const { data, error } = await supabase
      .from('entradas')
      .select('*')
      .eq('usuario_asociado', userId)
    return { data, error }
  },

  // ESTADÍSTICAS
  async getTicketStats() {
    const { data: total } = await supabase
      .from('entradas')
      .select('id', { count: 'exact' })
    
    const { data: validadas } = await supabase
      .from('entradas')
      .select('id', { count: 'exact' })
      .eq('estado', 'validado')
    
    const { data: pendientes } = await supabase
      .from('entradas')
      .select('id', { count: 'exact' })
      .eq('estado', 'pendiente')

    const { data: denegadas } = await supabase
      .from('entradas')
      .select('id', { count: 'exact' })
      .eq('estado', 'denegado')

    return {
      total: total?.length || 0,
      validadas: validadas?.length || 0,
      pendientes: pendientes?.length || 0,
      denegadas: denegadas?.length || 0
    }
  },

  // USUARIOS
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async updateUserRole(userId, role) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
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
    return { data, error }
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  }
}