<?php
function checkAuth() {
    // Start session if not already started
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Check for access token in cookie
    $accessToken = $_COOKIE['access_token'] ?? null;
    
    // Check if token exists and matches session
    if (!$accessToken || !isset($_SESSION['access_token']) || $accessToken !== $_SESSION['access_token']) {
        header('Content-Type: application/json');
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
    
    // Return user ID from session for route handlers to use
    return $_SESSION['user_id'] ?? null;
}
