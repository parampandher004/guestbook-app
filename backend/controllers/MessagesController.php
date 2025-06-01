<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/TokenManager.php';

class MessagesController {
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

    public function getMessages($guestbookId) {
        global $conn;
        header('Content-Type: application/json');

        // Verify if guestbook exists and is accessible
        $stmt = $conn->prepare("
            SELECT * FROM guestbooks 
            WHERE id = ? AND status = 'active'
        ");
        $stmt->bind_param("s", $guestbookId);
        $stmt->execute();
        $guestbook = $stmt->get_result()->fetch_assoc();

        if (!$guestbook) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Guestbook not found']);
            exit();
        }

        // Get messages with user info and reply counts
        $stmt = $conn->prepare("
            SELECT 
                m.*, 
                u.username as user_name,
                (SELECT COUNT(*) FROM replies r WHERE r.message_id = m.id AND r.status = 'active') as reply_count
            FROM messages m
            LEFT JOIN users u ON m.user_id = u.id
            WHERE m.guestbook_id = ? AND m.status = 'active'
            ORDER BY m.created_at DESC
        ");
        $stmt->bind_param("s", $guestbookId);
        $stmt->execute();
        $result = $stmt->get_result();

        $messages = [];
        while ($row = $result->fetch_assoc()) {
            // Get replies for each message
            $reply_stmt = $conn->prepare("
                SELECT r.*, u.username as user_name
                FROM replies r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.message_id = ? AND r.status = 'active'
                ORDER BY r.created_at ASC
            ");
            $reply_stmt->bind_param("s", $row['id']);
            $reply_stmt->execute();
            $replies = $reply_stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            
            $row['replies'] = $replies;
            $messages[] = $row;
        }

        echo json_encode([
            'success' => true,
            'messages' => $messages
        ]);
        exit();
    }

    public function postMessage($data) {
        global $conn;
        header('Content-Type: application/json');

        $userId = $this->getUserIdFromToken();
        $guestbookId = $data['guestbook_id'] ?? '';
        $name = htmlspecialchars($data['name'] ?? '');
        $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
        $message = htmlspecialchars($data['message'] ?? '');
        
        if (!$guestbookId || !$name || !$email || !$message) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit();
        }

        $messageId = uniqid('msg_', true);
        $stmt = $conn->prepare("
            INSERT INTO messages (id, guestbook_id, user_id, name, email, message) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("ssssss", $messageId, $guestbookId, $userId, $name, $email, $message);

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Message posted successfully',
                'messageId' => $messageId
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error posting message']);
        }
        exit();
    }

    public function postReply($data) {
        global $conn;
        header('Content-Type: application/json');

        $userId = $this->getUserIdFromToken();
        $messageId = $data['message_id'] ?? '';
        $name = htmlspecialchars($data['name'] ?? '');
        $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
        $replyText = htmlspecialchars($data['reply_text'] ?? '');
        
        if (!$messageId || !$name || !$email || !$replyText) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'All fields are required']);
            exit();
        }

        $replyId = uniqid('rep_', true);
        $stmt = $conn->prepare("
            INSERT INTO replies (id, message_id, user_id, name, email, reply_text) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("ssssss", $replyId, $messageId, $userId, $name, $email, $replyText);

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Reply posted successfully',
                'replyId' => $replyId
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error posting reply']);
        }
        exit();
    }
}
?>
