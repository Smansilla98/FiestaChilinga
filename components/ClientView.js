import { useState, useEffect } from 'react'
import { QrCode, User, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import Modal from './ui/Modal'
import { db } from '../lib/supabase'
import { generateQRCodeDataURL } from '../utils/qr-generator'

export default function ClientView({ user }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [newEntryModal, setNewEntryModal] = useState(false)
  const [formData, setFormData] = useState({ nombre: '', apellido: '', codigo: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadUserEntries()
  }, [user])

  const loadUserEntries = async () => {
    setLoading(true)
    try {
      const { data, error } = await db.getEntries()
      if (data) {
        // Filtrar entradas asociadas al usuario actual por nombre
        const userEntries = data.filter(entry => 
          entry.nombre_asociado?.toLowerCase() === user.nombre.toLowerCase()
        )
        setEntries(userEntries)
      }
    } catch (error) {
      console.error('Error loading entries:', error)
    }
    setLoading(false)
  }

  const handleAssociateEntry = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Verificar si el código existe y no está asociado
      const { data: entry, error } = await db.getEntryByCode(formData.codigo)
      
      if (error || !entry) {
        alert('Código QR no válido')
        setSubmitting(false)
        return
      }

      if (entry.nombre_asociado) {
        alert('Este código QR ya está asociado a otro usuario')
        setSubmitting(false)
        return
      }

      // Asociar la entrada al usuario
      await db.associateEntry(formData.codigo, formData.nombre, formData.apellido)
      
      alert('Entrada asociada exitosamente')
      setNewEntryModal(false)
      setFormData({ nombre: '', apellido: '', codigo: '' })
      loadUserEntries()
    } catch (error) {
      console.error('Error associating entry:', error)
      alert('Error al asociar la entrada')
    }
    setSubmitting(false)
  }

  const showEntryDetails = async (entry) => {
    const qrDataURL = await generateQRCodeDataURL(entry.codigo)
    setSelectedEntry({ ...entry, qrDataURL })
    setModalOpen(true)
  }

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'validado':
        return <CheckCircle className="text-green-500" size={20} />
      case 'pendiente':
        return <Clock className="text-yellow-500" size={20} />
      case 'denegado':
        return <AlertCircle className="text-red-500" size={20} />
      default:
        return <Clock className="text-gray-500" size={20} />
    }
  }

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'validado':
        return 'bg-green-100 text-green-800'
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'denegado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Perfil del Usuario */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary-100 rounded-full">
            <User className="text-primary-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">¡Hola {user.nombre}!</h2>
            <p className="text-gray-600">Aquí puedes ver el estado de tus entradas</p>
          </div>
        </div>
      </Card>

      {/* Estadísticas del Usuario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <QrCode className="mx-auto mb-2 text-primary-500" size={32} />
            <p className="text-2xl font-bold">{entries.length}</p>
            <p className="text-sm text-gray-600">Total de Entradas</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <CheckCircle className="mx-auto mb-2 text-green-500" size={32} />
            <p className="text-2xl font-bold">
              {entries.filter(e => e.estado === 'validado').length}
            </p>
            <p className="text-sm text-gray-600">Entradas Validadas</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <Clock className="mx-auto mb-2 text-yellow-500" size={32} />
            <p className="text-2xl font-bold">
              {entries.filter(e => e.estado === 'pendiente').length}
            </p>
            <p className="text-sm text-gray-600">Entradas Pendientes</p>
          </div>
        </Card>
      </div>

      {/* Botón para Asociar Nueva Entrada */}
      <div className="flex justify-center">
        <Button
          onClick={() => setNewEntryModal(true)}
          className="flex items-center"
        >
          <QrCode className="mr-2" size={18} />
          Asociar Nueva Entrada
        </Button>
      </div>

      {/* Lista de Entradas del Usuario */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Mis Entradas</h3>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <QrCode className="mx-auto mb-4" size={48} />
            <p>No tienes entradas asociadas</p>
            <p className="text-sm">Usa el botón de arriba para asociar una nueva entrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 rounded-lg border transition-colors cursor-pointer hover:shadow-md ${
                  entry.estado === 'validado' ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'
                }`}
                onClick={() => showEntryDetails(entry)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(entry.estado)}
                    <div>
                      <p className="font-medium">Entrada #{entry.codigo.split('-')[1]}</p>
                      <p className="text-sm text-gray-600">
                        Creada: {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(entry.estado)}`}>
                      {entry.estado === 'validado' ? 'Validada' : 
                       entry.estado === 'pendiente' ? 'Pendiente' : 'Denegada'}
                    </span>
                    {entry.validated_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Validada: {new Date(entry.validated_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal para Asociar Nueva Entrada */}
      <Modal
        isOpen={newEntryModal}
        onClose={() => setNewEntryModal(false)}
        title="Asociar Nueva Entrada"
      >
        <form onSubmit={handleAssociateEntry} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido *
            </label>
            <input
              type="text"
              required
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Tu apellido"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código QR *
            </label>
            <input
              type="text"
              required
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
              placeholder="QR-1234567890-ABCDEF"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingresa el código exacto que aparece en tu QR
            </p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              onClick={() => setNewEntryModal(false)}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Asociando...' : 'Asociar Entrada'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Detalles de Entrada */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Detalles de tu Entrada"
      >
        {selectedEntry && (
          <div className="text-center space-y-4">
            {selectedEntry.qrDataURL && (
              <div className={`p-4 rounded-lg ${
                selectedEntry.estado === 'validado' ? 'bg-gray-100' : 'bg-white border'
              }`}>
                <img
                  src={selectedEntry.qrDataURL}
                  alt="Tu código QR"
                  className={`mx-auto ${selectedEntry.estado === 'validado' ? 'opacity-50' : ''}`}
                />
                {selectedEntry.estado === 'validado' && (
                  <p className="text-sm text-gray-500 mt-2">Esta entrada ya fue validada</p>
                )}
              </div>
            )}
            <div className="space-y-2 text-left">
              <p><strong>Código:</strong> <span className="font-mono text-sm">{selectedEntry.codigo}</span></p>
              <p><strong>Estado:</strong>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedEntry.estado)}`}>
                  {selectedEntry.estado === 'validado' ? 'Validada' : 
                   selectedEntry.estado === 'pendiente' ? 'Pendiente' : 'Denegada'}
                </span>
              </p>
              <p><strong>Nombre:</strong> {selectedEntry.nombre_asociado} {selectedEntry.apellido_asociado}</p>
              <p><strong>Creada:</strong> {new Date(selectedEntry.created_at).toLocaleString()}</p>
              {selectedEntry.validated_at && (
                <p><strong>Validada:</strong> {new Date(selectedEntry.validated_at).toLocaleString()}</p>
              )}
            </div>
            {selectedEntry.estado === 'pendiente' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                💡 <strong>Consejo:</strong> Presenta este código QR en el evento para validar tu entrada
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}