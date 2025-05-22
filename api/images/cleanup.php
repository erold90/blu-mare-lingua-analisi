
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

// Leggi il corpo della richiesta JSON
$input = json_decode(file_get_contents('php://input'), true);
$maxImages = isset($input['maxImages']) ? intval($input['maxImages']) : 50;

// Percorso della directory di archiviazione
$storagePath = __DIR__ . '/storage';
if (!file_exists($storagePath)) {
    echo json_encode(['success' => true, 'message' => 'Storage directory does not exist', 'removedCount' => 0]);
    exit;
}

// Ottiene tutti i file meta
$metaFiles = glob($storagePath . '/*.meta');

// Se ci sono meno file del limite, non fare nulla
if (count($metaFiles) <= $maxImages) {
    echo json_encode(['success' => true, 'message' => 'No cleanup needed', 'removedCount' => 0]);
    exit;
}

// Costruisci un array di file con timestamp
$files = [];
foreach ($metaFiles as $metaFile) {
    $meta = json_decode(file_get_contents($metaFile), true);
    $timestamp = isset($meta['timestamp']) ? intval($meta['timestamp']) : 0;
    $files[] = [
        'metaFile' => $metaFile,
        'timestamp' => $timestamp,
        'dataFile' => str_replace('.meta', '.data', $metaFile)
    ];
}

// Ordina per timestamp (più vecchi prima)
usort($files, function($a, $b) {
    return $a['timestamp'] - $b['timestamp'];
});

// Calcola quanti file rimuovere
$removeCount = count($files) - $maxImages;
$removedCount = 0;

// Rimuovi i file più vecchi
for ($i = 0; $i < $removeCount; $i++) {
    if (file_exists($files[$i]['metaFile']) && unlink($files[$i]['metaFile'])) {
        $removedCount++;
    }
    
    if (file_exists($files[$i]['dataFile']) && unlink($files[$i]['dataFile'])) {
        // Conteggio già incrementato per il file meta
    }
}

// Rispondi con il risultato
echo json_encode([
    'success' => true,
    'message' => $removedCount > 0 ? 'Cleanup completed' : 'No files removed',
    'removedCount' => $removedCount
]);
?>
