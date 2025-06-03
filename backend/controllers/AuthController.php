<?php
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../models/User.php';
    require_once __DIR__ . '/../utils/validator.php';
    require_once __DIR__ . '/../utils/TokenManager.php';

    // Update PHPMailer paths if the library is located in backend/libs/PHPMailer
    require __DIR__ . '/../libs/PHPMailer/PHPMailer.php';
    require __DIR__ . '/../libs/PHPMailer/SMTP.php';
    require __DIR__ . '/../libs/PHPMailer/Exception.php';

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    class AuthController {
        private $log_file;
        private $tokenManager;
        
        public function __construct() {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            global $conn;
            $log_dir = __DIR__ . '/../logs';
            if (!is_dir($log_dir)) {
                mkdir($log_dir, 0777, true);
            }
            $this->log_file = $log_dir . '/debug.log';
            $this->tokenManager = new TokenManager($conn);
        }
        
        private function debug_log($message) {
            $timestamp = date('Y-m-d H:i:s');
            file_put_contents($this->log_file, "[$timestamp] $message\n", FILE_APPEND);
        }

        public function login($data) {
            global $conn;
            header('Content-Type: application/json');
            
            $this->debug_log("Login attempt - Session ID: " . session_id());
            
            $email = sanitizeInput($data['email'] ?? '');
            $password = sanitizeInput($data['password'] ?? '');
            
            if (!$email || !$password) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Email and password are required']);
                exit();
            }
            
            $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($user = $result->fetch_assoc()) {
                if (password_verify($password, $user['password_hash'])) {  // Changed from password to password_hash
                    $session = $this->tokenManager->createSession($user['id']);
                    $refreshToken = $this->tokenManager->generateRefreshToken($user['id']);
                    
                    setcookie('sessionId', $session['sessionId'], [
                        'expires' => strtotime($session['expiresAt']),
                        'path' => '/',
                        'httponly' => true,
                        'secure' => false,
                        'samesite' => 'Lax'
                    ]);
                    
                    setcookie('access_token', $session['accessToken'], [
                        'expires' => strtotime($session['expiresAt']),
                        'path' => '/',
                        'httponly' => true,
                        'secure' => false,
                        'samesite' => 'Lax'
                    ]);

                    setcookie('refresh_token', $refreshToken['token'], [
                        'expires' => strtotime($refreshToken['expiresAt']),
                        'path' => '/',
                        'httponly' => true,
                        'secure' => false,
                        'samesite' => 'Lax'
                    ]);
                    
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Login successful'
                    ]);
                    exit();
                } else {
                    http_response_code(401);
                    echo json_encode(['success' => false, 'message' => 'Invalid password']);
                }
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'User not found']);
            }

            $stmt->close();
            $conn->close();
            exit();
        }

        public function signup($data) {
            session_start();
            global $conn; // added global declaration

            $username = sanitizeInput($data['username'] ?? '');
            $dob      = sanitizeInput($data['dob'] ?? '');
            $email    = sanitizeInput($data['email'] ?? '');
            $password = sanitizeInput($data['password'] ?? '');
            $url      = sanitizeInput($data['url'] ?? '');
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
                            http_response_code(200);
                            echo json_encode(['success' => true, 'message' => 'OTP sent successfully']);
                            exit();
                        } else {
                            http_response_code(500);
                            echo json_encode(['success' => false, 'message' => 'Mailer Error: ' . $mail->ErrorInfo]);
                        }
                    } catch (Exception $e) {
                        http_response_code(500);
                        echo json_encode(['success' => false, 'message' => 'Message could not be sent. Mailer Error: ' . $mail->ErrorInfo]);
                    }
                } else{
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Error: ' . $stmt->error]);
                }
            }
        }

        public function verify() {
            session_start();
            global $conn;
            
            $this->debug_log("=== Starting verify process ===");
            $this->debug_log("Session email: " . ($_SESSION["email"] ?? 'not set'));
            $this->debug_log("POST data: " . print_r($_POST, true));
            
            $email = $_SESSION["email"] ?? '';
            $otp = sanitizeInput($_POST["otp"] ?? '');
            
            header("Content-Type: application/json");
            
            if (!$email || !$otp) {
                $this->debug_log("Missing email or OTP");
                ob_clean(); // Clear any previously buffered output
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Session expired or OTP not provided.']);
                exit();
            }
            
            $this->debug_log("Querying DB for email: $email and OTP: $otp");
            $stmt = $conn->prepare("SELECT * FROM pending_users WHERE email = ? AND otp_code = ?");
            $stmt->bind_param("ss", $email, $otp);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($row = $result->fetch_assoc()) {
                $this->debug_log("Found matching record: " . print_r($row, true));
                $expiry = $row['otp_expiry'];
                $now = date("Y-m-d H:i:s");
    
                if ($expiry >= $now) {
                    // OTP is valid — proceed with activation
                    $created_at = $row['created_at'] ?? date("Y-m-d H:i:s"); // fallback if not in row
                    
                    $insert = $conn->prepare("INSERT INTO users (username, dob, email, password_hash, url, created_at) VALUES (?, ?, ?, ?, ?, ?)");
                    $insert->bind_param("ssssss", $row['username'], $row['dob'], $row['email'], $row['password_hash'], $row['url'], $created_at);
                    
                    if ($insert->execute()) {
                        $userId = $insert->insert_id;
                        
                        // Create session and refresh token for new user
                        $session = $this->tokenManager->createSession($userId);
                        $refreshToken = $this->tokenManager->generateRefreshToken($userId);
                        
                        setcookie('sessionId', $session['sessionId'], [
                            'expires' => strtotime($session['expiresAt']),
                            'path' => '/',
                            'httponly' => true,
                            'secure' => false,
                            'samesite' => 'Lax'
                        ]);
                        
                        setcookie('access_token', $session['accessToken'], [
                            'expires' => strtotime($session['expiresAt']),
                            'path' => '/',
                            'httponly' => true,
                            'secure' => false,
                            'samesite' => 'Lax'
                        ]);

                        setcookie('refresh_token', $refreshToken['token'], [
                            'expires' => strtotime($refreshToken['expiresAt']),
                            'path' => '/',
                            'httponly' => true,
                            'secure' => false,
                            'samesite' => 'Lax'
                        ]);
                        
                        // Remove from pending users
                        $delete = $conn->prepare("DELETE FROM pending_users WHERE email = ?");
                        $delete->bind_param("s", $email);
                        $delete->execute();
                        
                        ob_clean();
                        http_response_code(200);
                        echo json_encode([
                            'success' => true, 
                            'message' => 'OTP verified successfully',
                            'debug' => [
                                'sessionCreated' => true,
                                'userId' => $userId
                            ]
                        ]);
                        exit();
                    }
                } else {
                    $delete = $conn->prepare("DELETE FROM pending_users WHERE email = ?");
                    $delete->bind_param("s", $email);
                    $delete->execute();
                    ob_clean();
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'OTP expired! Please register again.']);
                    exit();
                }
            } else {
                $this->debug_log("No matching record found");
                $delete = $conn->prepare("DELETE FROM pending_users WHERE email = ?");
                $delete->bind_param("s", $email);
                $delete->execute();
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid OTP. Register Again!']);
                exit();
            }
    
            $stmt->close();
            $conn->close();
        }

        public function refresh() {
            $refreshToken = $_COOKIE['refresh_token'] ?? null;
            if (!$refreshToken) {
                http_response_code(401);
                echo json_encode(['error' => 'No refresh token']);
                exit();
            }
            
            $userId = $this->tokenManager->verifyRefreshToken($refreshToken);
            if (!$userId) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid refresh token']);
                exit();
            }
            
            $accessToken = $this->tokenManager->generateAccessToken($userId);
            $_SESSION['access_token'] = $accessToken['token'];
            
            setcookie('access_token', $accessToken['token'], [
                'expires' => $accessToken['expires'],
                'path' => '/',
                'httponly' => true,
                'secure' => true,
                'samesite' => 'Strict'
            ]);
            
            echo json_encode(['success' => true]);
        }
        
        public function logout() {
            $sessionId = $_COOKIE['sessionId'] ?? null;
            if ($sessionId) {
                $this->tokenManager->deleteSession($sessionId);
            }
            
            setcookie('sessionId', '', time() - 3600, '/');
            setcookie('access_token', '', time() - 3600, '/');
            setcookie('refresh_token', '', time() - 3600, '/');
            echo json_encode(['success' => true]);
        }

        public function check_auth() {
            header('Content-Type: application/json');
            
            $sessionId = $_COOKIE['sessionId'] ?? null;
            $accessToken = $_COOKIE['access_token'] ?? null;
            $refreshToken = $_COOKIE['refresh_token'] ?? null;
            
            $this->debug_log("Checking auth with sessionId: $sessionId");
            
            if (!$sessionId || !$accessToken) {
                echo json_encode([
                    'authenticated' => false, 
                    'reason' => 'Missing tokens'
                ]);
                exit();
            }
            
            // First try with access token
            $userId = $this->tokenManager->verifySession($sessionId, $accessToken);
            
            // If access token fails but we have refresh token
            if (!$userId && $refreshToken) {
                $this->debug_log("Access token expired, trying refresh token");
                $userId = $this->tokenManager->verifyRefreshToken($refreshToken);
                
                if ($userId) {
                    // Generate new access token
                    $newSession = $this->tokenManager->createSession($userId);
                    
                    setcookie('sessionId', $newSession['sessionId'], [
                        'expires' => strtotime($newSession['expiresAt']),
                        'path' => '/',
                        'httponly' => true,
                        'secure' => false,
                        'samesite' => 'Lax'
                    ]);
                    
                    setcookie('access_token', $newSession['accessToken'], [
                        'expires' => strtotime($newSession['expiresAt']),
                        'path' => '/',
                        'httponly' => true,
                        'secure' => false,
                        'samesite' => 'Lax'
                    ]);
                }
            }
            
            echo json_encode([
                'authenticated' => !empty($userId),
                'tokenRefreshed' => ($userId && !empty($newSession))
            ]);
            exit();
        }
    }
?>
