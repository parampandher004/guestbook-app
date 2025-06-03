<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../controllers/AuthController.php';

$auth = new AuthController();

if (isset($_GET['action'])) {
    $action = $_GET['action'];
    
    if ($action === 'check_auth') {
        $auth->check_auth();
        exit();
    }
    
    if ($action === 'logout') {
        $auth->logout();
        exit();
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        switch($action) {
            case 'login':
                $auth->login($_POST);
                break;
            case 'signup':
                $auth->signup($_POST);
                break;
            case 'verify':
                $auth->verify();
                break;
            case 'logout':
                $auth->logout();
                break;
        }
    }
}
?>