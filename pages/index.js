import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/router'
import { QrCode, Shield, Users } from 'lucide-react'

export default function Home() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user && profile) {
        // Redirigir según el rol del usuario
        if (profile.role === 'admin') {
          router.push('/dashboard')
        } else {
          router.push('/profile')
        }
      } else if (!user) {
        router.push('/auth/login')
      }
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-primary-700">Cargando...</p>
        </div>
      </div>
    )
  }

  // Página de bienvenida (solo se mostrará brevemente antes de la redirección)
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            QR Tickets System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema completo de gestión de entradas con códigos QR. 
            Genera, valida y administra entradas de manera eficiente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Códigos QR Únicos
            </h3>
            <p className="text-gray-600">
              Genera hasta 600 códigos QR únicos para tus eventos y gestiona su estado en tiempo real.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Validación Segura
            </h3>
            <p className="text-gray-600">
              Escanea y valida entradas con seguridad. Control completo sobre el acceso a tus eventos.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Gestión de Usuarios
            </h3>
            <p className="text-gray-600">
              Sistema de roles completo. Administradores y clientes con accesos diferenciados.
            </p>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-500">
            Redirigiendo...
          </p>
        </div>
      </div>
    </div>
  )
}