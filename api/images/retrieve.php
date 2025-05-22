
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // In produzione, sostituire con il dominio specifico
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestisce le richieste preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Verifica il metodo della richiesta
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Verifica i parametri necessari
if (!isset($_GET['path'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing path parameter']);
    exit;
}

// Ottieni il parametro del percorso
$path = $_GET['path'];

// Sanitizza il percorso dell'immagine per sicurezza
$safePath = preg_replace('/[^a-zA-Z0-9_\-\/]/', '', $path);
$safePath = str_replace('/', '_', $safePath);

// Percorsi dei file
$storagePath = __DIR__ . '/storage';
$imageFile = $storagePath . '/' . $safePath . '.data';

// Verifica se il file esiste
if (!file_exists($imageFile)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Image not found']);
    exit;
}

// Leggi i dati dell'immagine
$data = file_get_contents($imageFile);
if ($data === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to read image data']);
    exit;
}

// Rispondi con i dati dell'immagine
echo json_encode([
    'success' => true,
    'data' => $data,
    'path' => $path
]);
?>
