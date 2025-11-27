import sqlite3
import os

DB_PATH = os.getenv('DB_PATH', '/app/backend/doord.db')

def init_database():
    """Initialize SQLite database with production schema"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table with unique email constraint
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        user_type TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        business_name TEXT,
        services TEXT,
        description TEXT,
        location TEXT,
        rating REAL DEFAULT 5.0,
        reviews INTEGER DEFAULT 0,
        completed_jobs INTEGER DEFAULT 0,
        response_time TEXT,
        year_established TEXT,
        specialties TEXT,
        price_range TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        pm_code TEXT
    )
    ''')
    
    # Messages table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        recipient_id TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT 0,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (recipient_id) REFERENCES users(id)
    )
    ''')
    
    # Create index on conversation_id for faster queries
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_conversation ON messages(conversation_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_sender ON messages(sender_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_recipient ON messages(recipient_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_type ON users(user_type)')  # Performance optimization
    
    # Orders table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        homeowner_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        service TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        amount REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (homeowner_id) REFERENCES users(id),
        FOREIGN KEY (provider_id) REFERENCES users(id)
    )
    ''')
    
    # AI Chat history table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS ai_chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_session ON ai_chats(session_id)')
    
    conn.commit()
    conn.close()
    print("✅ SQLite database initialized successfully")
    print(f"📁 Database location: {DB_PATH}")

if __name__ == "__main__":
    init_database()
