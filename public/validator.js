import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/+esm';

const SUPABASE_URL = 'https://mbjuhyxhupqpealiekrd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ianVoeHh1cHFwZWFsaWVrcmQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1NTM5MDk4MCwiZXhwIjoyMDcwOTY2OTgwfQ.MWDRToY3GHPKVmW3whXahrmpxJI9vCRvNx34BzIfcbQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const resultElement = document.getElementById('result');

const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.777
};

function onScanSuccess(decodedText, decodedResult) {
    console.log(`QR code detected: ${decodedText}`);
    
    // Detiene el escáner para evitar múltiples lecturas
    html5QrcodeScanner.pause();

    // Lógica para validar la entrada en la base de datos
    validateTicket(decodedText);
}

function onScanFailure(error) {
    // Maneja los errores del escáner (no es crucial para la funcionalidad)
    // console.warn(`Code scan error = ${error}`);
}

const html5QrcodeScanner = new Html5QrcodeScanner("reader", config, /* verbose= */ false);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);

async function validateTicket(qrData) {
    // 1. Busca la entrada en la base de datos
    const { data: entrada, error } = await supabase
        .from('entradas')
        .select('*')
        .eq('qr_data', qrData)
        .single();

    if (error || !entrada) {
        resultElement.textContent = '❌ Entrada no encontrada. Código inválido.';
        resultElement.className = 'invalid';
        html5QrcodeScanner.resume();
        return;
    }

    // 2. Comprueba si ya fue validada
    if (entrada.validada) {
        resultElement.textContent = '❌ ¡Esta entrada ya fue utilizada!';
        resultElement.className = 'invalid';
        html5QrcodeScanner.resume();
        return;
    }

    // 3. Valida la entrada
    const { error: updateError } = await supabase
        .from('entradas')
        .update({ validada: true })
        .eq('id', entrada.id);

    if (updateError) {
        resultElement.textContent = '❌ Error al validar la entrada.';
        resultElement.className = 'invalid';
        html5QrcodeScanner.resume();
        return;
    }

    // 4. Éxito
    resultElement.textContent = `✅ Entrada #${entrada.numero_entrada} validada con éxito.`;
    resultElement.className = 'valid';
    
    // Vuelve a escanear después de 3 segundos
    setTimeout(() => html5QrcodeScanner.resume(), 3000);
}
