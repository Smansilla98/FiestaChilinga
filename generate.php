<?php
require_once 'config.php';
require_once 'vendor/autoload.php';

use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Color\Color;

$message = '';
$qr_image = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $numero_entrada = filter_input(INPUT_POST, 'numero_entrada', FILTER_VALIDATE_INT);

    if ($numero_entrada === false || $numero_entrada < 1 || $numero_entrada > 600) {
        $message = "Por favor, ingresa un número de entrada válido (1-600).";
    } else {
        // Genera un UUID para el QR
        $qr_data = 'ticket-' . uniqid() . '-' . $numero_entrada;

        // Verifica si la entrada ya existe
        $response = $client->from('entradas')
            ->select('numero_entrada')
            ->eq('numero_entrada', $numero_entrada)
            ->execute();
        
        if (isset($response->data[0])) {
            $message = "La entrada #" . $numero_entrada . " ya existe.";
        } else {
            // Inserta la nueva entrada
            $data = [
                'numero_entrada' => $numero_entrada,
                'qr_data' => $qr_data,
                'validada' => false
            ];
            $response = $client->from('entradas')->insert($data)->execute();

            if (isset($response->data[0])) {
                $message = "¡Entrada #" . $numero_entrada . " generada y guardada exitosamente!";
                
                // Genera el código QR
                $qrCode = QrCode::create($qr_data)
                    ->setSize(300)
                    ->setMargin(10)
                    ->setForegroundColor(new Color(0, 0, 0))
                    ->setBackgroundColor(new Color(255, 255, 255));
                
                $writer = new PngWriter();
                $qr_image = $writer->write($qrCode)->getDataUri();
            } else {
                $message = "Error al guardar la entrada.";
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <title>Generador de Entradas PHP</title>
    <style>
        body { font-family: sans-serif; text-align: center; }
        .container { max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
        input, button { padding: 10px; margin: 5px; }
        .qr-container { margin-top: 20px; }
        .message { margin-top: 15px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Generador de Entradas PHP (Supabase)</h1>
        <form method="post" action="">
            <input type="number" name="numero_entrada" placeholder="Número de entrada (1-600)" min="1" max="600" required>
            <button type="submit">Generar Entrada</button>
        </form>

        <?php if (!empty($message)): ?>
            <p class="message"><?php echo $message; ?></p>
        <?php endif; ?>

        <?php if (!empty($qr_image)): ?>
            <div class="qr-container">
                <img src="<?php echo $qr_image; ?>" alt="Código QR de la entrada">
            </div>
        <?php endif; ?>
    </div>
</body>
</html>