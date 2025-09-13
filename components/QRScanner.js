"use client"

import { useState, useEffect } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react'
import Button from './ui/Button'
import Card from './ui/Card'

export default function QRScanner({ onScan, onClose, isOpen, responseMessage = "" }) {
  const [result, setResult] = useState('')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  responseMessage = responseMessage || ""

  useEffect(() => {
    if (isOpen) {
      setScanning(true)
      setResult('')
      setError('')
    } else {
      setScanning(false)
    }
  }, [isOpen])

  const handleScan = (results) => {
    if (results && results.length > 0) {
      const text = results[0]?.rawValue
      setResult(text)
      setScanning(false)
      onScan(text)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Camera className="mr-2" size={20} />
            Escanear QR
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => setError('')} variant="secondary">
              Intentar nuevamente
            </Button>
          </div>
        ) : scanning ? (
          <div className="relative">
            <Scanner
              constraints={{ facingMode: 'environment' }}
              onScan={handleScan}
              onError={(err) => {
                console.error(err)
                setError("Error al acceder a la cámara: " + err.message)
                setScanning(false)
              }}
              styles={{ container: { width: '100%' } }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-primary-500 w-48 h-48 rounded-lg animate-pulse"></div>
            </div>
          </div>
        ) : responseMessage ? (
          <div className="text-center py-8">
            {responseMessage.startsWith('✅') ? (
              <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            ) : (
              <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            )}
            <p className={`mb-4 ${responseMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>{responseMessage}</p>
            {result && (
              <p className="text-sm bg-gray-100 p-2 rounded mb-4 font-mono">{result}</p>
            )}
          </div>
        ) : result ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            <p className="text-gray-600 mb-4">QR escaneado exitosamente</p>
            <p className="text-sm bg-gray-100 p-2 rounded mb-4 font-mono">{result}</p>
          </div>
        ) : null}

        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={onClose} variant="secondary">
            Cerrar
          </Button>
          {!scanning && !error && (
            <Button onClick={() => setScanning(true)}>
              Escanear otro
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
