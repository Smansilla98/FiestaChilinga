import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/+esm';

const SUPABASE_URL = 'https://mbjuhyxhupqpealiekrd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ianVoeHh1cHFwZWFsaWVrcmQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1NTM5MDk4MCwiZXhwIjoyMDcwOTY2OTgwfQ.MWDRToY3GHPKVmW3whXahrmpxJI9vCRvNx34BzIfcbQ';


const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ticketListPage = document.getElementById('ticket-list-page');
const qrPage = document.getElementById('qr-page');
const ticketListElement = document.getElementById('ticket-list');
const ticketNumberDisplay = document.getElementById('ticket-number-display');
const qrcodeContainer = document.getElementById('qrcode');
const backToHomeBtn = document.getElementById('back-to-list-btn');

// Función para cambiar de página
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// Función para cargar las entradas y mostrarlas
async function loadTickets() {
    const { data: entradas, error } = await supabase
        .from('entradas')
        .select('id, numero_entrada, qr_data, validada')
        .order('numero_entrada', { ascending: true });

    if (error) {
        console.error('Error al cargar las entradas:', error.message);
        return;
    }

    ticketListElement.innerHTML = '';
    entradas.forEach(entrada => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>Entrada #${entrada.numero_entrada}</span>
            <button class="qr-button" data-qr-data="${entrada.qr_data}" data-ticket-num="${entrada.numero_entrada}">
                Ver QR
            </button>
        `;
        ticketListElement.appendChild(li);
    });

    // Añade el evento de clic a todos los botones "Ver QR"
    document.querySelectorAll('.qr-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const qrData = e.target.dataset.qrData;
            const ticketNumber = e.target.dataset.ticketNum;
            
            ticketNumberDisplay.textContent = `Entrada #${ticketNumber}`;
            
            // Genera el código QR
            qrcodeContainer.innerHTML = '';
            new QRCode(qrcodeContainer, {
                text: qrData,
                width: 256,
                height: 256
            });
            
            showPage('qr-page');
        });
    });
}

// Evento para regresar a la lista
backToHomeBtn.addEventListener('click', () => {
    showPage('ticket-list-page');
    loadTickets(); // Recarga la lista para ver el estado actualizado
});

// Carga las entradas al inicio
loadTickets();
