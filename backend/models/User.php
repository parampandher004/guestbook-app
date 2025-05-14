<?php
class User {
    public $id;
    public $email;
    public $password;
    public $verified;

    public function __construct($id, $email, $password, $verified = false) {
        $this->id       = $id;
        $this->email    = $email;
        $this->password = $password;
        $this->verified = $verified;
    }

    // ...existing code: methods for saving or fetching user data...
}
?>
