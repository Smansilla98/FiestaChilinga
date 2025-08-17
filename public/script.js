// Este script ya no necesita importar QRCode.
// La librería está disponible globalmente gracias a la etiqueta <script> en el HTML.

// Importa la librería de Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/+esm';

// **Reemplaza con tus claves de Supabase**
const SUPABASE_URL = 'TU_URL_DE_SUPABASE';
const SUPABASE_ANON_KEY = 'TU_KEY_ANON_DE_SUPABASE';

// Inicializa el cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const qrcodeContainer = document.getElementById('qrcode');
const messageElement = document.getElementById('message');
const generateButton = document.getElementById('generateBtn');

// Agrega un "event listener" al botón para manejar la lógica
generateButton.addEventListener('click', async () => {
    const ticketNumber = document.getElementById('ticketNumber').value;
    if (ticketNumber < 1 || ticketNumber > 600 || ticketNumber === '') {
        messageElement.textContent = 'Por favor, ingresa un número válido entre 1 y 600.';
        messageElement.style.color = 'red';
        qrcodeContainer.innerHTML = '';
        return;
    }

    const qrData = `ticket-id-${ticketNumber}-${Date.now()}`;
    
    const { data, error } = await supabase
        .from('entradas')
        .insert([{ numero_entrada: ticketNumber, qr_data: qrData, validada: false }]);

    if (error) {
        if (error.code === '23505') {
            messageElement.textContent = `La entrada #${ticketNumber} ya existe.`;
        } else {
            console.error('Error al guardar la entrada:', error.message);
            messageElement.textContent = 'Error al guardar la entrada.';
        }
        messageElement.style.color = 'red';
        return;
    }
    
    // Ahora, usa la variable global QRCode que la librería puso en el navegador
    qrcodeContainer.innerHTML = '';
    new QRCode(qrcodeContainer, {
        text: qrData,
        width: 180,
        height: 180,
    });

    messageElement.textContent = `¡Entrada #${ticketNumber} generada y guardada exitosamente!`;
    messageElement.style.color = 'green';
});