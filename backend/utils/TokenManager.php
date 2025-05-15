<?php
class TokenManager {
    private $conn;
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    public function generateAccessToken($userId) {
        return [
            'token' => bin2hex(random_bytes(32)),
            'expires' => time() + 900 // 15 minutes
        ];
    }
    
    public function generateRefreshToken($userId) {
        $token = bin2hex(random_bytes(32));
        $expires = time() + (86400 * 7); // 7 days
        
        $stmt = $this->conn->prepare("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, FROM_UNIXTIME(?))");
        $stmt->bind_param("isi", $userId, $token, $expires);
        $stmt->execute();
        
        return [
            'token' => $token,
            'expires' => $expires
        ];
    }
    
    public function verifyRefreshToken($token) {
        $stmt = $this->conn->prepare("SELECT user_id FROM refresh_tokens WHERE token = ? AND expires_at > NOW()");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            return $row['user_id'];
        }
        return false;
    }

    public function createSession($userId) {
        $sessionId = bin2hex(random_bytes(32));
        $accessToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + 900); // 15 minutes
        
        $stmt = $this->conn->prepare("INSERT INTO sessions (id, user_id, access_token, expires_at) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("siss", $sessionId, $userId, $accessToken, $expiresAt);
        $stmt->execute();
        
        return [
            'sessionId' => $sessionId,
            'accessToken' => $accessToken,
            'expiresAt' => $expiresAt
        ];
    }

    public function verifySession($sessionId, $accessToken) {
        error_log("=== Session Verification Debug ===");
        error_log("SessionID: $sessionId");
        error_log("AccessToken: $accessToken");
        
        // Check if session exists first
        $checkStmt = $this->conn->prepare("SELECT COUNT(*) as count FROM sessions");
        $checkStmt->execute();
        $countResult = $checkStmt->get_result()->fetch_assoc();
        error_log("Total sessions in DB: " . $countResult['count']);
        
        $stmt = $this->conn->prepare("SELECT user_id, expires_at FROM sessions WHERE id = ? AND access_token = ?");
        if (!$stmt) {
            error_log("Prepare failed: " . $this->conn->error);
            return null;
        }
        
        $stmt->bind_param("ss", $sessionId, $accessToken);
        if (!$stmt->execute()) {
            error_log("Execute failed: " . $stmt->error);
            return null;
        }
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        error_log("Query result: " . print_r($row, true));
        
        if (!$row) {
            error_log("No session found for given ID and token");
            return null;
        }
        
        if (strtotime($row['expires_at']) < time()) {
            error_log("Session expired at: " . $row['expires_at']);
            return null;
        }
        
        error_log("Session valid, returning userId: " . $row['user_id']);
        return $row['user_id'];
    }

    public function deleteSession($sessionId) {
        $stmt = $this->conn->prepare("DELETE FROM sessions WHERE id = ?");
        $stmt->bind_param("s", $sessionId);
        return $stmt->execute();
    }
}
