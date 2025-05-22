
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
if (!isset($_POST['path']) || !isset($_POST['data']) || !isset($_POST['folder'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Parametri mancanti']);
    exit;
}

// Ottieni i parametri
$path = $_POST['path'];
$data = $_POST['data'];
$folder = $_POST['folder'];
$fileName = $_POST['fileName'] ?? null;
$category = $_POST['category'] ?? 'general';
$timestamp = $_POST['timestamp'] ?? time();
$originalName = $_POST['originalName'] ?? '';

// Pulisci parametri per sicurezza
$safeFolder = preg_replace('/[^a-zA-Z0-9_\-]/', '', $folder);
$safeFileName = $fileName ? preg_replace('/[^a-zA-Z0-9_\-\.]/', '', $fileName) : uniqid() . '.jpg';

// Crea la directory di archiviazione e la sottocartella se non esistono
$basePath = __DIR__ . '/storage';
$folderPath = $basePath . '/' . $safeFolder;

if (!file_exists($basePath)) {
    mkdir($basePath, 0755, true);
}

if (!file_exists($folderPath)) {
    mkdir($folderPath, 0755, true);
}

// Percorsi dei file
$imageFile = $folderPath . '/' . $safeFileName;
$metaFile = $folderPath . '/' . $safeFileName . '.meta';

// Estrai i dati base64 (rimuovi l'header se presente)
if (strpos($data, ';base64,') !== false) {
    $data = explode(';base64,', $data)[1];
}

// Salva i dati dell'immagine
if (file_put_contents($imageFile, base64_decode($data)) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Impossibile salvare i dati dell\'immagine']);
    exit;
}

// Salva i metadati dell'immagine
$meta = [
    'originalPath' => $path,
    'category' => $category,
    'timestamp' => $timestamp,
    'originalName' => $originalName,
    'serverPath' => '/' . $safeFolder . '/' . $safeFileName
];

if (file_put_contents($metaFile, json_encode($meta)) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Impossibile salvare i metadati dell\'immagine']);
    exit;
}

// Rispondi con successo
echo json_encode([
    'success' => true,
    'message' => 'Immagine salvata con successo',
    'originalPath' => $path,
    'serverPath' => '/' . $safeFolder . '/' . $safeFileName
]);
?>
