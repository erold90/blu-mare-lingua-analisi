
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
if (!isset($_POST['path'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Percorso dell\'immagine mancante']);
    exit;
}

// Ottieni il percorso del file
$path = $_POST['path'];

// Rimuovi eventuali slashes iniziali
$path = ltrim($path, '/');

// Percorso completo del file
$basePath = __DIR__ . '/storage';
$filePath = $basePath . '/' . $path;
$metaPath = $filePath . '.meta';

// Verifica se il file esiste
if (!file_exists($filePath)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Immagine non trovata']);
    exit;
}

// Elimina il file immagine
$imageDeleted = unlink($filePath);

// Elimina anche il file dei metadati se esiste
$metaDeleted = true;
if (file_exists($metaPath)) {
    $metaDeleted = unlink($metaPath);
}

// Verifica se l'eliminazione è avvenuta con successo
if ($imageDeleted && $metaDeleted) {
    echo json_encode([
        'success' => true,
        'message' => 'Immagine eliminata con successo',
        'path' => $path
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Errore durante l\'eliminazione dell\'immagine',
        'imageDeleted' => $imageDeleted,
        'metaDeleted' => $metaDeleted
    ]);
}
?>
