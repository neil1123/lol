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
    
    # Orders table - Enhanced schema
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        homeowner_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        service TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        amount REAL,
        preferred_date TEXT,
        preferred_time TEXT,
        urgency TEXT,
        budget TEXT,
        property_size TEXT,
        additional_requirements TEXT,
        quotation_amount REAL,
        quotation_details TEXT,
        quotation_valid_until TEXT,
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
    
    # Appointments table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        provider_id TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        phone_number TEXT,
        service_type TEXT NOT NULL,
        services TEXT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        address TEXT,
        notes TEXT,
        source TEXT DEFAULT 'manual',
        order_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES users(id)
    )
    ''')
    
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_session ON ai_chats(session_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_appointments_provider ON appointments(provider_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date)')
    
    # Add missing columns to existing tables (for upgrades)
    try:
        cursor.execute('ALTER TABLE orders ADD COLUMN preferred_date TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE orders ADD COLUMN preferred_time TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE orders ADD COLUMN urgency TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE orders ADD COLUMN budget TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE orders ADD COLUMN property_size TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE orders ADD COLUMN additional_requirements TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE orders ADD COLUMN quotation_amount REAL')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE orders ADD COLUMN quotation_details TEXT')
    except:
        pass
    try:
        cursor.execute('ALTER TABLE orders ADD COLUMN quotation_valid_until TEXT')
    except:
        pass
    
    conn.commit()
    conn.close()
    print("✅ SQLite database initialized successfully")
    print(f"📁 Database location: {DB_PATH}")

if __name__ == "__main__":
    init_database()
