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

        // Get query parameters
        $visibility = $_GET['visibility'] ?? 'public';
        
        $query = "SELECT g.*, u.username as creator_name 
                 FROM guestbooks g 
                 JOIN users u ON g.creator_id = u.id 
                 WHERE g.visibility = 'public' 
                 AND g.status = 'active'
                 ORDER BY g.created_at DESC";
        
        $stmt = $conn->prepare($query);
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

    public function getUserGuestbooks() {
        global $conn;
        header('Content-Type: application/json');
        
        $userId = $this->getUserIdFromToken();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit();
        }
        
        $query = "SELECT g.*, u.username as creator_name 
                 FROM guestbooks g 
                 JOIN users u ON g.creator_id = u.id 
                 WHERE g.creator_id = ? 
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

    public function updateEntry($data) {
        global $conn;
        header('Content-Type: application/json');

        $userId = $this->getUserIdFromToken();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit();
        }

        $id = sanitizeInput($data['id'] ?? '');
        $title = sanitizeInput($data['title'] ?? '');
        $description = sanitizeInput($data['description'] ?? '');
        $visibility = sanitizeInput($data['visibility'] ?? '');
        $status = sanitizeInput($data['status'] ?? '');

        // Verify ownership
        $checkStmt = $conn->prepare("SELECT creator_id FROM guestbooks WHERE id = ?");
        $checkStmt->bind_param("s", $id);
        $checkStmt->execute();
        $result = $checkStmt->get_result()->fetch_assoc();

        if (!$result || $result['creator_id'] !== $userId) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Not authorized to edit this guestbook']);
            exit();
        }

        $stmt = $conn->prepare("
            UPDATE guestbooks 
            SET title = ?, description = ?, visibility = ?, status = ?
            WHERE id = ? AND creator_id = ?
        ");
        $stmt->bind_param("sssssi", $title, $description, $visibility, $status, $id, $userId);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Guestbook updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error updating guestbook']);
        }
        exit();
    }
}
?>
