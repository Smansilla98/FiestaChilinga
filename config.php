<?php
require 'vendor/autoload.php';

use Supabase\Client;

$supabase_url = 'https://mbjuhyxhupqpealiekrd.supabase.co';
$supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ianVoeHh1cHFwZWFsaWVrcmQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1NTM5MDk4MCwiZXhwIjoyMDcwOTY2OTgwfQ.MWDRToY3GHPKVmW3whXahrmpxJI9vCRvNx34BzIfcbQ'; // Usa la anon key para el cliente

if (empty($supabase_url) || empty($supabase_key)) {
    die("Error: Las credenciales de Supabase no están configuradas.");
}

$client = new Client($supabase_url, $supabase_key);

// Si se conecta, puedes mostrar una alerta de éxito
echo "<script>alert('Conexión a Supabase establecida correctamente.');</script>";