<?php
require_once __DIR__ . '/../middleware/auth_middleware.php';

// Check authentication before processing any request
$userId = checkAuth();

// Handle the protected route
$action = $_GET['action'] ?? '';

switch($action) {
    case 'get_profile':
        // Example protected endpoint
        echo json_encode([
            'success' => true,
            'data' => [
                'userId' => $userId,
                // ... other user data
            ]
        ]);
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
}
