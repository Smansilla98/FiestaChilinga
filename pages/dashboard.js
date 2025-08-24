import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { database } from '../lib/supabase'
import { BarChart3, QrCode, Users, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const { isAdmin, loading } = useAuth()
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin()) {
      router.push('/profile')
      return
    }

    if (isAdmin()) {
      loadStats()
    }
  }, [loading, isAdmin])

  const loadStats = async () => {
    try {
      const statsData = await database.getTicketStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading || loadingStats) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        </div>
      </Layout>
    )
  }

  if (!isAdmin()) {
    return null
  }

  const statCards = [
    {
      title: 'Total de Entradas',
      value: stats?.total || 0,
      icon: QrCode,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Entradas Validadas',
      value: stats?.validadas || 0,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Pendientes',
      value: stats?.pendientes || 0,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Denegadas',
      value: stats?.denegadas || 0,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    }
  ]

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Gestiona y monitorea el sistema de entradas QR
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Progreso */}
        {stats && stats.total > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Progreso de validación
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Validadas</span>
                <span>{Math.round((stats.validadas / stats.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.validadas / stats.total) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Pendientes</span>
                <span>{Math.round((stats.pendientes / stats.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.pendientes / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/scanner')}
              className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <QrCode size={20} />
              <span>Escanear QR</span>
            </button>
            
            <button
              onClick={() => router.push('/tickets')}
              className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 size={20} />
              <span>Ver entradas</span>
            </button>
            
            <button
              onClick={() => router.push('/users')}
              className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users size={20} />
              <span>Gestionar usuarios</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}