
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // In produzione, sostituire con il dominio specifico
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestisce le richieste preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Configurazione
$uploadsBasePath = __DIR__ . '/../public/uploads/';
$allowedCategories = ['appartamenti', 'hero', 'social', 'favicon'];
$maxFileSize = 10 * 1024 * 1024; // 10MB
$allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Funzione per verificare l'autenticazione
function isAuthenticated() {
    // In un ambiente di produzione, qui andrebbe implementata la vera autenticazione
    // Per ora, restituiamo sempre true per i test
    return true;
}

// Funzione per generare un ID univoco
function generateUniqueId() {
    return uniqid() . '_' . bin2hex(random_bytes(8));
}

// Funzione per ottenere il percorso del file metadata per una categoria
function getMetadataFilePath($category, $apartmentId = null) {
    global $uploadsBasePath;
    
    $path = $uploadsBasePath . $category;
    
    if ($apartmentId) {
        $path .= '/' . $apartmentId;
    }
    
    if (!file_exists($path)) {
        mkdir($path, 0755, true);
    }
    
    return $path . '/index.json';
}

// Funzione per leggere i metadati esistenti
function readMetadata($category, $apartmentId = null) {
    $metadataPath = getMetadataFilePath($category, $apartmentId);
    
    if (file_exists($metadataPath)) {
        $data = file_get_contents($metadataPath);
        return json_decode($data, true) ?: [];
    }
    
    return [];
}

// Funzione per salvare i metadati
function saveMetadata($metadata, $category, $apartmentId = null) {
    $metadataPath = getMetadataFilePath($category, $apartmentId);
    return file_put_contents($metadataPath, json_encode($metadata, JSON_PRETTY_PRINT));
}

// Verifica autenticazione
if (!isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Non autorizzato']);
    exit;
}

// Gestisci diverse azioni in base al parametro 'action'
$action = $_REQUEST['action'] ?? '';

switch ($action) {
    case 'upload':
        handleUpload();
        break;
    case 'list':
        handleList();
        break;
    case 'delete':
        handleDelete();
        break;
    case 'setCover':
        handleSetCover();
        break;
    case 'updateOrder':
        handleUpdateOrder();
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Azione non valida']);
        break;
}

// Funzione per gestire il caricamento delle immagini
function handleUpload() {
    global $uploadsBasePath, $allowedCategories, $allowedMimeTypes, $maxFileSize;
    
    // Verifica metodo della richiesta
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Metodo non consentito']);
        exit;
    }
    
    // Verifica categoria
    $category = $_POST['category'] ?? '';
    if (!in_array($category, $allowedCategories)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Categoria non valida']);
        exit;
    }
    
    // Gestisci l'ID dell'appartamento se presente
    $apartmentId = $_POST['apartmentId'] ?? null;
    $isCover = isset($_POST['isCover']) && $_POST['isCover'] === '1';
    
    // Verifica file caricato
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        $errorMessage = 'Errore durante il caricamento del file';
        if (isset($_FILES['image']['error'])) {
            $errorCode = $_FILES['image']['error'];
            $errorMessage .= " (codice: $errorCode)";
        }
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $errorMessage]);
        exit;
    }
    
    // Verifica dimensione del file
    if ($_FILES['image']['size'] > $maxFileSize) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Il file è troppo grande (massimo ' . ($maxFileSize / 1024 / 1024) . 'MB)'
        ]);
        exit;
    }
    
    // Verifica tipo MIME
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($_FILES['image']['tmp_name']);
    
    if (!in_array($mimeType, $allowedMimeTypes)) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Tipo di file non consentito. Tipi consentiti: JPG, PNG, GIF, WEBP'
        ]);
        exit;
    }
    
    // Crea directory se non esiste
    $uploadDir = $uploadsBasePath . $category;
    
    if ($apartmentId) {
        $uploadDir .= '/' . $apartmentId;
    }
    
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Genera nome file univoco
    $originalName = $_POST['originalName'] ?? $_FILES['image']['name'];
    $timestamp = time();
    $fileExtension = pathinfo($originalName, PATHINFO_EXTENSION);
    $id = generateUniqueId();
    $fileName = $id . '.' . $fileExtension;
    
    // Percorso completo del file
    $filePath = $uploadDir . '/' . $fileName;
    
    // Sposta il file
    if (!move_uploaded_file($_FILES['image']['tmp_name'], $filePath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Errore durante il salvataggio del file']);
        exit;
    }
    
    // Ottieni dimensioni dell'immagine
    $imageSize = getimagesize($filePath);
    $width = $imageSize[0] ?? null;
    $height = $imageSize[1] ?? null;
    
    // Crea metadati
    $metadata = [
        'id' => $id,
        'path' => '/uploads/' . $category . ($apartmentId ? '/' . $apartmentId : '') . '/' . $fileName,
        'originalName' => $originalName,
        'category' => $category,
        'timestamp' => $timestamp,
        'size' => $_FILES['image']['size'],
        'width' => $width,
        'height' => $height
    ];
    
    if ($apartmentId) {
        $metadata['apartmentId'] = $apartmentId;
    }
    
    // Gestisci metadati esistenti
    $existingMetadata = readMetadata($category, $apartmentId);
    
    // Se è un'immagine di copertina, rimuovi il flag dalle altre immagini
    if ($isCover && $apartmentId) {
        foreach ($existingMetadata as &$item) {
            $item['isCover'] = false;
        }
        $metadata['isCover'] = true;
    }
    
    // Aggiungi nuovi metadati
    $existingMetadata[] = $metadata;
    
    // Salva metadati aggiornati
    saveMetadata($existingMetadata, $category, $apartmentId);
    
    // Risposta con successo
    echo json_encode([
        'success' => true,
        'message' => 'Immagine caricata con successo',
        'metadata' => $metadata
    ]);
}

// Funzione per gestire l'elenco delle immagini
function handleList() {
    global $allowedCategories;
    
    // Verifica categoria
    $category = $_GET['category'] ?? '';
    if (!in_array($category, $allowedCategories)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Categoria non valida']);
        exit;
    }
    
    $apartmentId = $_GET['apartmentId'] ?? null;
    
    // Leggi metadati
    $metadata = readMetadata($category, $apartmentId);
    
    // Ordina per timestamp (più recenti prima)
    usort($metadata, function($a, $b) {
        return $b['timestamp'] - $a['timestamp'];
    });
    
    // Risposta
    echo json_encode([
        'success' => true,
        'message' => 'Immagini recuperate con successo',
        'images' => $metadata
    ]);
}

// Funzione per gestire l'eliminazione delle immagini
function handleDelete() {
    global $uploadsBasePath, $allowedCategories;
    
    // Verifica metodo e parametri
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Metodo non consentito']);
        exit;
    }
    
    // Ottieni parametri
    $id = $_POST['id'] ?? '';
    $category = $_POST['category'] ?? '';
    $apartmentId = $_POST['apartmentId'] ?? null;
    
    if (empty($id) || !in_array($category, $allowedCategories)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Parametri mancanti o non validi']);
        exit;
    }
    
    // Leggi metadati
    $metadata = readMetadata($category, $apartmentId);
    
    // Cerca l'immagine nei metadati
    $imageIndex = -1;
    $imageData = null;
    
    foreach ($metadata as $index => $image) {
        if ($image['id'] === $id) {
            $imageIndex = $index;
            $imageData = $image;
            break;
        }
    }
    
    if ($imageIndex === -1 || !$imageData) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Immagine non trovata']);
        exit;
    }
    
    // Costruisci il percorso del file
    $filePath = __DIR__ . '/..' . $imageData['path'];
    
    // Elimina il file
    if (file_exists($filePath) && !unlink($filePath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Impossibile eliminare il file']);
        exit;
    }
    
    // Rimuovi dai metadati
    array_splice($metadata, $imageIndex, 1);
    
    // Salva metadati aggiornati
    saveMetadata($metadata, $category, $apartmentId);
    
    // Risposta con successo
    echo json_encode([
        'success' => true,
        'message' => 'Immagine eliminata con successo',
        'id' => $id
    ]);
}

// Funzione per impostare un'immagine come copertina
function handleSetCover() {
    global $allowedCategories;
    
    // Verifica metodo e parametri
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Metodo non consentito']);
        exit;
    }
    
    // Ottieni parametri
    $id = $_POST['id'] ?? '';
    $apartmentId = $_POST['apartmentId'] ?? '';
    
    if (empty($id) || empty($apartmentId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Parametri mancanti']);
        exit;
    }
    
    // Leggi metadati
    $metadata = readMetadata('appartamenti', $apartmentId);
    
    // Aggiorna flag isCover
    $found = false;
    
    foreach ($metadata as &$image) {
        if ($image['id'] === $id) {
            $image['isCover'] = true;
            $found = true;
        } else {
            $image['isCover'] = false;
        }
    }
    
    if (!$found) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Immagine non trovata']);
        exit;
    }
    
    // Salva metadati aggiornati
    saveMetadata($metadata, 'appartamenti', $apartmentId);
    
    // Risposta con successo
    echo json_encode([
        'success' => true,
        'message' => 'Immagine di copertina impostata con successo'
    ]);
}

// Funzione per aggiornare l'ordine delle immagini
function handleUpdateOrder() {
    // Verifica metodo e parametri
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Metodo non consentito']);
        exit;
    }
    
    // Ottieni parametri
    $apartmentId = $_POST['apartmentId'] ?? '';
    $imageIds = $_POST['imageIds'] ?? '';
    
    if (empty($apartmentId) || empty($imageIds)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Parametri mancanti']);
        exit;
    }
    
    // Decodifica gli ID delle immagini
    $imageIds = json_decode($imageIds, true);
    
    if (!is_array($imageIds)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Formato non valido per gli ID delle immagini']);
        exit;
    }
    
    // Leggi metadati
    $metadata = readMetadata('appartamenti', $apartmentId);
    
    // Crea un array associativo per ordinamento rapido
    $imageMap = [];
    foreach ($metadata as $image) {
        $imageMap[$image['id']] = $image;
    }
    
    // Crea un nuovo array ordinato
    $orderedMetadata = [];
    foreach ($imageIds as $id) {
        if (isset($imageMap[$id])) {
            $orderedMetadata[] = $imageMap[$id];
            unset($imageMap[$id]);
        }
    }
    
    // Aggiungi eventuali immagini rimanenti
    foreach ($imageMap as $image) {
        $orderedMetadata[] = $image;
    }
    
    // Salva metadati aggiornati
    saveMetadata($orderedMetadata, 'appartamenti', $apartmentId);
    
    // Risposta con successo
    echo json_encode([
        'success' => true,
        'message' => 'Ordine delle immagini aggiornato con successo'
    ]);
}
