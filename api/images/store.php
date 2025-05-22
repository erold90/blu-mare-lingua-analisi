
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // In produzione, sostituire con il dominio specifico
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestisce le richieste preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Verifica il metodo della richiesta
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Verifica i parametri necessari
if (!isset($_POST['path']) || !isset($_POST['data'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
    exit;
}

// Ottieni i parametri
$path = $_POST['path'];
$data = $_POST['data'];
$category = $_POST['category'] ?? 'general';
$timestamp = $_POST['timestamp'] ?? time();

// Crea la directory di archiviazione se non esiste
$storagePath = __DIR__ . '/storage';
if (!file_exists($storagePath)) {
    mkdir($storagePath, 0755, true);
}

// Sanitizza il percorso dell'immagine per sicurezza
$safePath = preg_replace('/[^a-zA-Z0-9_\-\/]/', '', $path);
$safePath = str_replace('/', '_', $safePath);

// Salva i dati dell'immagine
$imageFile = $storagePath . '/' . $safePath . '.data';
$metaFile = $storagePath . '/' . $safePath . '.meta';

// Salva i dati dell'immagine
if (file_put_contents($imageFile, $data) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save image data']);
    exit;
}

// Salva i metadati dell'immagine
$meta = [
    'path' => $path,
    'category' => $category,
    'timestamp' => $timestamp
];

if (file_put_contents($metaFile, json_encode($meta)) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save image metadata']);
    exit;
}

// Rispondi con successo
echo json_encode([
    'success' => true,
    'message' => 'Image saved successfully',
    'path' => $path
]);
?>
