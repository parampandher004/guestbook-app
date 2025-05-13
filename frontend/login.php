<?php
session_start();
include("database.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        if (password_verify($password, $user['password_hash'])) {
            $_SESSION['username'] = $user['username'];
            header("Location: /frontend/pages/profile.html");
            exit();
        } else {
             header("Location: /frontend/pages/login.html");
        }
    } else {
        echo "Failed";
        
    }

    $stmt->close();
    $conn->close();
} else {
    echo "Invalid request.";
}
?>
