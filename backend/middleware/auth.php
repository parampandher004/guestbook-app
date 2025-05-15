<?php
function authenticateRequest() {
    $accessToken = $_COOKIE['access_token'] ?? null;
    
    if (!$accessToken || $accessToken !== $_SESSION['access_token']) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
    
    return true;
}
