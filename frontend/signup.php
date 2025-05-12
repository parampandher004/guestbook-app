<?php
    include("database.php");
    if($conn->connect_error){
        die('Connection failed'.$conn->connect_error);
    }
    else{
        echo "You are connected";
    }
?>
<?php
    require "PHPMailer/PHPMailer.php";
    require "PHPMailer/SMTP.php";
    require "PHPMailer/Exception.php";

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;
    session_start();

    $username = $_POST['username'];
    $dob = $_POST['dob'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $url = !empty($_POST['url']) ? $_POST['url'] : NULL;
    $otp = random_int(100000, 999999);
    $otp_expiry = date("Y-m-d H:i:s", strtotime('+15 minutes'));
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO pending_users (username, dob, email, password_hash, url, otp_code, otp_expiry) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssss", $username, $dob, $email, $password_hash, $url, $otp, $otp_expiry);

    $check = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $check->bind_param('s',$email);
    $check->execute();
    $result = $check->get_result();

    if($result->num_rows == 0){

    if($stmt->execute()){
        $_SESSION['email'] = $email;
        $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp-relay.brevo.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = '8ccaac001@smtp-brevo.com';  // <- this is important
        $mail->Password   = 'X9746YMQSmZvHzJB';             // <- the master password you saw
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->SMTPOptions = array(
                                    'ssl' => array(
                                        'verify_peer' => false,
                                        'verify_peer_name' => false,
                                        'allow_self_signed' => true
                                    )
                                );

        $mail->setFrom('gmstgate@gmail.com', 'Guestbook');
        $mail->addAddress($email, $username); // recipient from your form

        $mail->isHTML(false);
        $mail->Subject = 'Your OTP Code';
        $mail->Body    = "Hi {$username},\n\nYour OTP code is: {$otp}\n\nIt will expire in 15 minutes.";

        if ($mail->send()) {
            header("Location: verify.html");
            exit();
        } else {
            echo "Mailer Error: " . $mail->ErrorInfo;
        }
    } catch (Exception $e) {
        echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
    } 
    else{
          echo "Error: " . $stmt->error;

    }
}
    else{
        header("Location: /frontend/pages/login.html");
    }
    $stmt->close();
    $check->close();
    $conn->close();

?>