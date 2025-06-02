<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../controllers/GuestbookController.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$guestbookController = new GuestbookController();

$requestMethod = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Verify cookies for non-GET requests
if ($requestMethod !== 'GET' && $requestMethod !== 'OPTIONS') {
    $sessionId = $_COOKIE['sessionId'] ?? null;
    $accessToken = $_COOKIE['access_token'] ?? null;

    if (!$sessionId || !$accessToken) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentication required']);
        exit();
    }
}

switch ($requestMethod) {
    case 'GET':
        if ($action === 'my-guestbooks') {
            $guestbookController->getUserGuestbooks();
        } else {
            $guestbookController->getEntries();
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid request data']);
            exit();
        }
        $guestbookController->createEntry($data);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}
?>
