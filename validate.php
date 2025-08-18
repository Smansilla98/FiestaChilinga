<?php
require_once 'config.php';
require_once 'vendor/autoload.php';

$message = '';
$message_class = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $qr_data = filter_input(INPUT_POST, 'qr_data', FILTER_SANITIZE_STRING);

    if (empty($qr_data)) {
        $message = "Por favor, escanea un código QR para validar.";
        $message_class = 'error';
    } else {
        // Busca la entrada por el dato del QR
        $response = $client->from('entradas')
            ->select('*')
            ->eq('qr_data', $qr_data)
            ->execute();
        
        if (isset($response->data[0])) {
            $entrada = $response->data[0];
            
            if ($entrada->validada) {
                $message = "❌ ¡Esta entrada ya ha sido utilizada!";
                $message_class = 'error';
            } else {
                // Actualiza el estado a validado
                $updateResponse = $client->from('entradas')
                    ->update(['validada' => true])
                    ->eq('id', $entrada->id)
                    ->execute();
                
                if (isset($updateResponse->data[0])) {
                    $message = "✅ Entrada #" . $entrada->numero_entrada . " validada con éxito.";
                    $message_class = 'success';
                } else {
                    $message = "Error al validar la entrada.";
                    $message_class = 'error';
                }
            }
        } else {
            $message = "❌ Código de entrada inválido o no encontrado.";
            $message_class = 'error';
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <title>Validador de Entradas PHP (Supabase)</title>
    <style>
        body { font-family: sans-serif; text-align: center; }
        .container { max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
        input, button { padding: 10px; margin: 5px; }
        .message { margin-top: 15px; font-weight: bold; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Validador de Entradas PHP (Supabase)</h1>
        <form method="post" action="">
            <input type="text" name="qr_data" placeholder="Pega aquí el dato del QR" required>
            <button type="submit">Validar</button>
        </form>
        <?php if (!empty($message)): ?>
            <p class="message <?php echo $message_class; ?>"><?php echo $message; ?></p>
        <?php endif; ?>
    </div>
</body>
</html>