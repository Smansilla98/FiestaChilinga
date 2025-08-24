import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Calendar, QrCode } from 'lucide-react'

export default function Profile() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">
            Información de tu cuenta
          </p>
        </div>

        {/* Información del perfil */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {profile?.full_name || 'Usuario'}
              </h2>
              <p className="text-gray-600">{profile?.email}</p>
              <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                profile?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {profile?.role === 'admin' ? 'Administrador' : 'Cliente'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Correo electrónico</span>
              </div>
              <p className="text-gray-900">{user.email}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Miembro desde</span>
              </div>
              <p className="text-gray-900">
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'No disponible'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Navegación rápida */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acceso rápido</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile?.role === 'admin' ? (
              <>
                <a
                  href="/dashboard"
                  className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <QrCode className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Dashboard</h4>
                    <p className="text-sm text-gray-600">Ver estadísticas del sistema</p>
                  </div>
                </a>

                <a
                  href="/scanner"
                  className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <QrCode className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Escáner QR</h4>
                    <p className="text-sm text-gray-600">Validar entradas</p>
                  </div>
                </a>

                <a
                  href="/tickets"
                  className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <QrCode className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Entradas</h4>
                    <p className="text-sm text-gray-600">Gestionar códigos QR</p>
                  </div>
                </a>

                <a
                  href="/users"
                  className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Usuarios</h4>
                    <p className="text-sm text-gray-600">Administrar usuarios</p>
                  </div>
                </a>
              </>
            ) : (
              <>
                <a
                  href="/my-tickets"
                  className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <QrCode className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Mis Entradas</h4>
                    <p className="text-sm text-gray-600">Ver el estado de mis entradas</p>
                  </div>
                </a>

                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                    <QrCode className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-500">Próximamente</h4>
                    <p className="text-sm text-gray-400">Más funciones disponibles pronto</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Información de la cuenta */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la cuenta</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">ID de usuario:</span>
              <span className="text-sm text-gray-900 font-mono">{user.id?.slice(0, 8)}...</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Última sesión:</span>
              <span className="text-sm text-gray-900">
                {user.last_sign_in_at 
                  ? new Date(user.last_sign_in_at).toLocaleDateString('es-ES')
                  : 'No disponible'
                }
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Email confirmado:</span>
              <span className={`text-sm font-medium ${
                user.email_confirmed_at ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {user.email_confirmed_at ? 'Sí' : 'Pendiente'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 