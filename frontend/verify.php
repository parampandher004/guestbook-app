<?php
session_start();

include("database.php"); // Connect to DB

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_SESSION["email"];
    $otp = $_POST["otp"];
    $stmt = $conn->prepare("SELECT * FROM pending_users WHERE email = ? AND otp_code = ?");
    $stmt->bind_param("ss", $email, $otp);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        $expiry = $row['otp_expiry'];
        $now = date("Y-m-d H:i:s");

        if ($expiry >= $now) {
            // OTP is valid — proceed with activation
            // You can either update status or move to another table

            // Option 1: Move to `users` table (example)
            $insert = $conn->prepare("INSERT INTO users (username, dob, email, password_hash, url, created_at) VALUES (?, ?, ?, ?, ?, ?)");
            $insert->bind_param("ssssss", $row['username'], $row['dob'], $row['email'], $row['password_hash'], $row['url'],$row['created_at']);
            $insert->execute();

            // Remove from pending
            $delete = $conn->prepare("DELETE FROM pending_users WHERE email = ?");
            $delete->bind_param("s", $email);
            $delete->execute();

            echo "<script>alert('OTP verified!');</script>";
            header("Location: /frontend/pages/profile.html");
        } else {
            $delete = $conn->prepare("DELETE FROM pending_users WHERE email = ?");
            $delete->bind_param("s", $email);
            $delete->execute();
            echo "<script>alert('OTP expired! Please register again.');</script>";
            header("Location: /frontend/pages/signup.html");
        }
    } else {
         $delete = $conn->prepare("DELETE FROM pending_users WHERE email = ?");
         $delete->bind_param("s", $email);
         $delete->execute();
         echo "<script>alert('Invalid OTP. Register Again!');</script>";
         header("Location: /frontend/pages/signup.html");
    }

    $stmt->close();
    $conn->close();
} else {
    echo "Invalid request.";
}
?>
