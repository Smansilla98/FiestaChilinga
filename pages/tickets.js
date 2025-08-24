import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { database } from '../lib/supabase'
import { Plus, Search, Filter, Download, CheckCircle, Clock, XCircle, User } from 'lucide-react'
import { useRouter } from 'next/router'

export default function Tickets() {
  const { isAdmin, loading } = useAuth()
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin()) {
      router.push('/profile')
      return
    }

    if (isAdmin()) {
      loadTickets()
    }
  }, [loading, isAdmin])

  useEffect(() => {
    filterTickets()
  }, [tickets, searchTerm, statusFilter])

  const loadTickets = async () => {
    try {
      const { data, error } = await database.getAllTickets()
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
        ticket.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.usuario?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.usuario?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.estado === statusFilter)
    }

    setFilteredTickets(filtered)
  }

  const generateTickets = async (quantity) => {
    setGenerating(true)
    try {
      const tickets = []
      for (let i = 1; i <= quantity; i++) {
        tickets.push({
          codigo: `QR-${Date.now()}-${i.toString().padStart(4, '0')}`
        })
      }

      const { error } = await database.createTickets(tickets)
      if (error) throw error

      alert(`${quantity} entradas generadas exitosamente`)
      loadTickets()
      setShowGenerateModal(false)
    } catch (error) {
      console.error('Error generating tickets:', error)
      alert('Error al generar entradas')
    } finally {
      setGenerating(false)
    }
  }

  const getStatusBadge = (estado) => {
    const statusConfig = {
      pendiente: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      validado: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'Validado' },
      denegado: { icon: XCircle, color: 'bg-red-100 text-red-800', text: 'Denegado' }
    }

    const config = statusConfig[estado] || statusConfig.pendiente
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        <span>{config.text}</span>
      </span>
    )
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

  if (!isAdmin()) {
    return null
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Entradas</h1>
            <p className="text-gray-600 mt-2">
              Administra todas las entradas del sistema
            </p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            <span>Generar entradas</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por código o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="validado">Validados</option>
                  <option value="denegado">Denegados</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Mostrando {filteredTickets.length} de {tickets.length} entradas
            </div>
          </div>
        </div>

        {/* Tabla de entradas */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay entradas</h3>
              <p className="mt-1 text-sm text-gray-500">
                {tickets.length === 0 
                  ? 'Comienza generando algunas entradas.' 
                  : 'No se encontraron entradas con los filtros aplicados.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario Asociado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Creación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Actualización
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ticket.codigo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(ticket.estado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.usuario ? (
                          <div className="flex items-center space-x-2">
                            <User size={16} className="text-gray-400" />
                            <div>
                              <div className="font-medium">{ticket.usuario.full_name}</div>
                              <div className="text-gray-500">{ticket.usuario.email}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.updated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal para generar entradas */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold mb-4">Generar entradas QR</h3>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const quantity = parseInt(e.target.quantity.value)
                  if (quantity > 0 && quantity <= 1000) {
                    generateTickets(quantity)
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad de entradas
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    max="1000"
                    defaultValue="100"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 1000 entradas</p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={generating}
                    className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {generating ? 'Generando...' : 'Generar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}