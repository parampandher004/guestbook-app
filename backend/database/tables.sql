-- Create refresh_tokens table
CREATE TABLE refresh_tokens (
    token VARCHAR(64) PRIMARY KEY,  -- Primary key is automatically indexed
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    -- Makes queries faster when checking for expired tokens
    INDEX idx_expires (expires_at),
    -- Makes queries faster when looking up user's tokens
    INDEX idx_user (user_id)
);

-- Create sessions table
CREATE TABLE sessions (
    id VARCHAR(64) PRIMARY KEY,  -- Primary key is automatically indexed
    user_id INT NOT NULL,
    access_token VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    -- Makes token verification queries faster
    INDEX idx_token (access_token),
    -- Makes cleanup of expired sessions faster
    INDEX idx_expires (expires_at),
    -- Makes finding user's sessions faster
    INDEX idx_user (user_id)
);
