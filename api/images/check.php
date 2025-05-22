
<?php
/**
 * File utilizzato per verificare se il server è raggiungibile
 * Non esegue alcuna operazione ma semplicemente risponde con un 200 OK
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: HEAD, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestisce le richieste preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

echo json_encode(['success' => true, 'message' => 'Server raggiungibile']);
?>
