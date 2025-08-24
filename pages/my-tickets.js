import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { database } from '../lib/supabase'
import { QrCode, CheckCircle, Clock, XCircle, Search } from 'lucide-react'
import { useRouter } from 'next/router'

export default function MyTickets() {
  const { user, isClient, loading } = useAuth()
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isClient()) {
      router.push('/dashboard')
      return
    }

    if (isClient() && user) {
      loadMyTickets()
    }
  }, [loading, isClient, user])

  useEffect(() => {
    filterTickets()
  }, [tickets, searchTerm, statusFilter])

  const loadMyTickets = async () => {
    try {
      const { data, error } = await database.getTicketsByUser(user.id)
      if (error) throw error
      setTickets(data || [])
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoadingTickets(false)
    }
  }

  const filterTickets = () => {
    let filtered = tickets

    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.estado === statusFilter)
    }

    setFilteredTickets(filtered)
  }

  const getStatusInfo = (estado) => {
    const statusConfig = {
      pendiente: {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800',
        text: 'Pendiente',
        description: 'Tu entrada está lista para ser validada'
      },
      validado: {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800',
        text: 'Validado',
        description: 'Tu entrada ha sido utilizada'
      },
      denegado: {
        icon: XCircle,
        color: 'bg-red-100 text-red-800',
        text: 'Denegado',
        description: 'Tu entrada fue rechazada'
      }
    }

    return statusConfig[estado] || statusConfig.pendiente
  }

  if (loading || loadingTickets) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        </div>
      </Layout>
    )
  }

  if (!isClient()) {
    return null
  }

  const stats = {
    total: tickets.length,
    pendientes: tickets.filter(t => t.estado === 'pendiente').length,
    validados: tickets.filter(t => t.estado === 'validado').length,
    denegados: tickets.filter(t => t.estado === 'denegado').length
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Entradas</h1>
          <p className="text-gray-600 mt-2">
            Consulta el estado de tus entradas QR
          </p>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <QrCode className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Validados</p>
                <p className="text-2xl font-bold text-green-600">{stats.validados}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Denegados</p>
                <p className="text-2xl font-bold text-red-600">{stats.denegados}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="validado">Validados</option>
                <option value="denegado">Denegados</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Mostrando {filteredTickets.length} de {tickets.length} entradas
            </div>
          </div>
        </div>

        {/* Lista de entradas */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <QrCode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {tickets.length === 0 ? 'No tienes entradas asignadas' : 'No se encontraron entradas'}
              </h3>
              <p className="text-gray-600">
                {tickets.length === 0
                  ? 'Las entradas aparecerán aquí cuando el administrador te las asigne.'
                  : 'No se encontraron entradas con los filtros aplicados.'
                }
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const statusInfo = getStatusInfo(ticket.estado)
              const StatusIcon = statusInfo.icon

              return (
                <div key={ticket.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                        <QrCode className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 font-mono">
                          {ticket.codigo}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Creado el {new Date(ticket.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        <StatusIcon size={16} />
                        <span>{statusInfo.text}</span>
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        {statusInfo.description}
                      </p>
                    </div>
                  </div>

                  {ticket.estado === 'validado' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Validado el {new Date(ticket.updated_at).toLocaleDateString('es-ES')} a las{' '}
                        {new Date(ticket.updated_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Información adicional */}
        {tickets.length > 0 && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              ¿Cómo funcionan mis entradas?
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• <strong>Pendiente:</strong> Tu entrada está activa y lista para ser escaneada en el evento.</p>
              <p>• <strong>Validado:</strong> Tu entrada ya fue utilizada para ingresar al evento.</p>
              <p>• <strong>Denegado:</strong> Tu entrada fue rechazada por el administrador.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}