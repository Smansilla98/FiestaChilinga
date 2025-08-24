import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import QRScanner from '../components/QRScanner'
import { useAuth } from '../contexts/AuthContext'
import { database } from '../lib/supabase'
import { QrCode, CheckCircle, XCircle, Clock, User, Calendar } from 'lucide-react'
import { useRouter } from 'next/router'

export default function Scanner() {
  const { isAdmin, loading, user } = useAuth()
  const [showScanner, setShowScanner] = useState(false)
  const [ticket, setTicket] = useState(null)
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin()) {
      router.push('/profile')
    }
  }, [loading, isAdmin])

  const handleScan = async (qrCode) => {
    setValidating(true)
    setValidationResult(null)
    setTicket(null)
    setShowScanner(false)

    try {
      const { data, error } = await database.getTicketByCode(qrCode)
      
      if (error || !data) {
        setValidationResult({
          success: false,
          message: 'Código QR no válido o no encontrado'
        })
        return
      }

      setTicket(data)

      if (data.estado === 'validado') {
        setValidationResult({
          success: false,
          message: 'Esta entrada ya fue validada anteriormente'
        })
        return
      }

      if (data.estado === 'denegado') {
        setValidationResult({
          success: false,
          message: 'Esta entrada fue denegada'
        })
        return
      }

      setValidationResult({
        success: true,
        message: 'Entrada válida - Lista para validar'
      })

    } catch (error) {
      console.error('Error validating ticket:', error)
      setValidationResult({
        success: false,
        message: 'Error al validar el código QR'
      })
    } finally {
      setValidating(false)
    }
  }

  const validateTicket = async (newStatus) => {
    if (!ticket) return

    setValidating(true)
    try {
      const { error } = await database.updateTicketStatus(
        ticket.id, 
        newStatus, 
        user.id
      )
      
      if (error) throw error

      setValidationResult({
        success: newStatus === 'validado',
        message: newStatus === 'validado' 
          ? '¡Entrada validada exitosamente!' 
          : 'Entrada denegada'
      })

      // Actualizar el ticket local
      setTicket({ ...ticket, estado: newStatus })

    } catch (error) {
      console.error('Error updating ticket:', error)
      setValidationResult({
        success: false,
        message: 'Error al actualizar el estado de la entrada'
      })
    } finally {
      setValidating(false)
    }
  }

  const resetScanner = () => {
    setTicket(null)
    setValidationResult(null)
  }

  if (loading) {
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Escáner QR</h1>
          <p className="text-gray-600 mt-2">
            Escanea y valida códigos QR de entradas
          </p>
        </div>

        {/* Estado inicial - Botón para escanear */}
        {!ticket && !validationResult && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <QrCode className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Listo para escanear
            </h3>
            <p className="text-gray-600 mb-6">
              Toca el botón para abrir el escáner de códigos QR
            </p>
            <button
              onClick={() => setShowScanner(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <QrCode size={20} />
              <span>Escanear código QR</span>
            </button>
          </div>
        )}

        {/* Validando */}
        {validating && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Validando código QR...</p>
          </div>
        )}

        {/* Resultado de la validación */}
        {validationResult && (
          <div className={`rounded-lg shadow-sm border p-6 ${
            validationResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-3">
              {validationResult.success ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <p className={`font-medium ${
                validationResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationResult.message}
              </p>
            </div>
          </div>
        )}

        {/* Información del ticket */}
        {ticket && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información de la entrada
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Código:</span>
                <span className="text-sm text-gray-900 font-mono">{ticket.codigo}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Estado:</span>
                <div className="flex items-center space-x-2">
                  {ticket.estado === 'pendiente' && (
                    <>
                      <Clock size={16} className="text-yellow-500" />
                      <span className="text-sm text-yellow-700">Pendiente</span>
                    </>
                  )}
                  {ticket.estado === 'validado' && (
                    <>
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-sm text-green-700">Validado</span>
                    </>
                  )}
                  {ticket.estado === 'denegado' && (
                    <>
                      <XCircle size={16} className="text-red-500" />
                      <span className="text-sm text-red-700">Denegado</span>
                    </>
                  )}
                </div>
              </div>

              {ticket.usuario && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Usuario:</span>
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-gray-400" />
                    <div className="text-right">
                      <div className="text-sm text-gray-900">{ticket.usuario.full_name}</div>
                      <div className="text-xs text-gray-500">{ticket.usuario.email}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Creado:</span>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones de validación */}
            {ticket.estado === 'pendiente' && validationResult?.success && (
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => validateTicket('validado')}
                  disabled={validating}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle size={20} />
                  <span>Validar entrada</span>
                </button>
                
                <button
                  onClick={() => validateTicket('denegado')}
                  disabled={validating}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <XCircle size={20} />
                  <span>Denegar</span>
                </button>
              </div>
            )}

            <div className="mt-4 text-center">
              <button
                onClick={resetScanner}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Escanear otra entrada
              </button>
            </div>
          </div>
        )}

        {/* Modal del escáner */}
        {showScanner && (
          <QRScanner
            onScan={handleScan}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    </Layout>
  )
}