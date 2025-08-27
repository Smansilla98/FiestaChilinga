import { useState, useEffect } from 'react'
import { LogIn, QrCode } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { db } from '../lib/supabase'

export default function Home() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    
    try {
      // Verificar si el usuario existe
      const { data: user, error } = await db.getUserByName(username.trim())
      
      if (user) {
        // Usuario existente
        localStorage.setItem('user', JSON.stringify(user))
        if (user.rol === 'admin') {
          window.location.href = '/admin'
        } else {
          window.location.href = '/client'
        }
      } else {
        // Crear nuevo usuario cliente
        const { data: newUser, error: createError } = await db.createUser(
          username.trim(), 
          '', 
          'cliente'
        )
        
        if (createError) {
          alert('Error al crear usuario')
        } else {
          localStorage.setItem('user', JSON.stringify(newUser[0]))
          window.location.href = '/client'
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Error al iniciar sesión')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="p-3 bg-primary-100 rounded-full inline-flex mb-4">
            <QrCode className="text-primary-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Entry System</h1>
          <p className="text-gray-600">Sistema de gestión de entradas con códigos QR</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ingresa tu nombre"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Usa "pepe" para acceso de administrador
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <LogIn className="mr-2" size={18} />
            )}
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🔒 Sistema seguro de autenticación</p>
          <p className="mt-1">Admin: gestión completa | Cliente: solo consulta</p>
        </div>
      </Card>
    </div>
  )
}