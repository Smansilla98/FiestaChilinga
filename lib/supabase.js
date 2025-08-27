import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Funciones de utilidad para la base de datos
export const db = {
  // Usuarios
  async createUser(nombre, apellido, rol = 'cliente') {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nombre, apellido, rol }])
      .select()
    return { data, error }
  },

  async getUsers() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getUserByName(nombre) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('nombre', nombre.toLowerCase())
      .single()
    return { data, error }
  },

  // Entradas QR
  async createEntry(codigo, nombre_asociado = null, apellido_asociado = null) {
    const { data, error } = await supabase
      .from('entradas_qr')
      .insert([{ codigo, nombre_asociado, apellido_asociado }])
      .select()
    return { data, error }
  },

  async getEntries() {
    const { data, error } = await supabase
      .from('entradas_qr')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getEntryByCode(codigo) {
    const { data, error } = await supabase
      .from('entradas_qr')
      .select('*')
      .eq('codigo', codigo)
      .single()
    return { data, error }
  },

  async updateEntryStatus(id, estado) {
    const { data, error } = await supabase
      .from('entradas_qr')
      .update({ 
        estado, 
        validated_at: estado === 'validado' ? new Date().toISOString() : null 
      })
      .eq('id', id)
      .select()
    return { data, error }
  },

  async associateEntry(codigo, nombre, apellido) {
    const { data, error } = await supabase
      .from('entradas_qr')
      .update({ nombre_asociado: nombre, apellido_asociado: apellido })
      .eq('codigo', codigo)
      .select()
    return { data, error }
  },

  // Estadísticas
  async getStats() {
    const { data: total, error: errorTotal } = await supabase
      .from('entradas_qr')
      .select('id', { count: 'exact' })
    
    const { data: validadas, error: errorValidadas } = await supabase
      .from('entradas_qr')
      .select('id', { count: 'exact' })
      .eq('estado', 'validado')
    
    const { data: pendientes, error: errorPendientes } = await supabase
      .from('entradas_qr')
      .select('id', { count: 'exact' })
      .eq('estado', 'pendiente')

    return {
      total: total?.length || 0,
      validadas: validadas?.length || 0,
      pendientes: pendientes?.length || 0,
      errors: [errorTotal, errorValidadas, errorPendientes].filter(Boolean)
    }
  }
}