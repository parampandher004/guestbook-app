<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../controllers/AuthController.php';

$auth = new AuthController();

// For example, using a simple query parameter to decide the action:
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action'])) {
    $action = $_GET['action'];
    if ($action === 'login') {
        $auth->login($_POST);
    } elseif ($action === 'signup') {
        $auth->signup($_POST);
    } elseif ($action === 'verify') {
        $auth->verify();
    }
}
?>