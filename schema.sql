-- schema.sql
-- Run with: wrangler d1 execute DB_NAME --file=schema.sql

-- Pending subscriptions (awaiting email confirmation)
CREATE TABLE IF NOT EXISTS pending_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    preferences TEXT NOT NULL, -- JSON: {animalType, size, age}
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX idx_pending_token ON pending_subscriptions(token);
CREATE INDEX idx_pending_expires ON pending_subscriptions(expires_at);

-- Active subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    preferences TEXT NOT NULL, -- JSON: {animalType, size, age}
    unsubscribe_token TEXT UNIQUE,
    confirmed_at INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1, -- 1 = active, 0 = unsubscribed
    unsubscribed_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX idx_subscriptions_email ON subscriptions(email);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active);
CREATE INDEX idx_subscriptions_unsubscribe ON subscriptions(unsubscribe_token);

-- Pets table (extended from your existing data)
CREATE TABLE IF NOT EXISTS pets (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'dog' or 'cat'
    breed TEXT,
    age INTEGER,
    age_group TEXT, -- 'young', 'adult', 'senior'
    size TEXT, -- 'small', 'medium', 'large'
    gender TEXT,
    description TEXT,
    image TEXT,
    location TEXT,
    urgent INTEGER DEFAULT 0,
    date_added INTEGER NOT NULL, -- Unix timestamp in milliseconds
    notification_sent INTEGER DEFAULT 0, -- 0 = not sent, 1 = sent
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX idx_pets_date_added ON pets(date_added);
CREATE INDEX idx_pets_notification ON pets(notification_sent);
CREATE INDEX idx_pets_type ON pets(type);

-- Article subscriptions (for future use)
CREATE TABLE IF NOT EXISTS article_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    categories TEXT, -- JSON array of interested categories
    frequency TEXT DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
    unsubscribe_token TEXT UNIQUE,
    is_active INTEGER DEFAULT 1,
    confirmed_at INTEGER NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);

-- Email log (for tracking and debugging)
CREATE TABLE IF NOT EXISTS email_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    type TEXT NOT NULL, -- 'confirmation', 'notification', 'article'
    status TEXT NOT NULL, -- 'sent', 'failed'
    error_message TEXT,
    sent_at INTEGER NOT NULL
);

CREATE INDEX idx_email_log_recipient ON email_log(recipient);
CREATE INDEX idx_email_log_sent_at ON email_log(sent_at);

-- Rate limiting table (prevent abuse)
CREATE TABLE IF NOT EXISTS rate_limits (
    email TEXT PRIMARY KEY,
    subscription_attempts INTEGER DEFAULT 1,
    last_attempt INTEGER NOT NULL,
    blocked_until INTEGER
);

CREATE INDEX idx_rate_limits_blocked ON rate_limits(blocked_until);