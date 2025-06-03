<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/validator.php';
require_once __DIR__ . '/../utils/TokenManager.php';

class UserController {
    private $tokenManager;
    
    public function __construct() {
        global $conn;
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

    public function getUserProfile() {
        global $conn;
        header('Content-Type: application/json');

        $userId = $this->getUserIdFromToken();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit();
        }

        $stmt = $conn->prepare("SELECT id, username, email, dob, url, created_at FROM users WHERE id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($user = $result->fetch_assoc()) {
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found']);
        }
        exit();
    }

    public function updateProfile($data) {
        global $conn;
        header('Content-Type: application/json');

        $userId = $this->getUserIdFromToken();
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit();
        }

        $username = sanitizeInput($data['username'] ?? '');
        $dob = sanitizeInput($data['dob'] ?? '');
        $url = sanitizeInput($data['url'] ?? '');

        $stmt = $conn->prepare("UPDATE users SET username = ?, dob = ?, url = ? WHERE id = ?");
        $stmt->bind_param("sssi", $username, $dob, $url, $userId);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error updating profile']);
        }
        exit();
    }
}
?>
