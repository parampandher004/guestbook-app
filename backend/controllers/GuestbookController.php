<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/validator.php';
require_once __DIR__ . '/../utils/TokenManager.php';

class GuestbookController {
    private $tokenManager;
    
    public function __construct() {
        global $conn;
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->tokenManager = new TokenManager($conn);
    }

    private function getUserIdFromToken() {
        $sessionId = $_COOKIE['sessionId'] ?? null;
        $accessToken = $_COOKIE['access_token'] ?? null;
        
        if (!$sessionId || !$accessToken) {
            return null;
        }
        
        return $this->tokenManager->verifySession($sessionId, $accessToken);
    }

    public function getEntries() {
        global $conn;
        header('Content-Type: application/json');

        $userId = $this->getUserIdFromToken();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit();
        }

        // Get query parameters
        $visibility = $_GET['visibility'] ?? 'public';
        
        $query = "SELECT g.*, u.username as creator_name 
                 FROM guestbooks g 
                 JOIN users u ON g.creator_id = u.id 
                 WHERE (g.visibility = 'public' 
                 OR (g.visibility = 'private' AND g.creator_id = ?))
                 AND g.status = 'active'
                 ORDER BY g.created_at DESC";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $entries = [];
        while ($row = $result->fetch_assoc()) {
            $entries[] = $row;
        }
        
        echo json_encode(['success' => true, 'entries' => $entries]);
        exit();
    }

    public function createEntry($data) {
        global $conn;
        header('Content-Type: application/json');

        $userId = $this->getUserIdFromToken();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit();
        }

        $title = sanitizeInput($data['title'] ?? '');
        $description = sanitizeInput($data['description'] ?? '');
        $visibility = sanitizeInput($data['visibility'] ?? 'public');
        $id = uniqid();

        if (!$title) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Title is required']);
            exit();
        }

        $stmt = $conn->prepare("INSERT INTO guestbooks (id, creator_id, title, description, visibility) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sisss", $id, $userId, $title, $description, $visibility);

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Guestbook created successfully',
                'id' => $id
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error creating guestbook: ' . $stmt->error
            ]);
        }

        $stmt->close();
        exit();
    }
}
?>
