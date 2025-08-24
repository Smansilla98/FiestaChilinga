import { useState, useRef } from 'react'
import { Camera, X } from 'lucide-react'

const QRScanner = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const startScanning = async () => {
    try {
      setError('')
      setScanning(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Iniciar detección de QR
      scanQRCode()
    } catch (err) {
      setError('No se pudo acceder a la cámara')
      setScanning(false)
    }
  }

  const stopScanning = () => {
    setScanning(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    // Aquí normalmente usarías una librería como jsQR para decodificar el QR
    // Por simplicidad, simularemos la detección
    // En producción, instala jsQR: npm install jsqr
    
    setTimeout(() => {
      if (scanning) {
        scanQRCode()
      }
    }, 100)
  }

  const handleManualInput = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const code = formData.get('qr_code')
    if (code) {
      onScan(code)
      e.target.reset()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Escanear código QR</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Cámara */}
          <div className="text-center">
            {!scanning ? (
              <button
                onClick={startScanning}
                className="flex items-center justify-center space-x-2 w-full py-3 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <Camera size={20} />
                <span>Activar cámara</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-48 object-cover rounded-md bg-gray-100"
                    autoPlay
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <button
                  onClick={stopScanning}
                  className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Detener cámara
                </button>
              </div>
            )}
          </div>

          <div className="text-center text-gray-500">
            <span>o</span>
          </div>

          {/* Input manual */}
          <form onSubmit={handleManualInput} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingresar código manualmente
              </label>
              <input
                type="text"
                name="qr_code"
                placeholder="Código QR"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Validar código
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default QRScanner