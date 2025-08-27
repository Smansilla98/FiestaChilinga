"use client"

import { useState, useEffect } from 'react'
import { Users, QrCode, CheckCircle, Clock, Plus, Scan, Download } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import Modal from './ui/Modal'
import QRScanner from './QRScanner'
import { db } from '../lib/supabase'
import { generateQRCodeDataURL } from '../utils/qr-generator'
import { PDFDocument, rgb } from 'pdf-lib'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, validadas: 0, pendientes: 0 })
  const [entries, setEntries] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsData, entriesData, usersData] = await Promise.all([
        db.getStats(),
        db.getEntries(),
        db.getUsers()
      ])
      
      setStats(statsData)
      setEntries(entriesData.data || [])
      setUsers(usersData.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  const handleQRScan = async (scannedData) => {
    try {
      const { data: entry, error } = await db.getEntryByCode(scannedData)
      
      if (error || !entry) {
        alert('Código QR no válido')
        return
      }

      if (entry.estado === 'validado') {
        alert('Esta entrada ya fue validada')
        return
      }

      const confirmValidation = confirm(
        `¿Validar entrada para: ${entry.nombre_asociado || 'Sin asociar'} ${entry.apellido_asociado || ''}?`
      )
      
      if (confirmValidation) {
        await db.updateEntryStatus(entry.id, 'validado')
        alert('Entrada validada exitosamente')
        loadData()
      }
    } catch (error) {
      console.error('Error processing QR:', error)
      alert('Error al procesar el código QR')
    }
    setScannerOpen(false)
  }

  const generateQRs = async () => {
    if (!confirm('¿Generar 600 nuevos códigos QR? Esta acción puede tomar algunos minutos.')) {
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/generate-qrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 600 })
      })
      
      const result = await response.json()
      alert(result.message)
      loadData()
    } catch (error) {
      console.error('Error generating QRs:', error)
      alert('Error al generar códigos QR')
    }
    setGenerating(false)
  }

  const showEntryDetails = async (entry) => {
    if (entry.codigo) {
      const qrDataURL = await generateQRCodeDataURL(entry.codigo)
      setSelectedEntry({ ...entry, qrDataURL })
      setModalOpen(true)
    }
  }

  // Función para descargar PDF con fondo y QR centrado
  const downloadQRPDF = async (qrDataURL, codigo) => {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([400, 600])
    const { width, height } = page.getSize()

    // Imagen de fondo
    const bgUrl = '/background.jpg' // colocar en public/
    const bgBytes = await fetch(bgUrl).then(res => res.arrayBuffer())
    const bgImage = await pdfDoc.embedPng(bgBytes)
    page.drawImage(bgImage, { x: 0, y: 0, width, height })

    // QR centrado
    const qrBytes = Uint8Array.from(atob(qrDataURL.split(',')[1]), c => c.charCodeAt(0))
    const qrImage = await pdfDoc.embedPng(qrBytes)
    const qrSize = 150
    page.drawImage(qrImage, { x: (width - qrSize)/2, y: (height - qrSize)/2, width: qrSize, height: qrSize })

    // Descargar PDF
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${codigo}.pdf`
    link.click()
  }

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} mr-4`}>
          <Icon className="text-white" size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={QrCode}
          title="Total de Entradas"
          value={stats.total}
          color="bg-primary-500"
        />
        <StatCard
          icon={CheckCircle}
          title="Entradas Validadas"
          value={stats.validadas}
          color="bg-green-500"
        />
        <StatCard
          icon={Clock}
          title="Entradas Pendientes"
          value={stats.pendientes}
          color="bg-yellow-500"
        />
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => setScannerOpen(true)}
          className="flex items-center"
        >
          <Scan className="mr-2" size={18} />
          Escanear QR
        </Button>
        <Button
          onClick={generateQRs}
          disabled={generating}
          variant="secondary"
          className="flex items-center"
        >
          <Plus className="mr-2" size={18} />
          {generating ? 'Generando...' : 'Generar QRs'}
        </Button>
      </div>

      {/* Lista de Entradas */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Entradas Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Código</th>
                <th className="text-left py-2">Asociado a</th>
                <th className="text-left py-2">Estado</th>
                <th className="text-left py-2">Fecha</th>
                <th className="text-left py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 10).map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-mono text-xs">{entry.codigo}</td>
                  <td className="py-2">
                    {entry.nombre_asociado 
                      ? `${entry.nombre_asociado} ${entry.apellido_asociado}` 
                      : 'Sin asociar'}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      entry.estado === 'validado' 
                        ? 'bg-green-100 text-green-800' 
                        : entry.estado === 'pendiente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.estado}
                    </span>
                  </td>
                  <td className="py-2">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    <Button
                      onClick={() => showEntryDetails(entry)}
                      size="sm"
                      variant="secondary"
                    >
                      Ver QR
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Escáner QR */}
      <QRScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleQRScan}
      />

      {/* Modal de Detalles de Entrada */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Detalles de la Entrada"
      >
        {selectedEntry && (
          <div className="text-center space-y-4">
            {selectedEntry.qrDataURL && (
              <>
                <img
                  src={selectedEntry.qrDataURL}
                  alt="QR Code"
                  className="mx-auto"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2 flex items-center justify-center"
                  onClick={() => downloadQRPDF(selectedEntry.qrDataURL, selectedEntry.codigo)}
                >
                  <Download className="mr-2" size={16} /> Descargar PDF
                </Button>
              </>
            )}
            <div className="space-y-2 text-left">
              <p><strong>Código:</strong> {selectedEntry.codigo}</p>
              <p><strong>Estado:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedEntry.estado === 'validado' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedEntry.estado === 'pendiente'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedEntry.estado}
                </span>
              </p>
              {selectedEntry.nombre_asociado && (
                <p><strong>Asociado a:</strong> {selectedEntry.nombre_asociado} {selectedEntry.apellido_asociado}</p>
              )}
              <p><strong>Creado:</strong> {new Date(selectedEntry.created_at).toLocaleString()}</p>
              {selectedEntry.validated_at && (
                <p><strong>Validado:</strong> {new Date(selectedEntry.validated_at).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
