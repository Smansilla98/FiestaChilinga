// Importa la librería de Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/+esm';
// Importa la librería para generar códigos QR
import QRCode from 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';

// **Reemplaza con tus claves de Supabase**
const SUPABASE_URL = 'https://mbjuhyxhupqpealiekrd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ianVoeHh1cHFwZWFsaWVrcmQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1NTM5MDk4MCwiZXhwIjoyMDcwOTY2OTgwfQ.MWDRToY3GHPKVmW3whXahrmpxJI9vCRvNx34BzIfcbQ';

// Inicializa el cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const qrcodeContainer = document.getElementById('qrcode');
const messageElement = document.getElementById('message');

window.generateAndSaveTicket = async function() {
    const ticketNumber = document.getElementById('ticketNumber').value;
    if (ticketNumber < 1 || ticketNumber > 600 || ticketNumber === '') {
        messageElement.textContent = 'Por favor, ingresa un número válido entre 1 y 600.';
        messageElement.style.color = 'red';
        qrcodeContainer.innerHTML = '';
        return;
    }

    // Genera una cadena única para el QR (puedes usar un UUID para mayor seguridad)
    const qrData = `ticket-id-${ticketNumber}-${Date.now()}`;
    
    // Intenta insertar la entrada en la base de datos de Supabase
    const { data, error } = await supabase
        .from('entradas')
        .insert([{ numero_entrada: ticketNumber, qr_data: qrData, validada: false }]);

    if (error) {
        if (error.code === '23505') { // Código de error para duplicado
            messageElement.textContent = `La entrada #${ticketNumber} ya existe.`;
        } else {
            console.error('Error al guardar la entrada:', error.message);
            messageElement.textContent = 'Error al guardar la entrada.';
        }
        messageElement.style.color = 'red';
        return;
    }
    
    // Limpia el contenedor y genera el QR
    qrcodeContainer.innerHTML = '';
    new QRCode(qrcodeContainer, {
        text: qrData,
        width: 180,
        height: 180,
    });

    messageElement.textContent = `¡Entrada #${ticketNumber} generada y guardada exitosamente!`;
    messageElement.style.color = 'green';
};