<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../controllers/MessagesController.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$messagesController = new MessagesController();

$requestMethod = $_SERVER['REQUEST_METHOD'];

switch ($requestMethod) {
    case 'GET':
        $guestbookId = $_GET['guestbook_id'] ?? null;
        if (!$guestbookId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Guestbook ID is required']);
            exit();
        }
        $messagesController->getMessages($guestbookId);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $_GET['action'] ?? '';
        
        if ($action === 'reply') {
            $messagesController->postReply($data);
        } else {
            $messagesController->postMessage($data);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}
?>
